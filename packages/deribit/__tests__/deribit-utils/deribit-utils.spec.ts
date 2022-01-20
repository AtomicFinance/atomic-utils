import chai from 'chai';

import { composeInstrumentName, parseInstrumentName } from '../../lib';

const expect = chai.expect;

describe('Deribit utilities', () => {
  describe('composeInstrumentName', () => {
    it('should correctly compose a call option with $120,000 strike price', () => {
      const expiry = new Date('2019-01-01T08:00:00.000Z').getTime() / 1000;
      const strikePrice = 120000;
      const type = 'call';

      const instrumentName = composeInstrumentName({
        expiry,
        type,
        strikePrice,
      });

      expect(instrumentName).to.equal('BTC-1JAN19-120000-C');
    });

    it('should correctly compose a put option with $45,000 strike price', () => {
      const expiry = new Date('2019-01-01T08:00:00.000Z').getTime() / 1000;
      const strikePrice = 45000;
      const type = 'put';

      const instrumentName = composeInstrumentName({
        expiry,
        type,
        strikePrice,
      });

      expect(instrumentName).to.equal('BTC-1JAN19-45000-P');
    });
  });

  describe('parseInstrumentName', () => {
    it('should correctly parse a call option with $120,000 strike price', () => {
      const expiry = new Date('2019-01-01T08:00:00.000Z').getTime() / 1000;
      const strikePrice = 120000;
      const type = 'call';

      const instrumentName = composeInstrumentName({
        expiry,
        type,
        strikePrice,
      });

      expect(instrumentName).to.equal('BTC-1JAN19-120000-C');

      const {
        expiry: parsedExpiry,
        strikePrice: parsedStrikePrice,
        type: parsedType,
      } = parseInstrumentName(instrumentName);

      expect(parsedExpiry).to.equal(expiry);
      expect(parsedStrikePrice).to.equal(strikePrice);
      expect(parsedType).to.equal(type);
    });

    it('should correctly parse a put option with $45,000 strike price', () => {
      const expiry = new Date('2019-01-01T08:00:00.000Z').getTime() / 1000;
      const strikePrice = 45000;
      const type = 'put';

      const instrumentName = composeInstrumentName({
        expiry,
        type,
        strikePrice,
      });

      expect(instrumentName).to.equal('BTC-1JAN19-45000-P');

      const {
        expiry: parsedExpiry,
        strikePrice: parsedStrikePrice,
        type: parsedType,
      } = parseInstrumentName(instrumentName);

      expect(parsedExpiry).to.equal(expiry);
      expect(parsedStrikePrice).to.equal(strikePrice);
      expect(parsedType).to.equal(type);
    });
  });
});
