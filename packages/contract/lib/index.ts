import {
  CONTRACT_MM_DISCOUNT,
  CONTRACT_SERVICE_FEES,
} from '@atomicfinance/constants';
import { DualFundingTxFinalizer } from '@node-dlc/core';
import { FundingInputV0 } from '@node-dlc/messaging';
const p2wpkhSPK = Buffer.from(
  '0014663117d27e78eb432505180654e603acb30e8a4a',
  'hex',
);

const buildFinalizer = (feeRate: number) => {
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

/**
 * Calcuates the premium received by the contract offeror after fees.
 *
 * If network fees exceed the fee collected by the service provider, no service fees are applied.
 *
 * @param premium
 * @param feeRate
 * @returns
 */
export const calculatePostFeePremium = (
  premium: number,
  feeRate: number,
): number => {
  const finalizer = buildFinalizer(feeRate);

  const acceptFees = finalizer.acceptFees,
    offerFees = finalizer.offerFees;

  const mmPremium =
    BigInt(Math.floor(premium * (1 - CONTRACT_MM_DISCOUNT))) -
    acceptFees -
    offerFees;
  const maxPremium = BigInt(
    Math.floor(premium * (1 - (CONTRACT_MM_DISCOUNT + CONTRACT_SERVICE_FEES))),
  );

  const actualPremium = mmPremium > maxPremium ? maxPremium : mmPremium;
  return Number(actualPremium);
};

/**
 * Calcluate the premium received by the contract offeror before fees.
 *
 * @param premium
 * @param feeRate
 * @returns
 */
export const calculatePreFeePremium = (
  premium: number,
  feeRate: number,
): number => {
  const finalizer = buildFinalizer(feeRate);

  const acceptFees = finalizer.acceptFees,
    offerFees = finalizer.offerFees;

  const premiumBeforeMmPremium = Number(
    (premium + Number(acceptFees + offerFees)) / (1 - CONTRACT_MM_DISCOUNT),
  );
  const premiumBeforeMaxPremium = Number(
    premium / (1 - (CONTRACT_MM_DISCOUNT + CONTRACT_SERVICE_FEES)),
  );

  let postFeeMmPremium = 0,
    postFeeMaxPremium = 0;
  try {
    postFeeMmPremium = calculatePostFeePremium(premiumBeforeMmPremium, feeRate);
  } catch (e) {
    // Failed premiumBeforeMmPremium
  }

  try {
    postFeeMaxPremium = calculatePostFeePremium(
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
