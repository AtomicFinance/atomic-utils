import { DualFundingTxFinalizer } from '@node-dlc/core';
import { FundingInputV0 } from '@node-dlc/messaging';
const p2wpkhSPK = Buffer.from(
  '0014663117d27e78eb432505180654e603acb30e8a4a',
  'hex',
);

/**
 * Build a DualFundingTxFinalizer, which is used to
 * help calculate contract premium after network fees (assuming 1 funding input for both parties)
 *
 * @param feeRate
 * @returns DualFundingTxFinalizer
 */
export const buildDualFundingTxFinalizer = (
  feeRate: number,
): DualFundingTxFinalizer => {
  if (feeRate < 0) {
    throw new Error('Fee rate must be non-negative');
  }

  const fundingInput = new FundingInputV0();

  fundingInput.maxWitnessLen = 108;
  fundingInput.redeemScript = Buffer.from([]);

  // assuming 1 utxo for funding
  const finalizer = new DualFundingTxFinalizer(
    [fundingInput],
    p2wpkhSPK,
    p2wpkhSPK,
    [fundingInput],
    p2wpkhSPK,
    p2wpkhSPK,
    BigInt(feeRate),
  );

  return finalizer;
};

type FeeConfig = {
  serviceFees: number;
  mmDiscount: number;
};

export class PremiumCalculator {
  constructor(readonly feeConfig: FeeConfig) {}

  /**
   * Calculates the premium received by the contract offeror after fees.
   *
   * If network fees exceed the fee collected by the service provider, no service fees are applied.
   *
   * @param premium premium received by the contract offeror in sats
   * @param feeRate sat/byte fee rate
   * @returns
   */
  calculatePostFeePremium = (premium: number, feeRate: number): number => {
    const finalizer = buildDualFundingTxFinalizer(feeRate);

    const acceptFees = finalizer.acceptFees,
      offerFees = finalizer.offerFees;

    const mmPremium =
      BigInt(Math.floor(premium * (1 - this.feeConfig.mmDiscount))) -
      acceptFees -
      offerFees;
    const maxPremium = BigInt(
      Math.floor(
        premium *
          (1 - (this.feeConfig.mmDiscount + this.feeConfig.serviceFees)),
      ),
    );

    const actualPremium = mmPremium > maxPremium ? maxPremium : mmPremium;
    return Number(actualPremium);
  };

  /**
   * Calculates the premium received by the contract offeror before fees.
   *
   * @param premium premium received by the contract offeror in sats
   * @param feeRate sat/byte fee rate
   * @returns
   */
  calculatePreFeePremium = (premium: number, feeRate: number): number => {
    const finalizer = buildDualFundingTxFinalizer(feeRate);

    const acceptFees = finalizer.acceptFees,
      offerFees = finalizer.offerFees;

    const premiumBeforeMmPremium = Number(
      (premium + Number(acceptFees + offerFees)) /
        (1 - this.feeConfig.mmDiscount),
    );
    const premiumBeforeMaxPremium = Number(
      premium / (1 - (this.feeConfig.mmDiscount + this.feeConfig.serviceFees)),
    );

    let postFeeMmPremium = 0,
      postFeeMaxPremium = 0;
    try {
      postFeeMmPremium = this.calculatePostFeePremium(
        premiumBeforeMmPremium,
        feeRate,
      );
    } catch (e) {
      // Failed premiumBeforeMmPremium
    }

    try {
      postFeeMaxPremium = this.calculatePostFeePremium(
        premiumBeforeMaxPremium,
        feeRate,
      );
    } catch (e) {
      // Failed premiumBeforeMaxPremium
    }

    switch (premium) {
      case postFeeMmPremium:
        return premiumBeforeMmPremium;
      case postFeeMaxPremium:
        return premiumBeforeMaxPremium;
      default:
        throw Error(
          `calculatePreFeePremium failed, could not find post fee premium. Premium: ${premium}, feeRate: ${feeRate}, premiumBeforeMmPremium: ${premiumBeforeMmPremium}, premiumBeforeMaxPremium ${premiumBeforeMaxPremium}`,
        );
    }
  };
}
