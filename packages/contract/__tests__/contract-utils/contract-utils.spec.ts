import { toSats } from '@atomic-utils/format';
import chai from 'chai';

import { calculatePostFeePremium, calculatePreFeePremium } from '../../lib';

const expect = chai.expect;

describe('calculatePreFeePremium', () => {
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
});
