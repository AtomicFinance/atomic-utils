import chai from 'chai';

import {
  composeInstrumentName,
  getStrDate,
  parseInstrumentName,
} from '../../lib';

const expect = chai.expect;

describe('Deribit utilities', () => {
  describe('getStrDate', () => {
    it('should correctly build a Deribit formatted date for 14MAY22', () => {
      const date = new Date(Date.UTC(2022, 4, 14, 8, 0, 0));
      const strDate = getStrDate(date.getTime() / 1000);

      expect(strDate).to.equal('14MAY22');
    });

    it('should correctly build a Deribit formatted date for 31DEC22', () => {
      const date = new Date(Date.UTC(2022, 11, 31, 8, 0, 0));
      const strDate = getStrDate(date.getTime() / 1000);

      expect(strDate).to.equal('31DEC22');
    });
  });

  describe('composeInstrumentName', () => {
    it('should correctly compose a call option with $120,000 strike price', () => {
      const expiry = new Date('2019-01-01T08:00:00.000Z');
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
      const expiry = new Date('2019-01-01T08:00:00.000Z');
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
      const expiry = new Date('2019-01-01T08:00:00.000Z');
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

      expect(parsedExpiry.getTime()).to.equal(expiry.getTime());
      expect(parsedStrikePrice).to.equal(strikePrice);
      expect(parsedType).to.equal(type);
    });

    it('should correctly parse a put option with $45,000 strike price', () => {
      const expiry = new Date('2019-01-01T08:00:00.000Z');
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

      expect(parsedExpiry.getTime()).to.equal(expiry.getTime());
      expect(parsedStrikePrice).to.equal(strikePrice);
      expect(parsedType).to.equal(type);
    });

    it('should throw an error if the instrument name is invalid', () => {
      const instrumentName = 'BTC-PERPETUAL-C';

      expect(() => parseInstrumentName(instrumentName)).to.throw(
        Error,
        `Unsupported instrument name: ${instrumentName}`,
      );
    });
  });
});
