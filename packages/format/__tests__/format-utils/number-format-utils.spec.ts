import chai from 'chai';

import { round } from '../../lib/number';

const expect = chai.expect;

describe('Number formatting utilities', () => {
  describe('round', () => {
    it('should round to nearest integer', () => {
      expect(round(1.5342)).to.equal(2);
      expect(round(1.423432)).to.equal(1);
      expect(round(1.64342)).to.equal(2);
      expect(round(1.14342)).to.equal(1);
      expect(round(1.943432)).to.equal(2);
      expect(round(1.03145)).to.equal(1);
    });

    it('should round to two decimal places', () => {
      expect(round(1.5342, 2)).to.equal(1.53);
      expect(round(1.423432, 2)).to.equal(1.42);
      expect(round(1.64342, 2)).to.equal(1.64);
      expect(round(1.14342, 2)).to.equal(1.14);
      expect(round(1.943432, 2)).to.equal(1.94);
      expect(round(1.03145, 2)).to.equal(1.03);
    });

    it('should round to three decimal places', () => {
      expect(round(1.5342, 3)).to.equal(1.534);
      expect(round(1.423432, 3)).to.equal(1.423);
      expect(round(1.64342, 3)).to.equal(1.643);
      expect(round(1.14342, 3)).to.equal(1.143);
      expect(round(1.943432, 3)).to.equal(1.943);
      expect(round(1.03145, 3)).to.equal(1.031);
    });

    it('should round to four decimal places', () => {
      expect(round(1.5342, 4)).to.equal(1.5342);
      expect(round(1.423432, 4)).to.equal(1.4234);
      expect(round(1.64342, 4)).to.equal(1.6434);
      expect(round(1.14342, 4)).to.equal(1.1434);
      expect(round(1.943432, 4)).to.equal(1.9434);
      expect(round(1.03145, 4)).to.equal(1.0315);
    });
  });
});
