import { toSats } from '@atomic-utils/format';
import chai from 'chai';

import {
  buildDualFundingTxFinalizer,
  calculatePostFeePremium,
  calculatePreFeePremium,
} from '../../lib';

const expect = chai.expect;

describe('Contract utilities', () => {
  describe('calculatePreFeePremium / calculatePostFeePremium', () => {
    it('should correctly calculate premium when using max premium', () => {
      const premium = toSats(0.0225);
      const feeRate = 5;

      const postFreePremium = calculatePostFeePremium(premium, feeRate);
      const preFeePremium = calculatePreFeePremium(postFreePremium, feeRate);

      expect(premium).to.equal(preFeePremium);
    });

    it('should correctly calculate premium when using mm premium', () => {
      const premium = toSats(0.001);
      const feeRate = 70;

      const postFreePremium = calculatePostFeePremium(premium, feeRate);
      const preFeePremium = calculatePreFeePremium(postFreePremium, feeRate);

      expect(premium).to.equal(preFeePremium);
    });

    it('should correctly calculate best bid price from post fee premium', () => {
      const feeRate = 5;

      const contractSize = toSats(5);
      const bestBidPrice = 0.021;
      const expectedPremium = 8400000;

      const actualPremium = calculatePostFeePremium(
        bestBidPrice * contractSize,
        feeRate,
      );

      expect(expectedPremium).to.equal(actualPremium);

      const preFeePremium = calculatePreFeePremium(expectedPremium, feeRate);
      const calculatedBestBidPrice = preFeePremium / contractSize;

      expect(calculatedBestBidPrice).to.equal(bestBidPrice);
    });

    it('should throw error when fee rate is less than 0', () => {
      const premium = 8400000;
      const fee = 0;

      expect(() => calculatePreFeePremium(premium, fee)).to.throw(
        Error,
        `Fee rate must be greater than 0`,
      );
    });
  });

  describe('buildDualFundingTxFinalizer', () => {
    it('should properly build a DualFundingTxFinalizer and calculate fees', () => {
      const feeRate = 5;
      const finalizer = buildDualFundingTxFinalizer(feeRate);

      const acceptFees = finalizer.acceptFees,
        offerFees = finalizer.offerFees;

      expect(acceptFees).to.equal(BigInt(1055));
      expect(offerFees).to.equal(BigInt(1055));
    });

    it('should throw an error if fee rate is less than 0', () => {
      const feeRate = -5;

      expect(() => buildDualFundingTxFinalizer(feeRate)).to.throw(
        Error,
        'Fee rate must be greater than 0',
      );
    });
  });
});
