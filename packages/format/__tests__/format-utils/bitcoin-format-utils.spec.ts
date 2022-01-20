import chai from 'chai';

import { roundBTC, toBTC, toSats } from '../../lib/bitcoin';

const expect = chai.expect;

describe('Bitcoin formatting utilities', () => {
  describe('toBTC', () => {
    it('should correctly convert a single satoshi to BTC', () => {
      const btc = toBTC(1);

      expect(btc).to.equal(0.00000001);
    });

    it('should correctly convert a string of satoshis to BTC', () => {
      const btc = toBTC('1');

      expect(btc).to.equal(0.00000001);
    });

    it('should correctly convert 125,000 satoshis to BTC', () => {
      const btc = toBTC(125000);

      expect(btc).to.equal(0.00125);
    });

    it('should correctly convert 4,250,215 satoshis to BTC, rounded to four decimal places', () => {
      const btc = toBTC(42500215, 4);

      expect(btc).to.equal(0.425);
    });
  });

  describe('toSats', () => {
    it('should correctly convert 1 BTC to satoshis', () => {
      const sats = toSats(1);

      expect(sats).to.equal(1e8);
    });

    it('should correctly convert a string of BTC to satoshis', () => {
      const sats = toSats('0.02313');

      expect(sats).to.equal(2313000);
    });

    it('should correctly convert 0.00125 BTC to satoshis', () => {
      const sats = toSats(0.00125);

      expect(sats).to.equal(125000);
    });

    it('should convert a large amount of BTC to satoshis', () => {
      const sats = toSats(1423.12342);

      expect(sats).to.equal(142312342000);
    });
  });

  describe('roundBTC', () => {
    it('should correctly round a single sat to 8 decimal places', () => {
      const btc = roundBTC(0.00000001);

      expect(btc).to.equal(0.00000001);
    });

    it('should correctly round 0.0012500000001 (e.g. rounding error) BTC to 8 decimal places', () => {
      const btc = roundBTC(0.0012500000001);

      expect(btc).to.equal(0.00125);
    });
  });
});
