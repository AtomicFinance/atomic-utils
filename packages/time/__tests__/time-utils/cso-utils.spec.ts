import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import { MONTH_NAMES } from '../../lib';
import {
  getCsoEvent,
  getCurrentCycleMaturityDate,
  getLastFridayInMonth,
  getNextCycleMaturityDate,
  getPreviousCycleMaturityDate,
} from '../../lib/cso';

chai.use(sinonChai);

describe('CSO utilities', () => {
  describe('getLastFridayInMonth', () => {
    // month is 0-indexed
    const lastFridays = [
      new Date(Date.UTC(2022, 0, 28, 8, 0, 0, 0)), // Jan
      new Date(Date.UTC(2022, 1, 25, 8, 0, 0, 0)), // Feb
      new Date(Date.UTC(2022, 2, 25, 8, 0, 0, 0)), // Mar
      new Date(Date.UTC(2022, 3, 29, 8, 0, 0, 0)), // Apr
      new Date(Date.UTC(2022, 4, 27, 8, 0, 0, 0)), // May
      new Date(Date.UTC(2022, 5, 24, 8, 0, 0, 0)), // Jun
      new Date(Date.UTC(2022, 6, 29, 8, 0, 0, 0)), // Jul
      new Date(Date.UTC(2022, 7, 26, 8, 0, 0, 0)), // Aug
      new Date(Date.UTC(2022, 8, 30, 8, 0, 0, 0)), // Sep
      new Date(Date.UTC(2022, 9, 28, 8, 0, 0, 0)), // Oct
      new Date(Date.UTC(2022, 10, 25, 8, 0, 0, 0)), // Nov
      new Date(Date.UTC(2022, 11, 30, 8, 0, 0, 0)), // Dec
    ];

    const year = 2022;

    for (let month = 0; month < 12; month++) {
      it(`should get lastFriday for ${MONTH_NAMES[month]}`, () => {
        const lastFriday = getLastFridayInMonth(year, month + 1); // month is 0-indexed in test but not with getLastFridayInMonth

        expect(lastFriday.getTime()).to.equal(lastFridays[month].getTime());
      });
    }
  });

  describe('getCurrentCycleMaturityDate', () => {
    it('should correctly calculate maturity date mid-year', () => {
      // example maturity June 24th, 2022

      const oneDayBefore = new Date(Date.UTC(2022, 5, 23, 8, 0, 0, 0));
      const atMaturity = new Date(Date.UTC(2022, 5, 24, 8, 0, 0, 0));
      const rightAfter = new Date(Date.UTC(2022, 5, 24, 8, 0, 0, 1));
      const oneDayAfter = new Date(Date.UTC(2022, 5, 25, 8, 0, 0, 0));
      const oneWeekAfter = new Date(Date.UTC(2022, 6, 1, 8, 0, 0, 0));
      const nextMaturity = new Date(Date.UTC(2022, 6, 29, 8, 0, 0, 0));

      const lastFridayOneDayBefore = getCurrentCycleMaturityDate(oneDayBefore);
      const lastFridayAtMaturity = getCurrentCycleMaturityDate(atMaturity);
      const lastFridayRightAfter = getCurrentCycleMaturityDate(rightAfter);
      const lastFridayOneDayAfter = getCurrentCycleMaturityDate(oneDayAfter);
      const lastFridayOneWeekAfter = getCurrentCycleMaturityDate(oneWeekAfter);

      expect(lastFridayOneDayBefore.getTime()).to.equal(atMaturity.getTime());
      expect(lastFridayAtMaturity.getTime()).to.equal(atMaturity.getTime());
      expect(lastFridayRightAfter.getTime()).to.equal(nextMaturity.getTime());
      expect(lastFridayOneDayAfter.getTime()).to.equal(nextMaturity.getTime());
      expect(lastFridayOneWeekAfter.getTime()).to.equal(nextMaturity.getTime());
    });

    it('should correctly calculate maturity date end-of-year', () => {
      // example maturity Dec 30th, 2022

      const oneDayBefore = new Date(Date.UTC(2022, 11, 29, 8, 0, 0, 0));
      const atMaturity = new Date(Date.UTC(2022, 11, 30, 8, 0, 0, 0));
      const rightAfter = new Date(Date.UTC(2022, 11, 30, 8, 0, 0, 1));
      const oneDayAfter = new Date(Date.UTC(2022, 11, 31, 8, 0, 0, 0));
      const oneWeekAfter = new Date(Date.UTC(2023, 0, 6, 8, 0, 0, 0));
      const nextMaturity = new Date(Date.UTC(2023, 0, 27, 8, 0, 0, 0));

      const lastFridayOneDayBefore = getCurrentCycleMaturityDate(oneDayBefore);
      const lastFridayAtMaturity = getCurrentCycleMaturityDate(atMaturity);
      const lastFridayRightAfter = getCurrentCycleMaturityDate(rightAfter);
      const lastFridayOneDayAfter = getCurrentCycleMaturityDate(oneDayAfter);
      const lastFridayOneWeekAfter = getCurrentCycleMaturityDate(oneWeekAfter);

      expect(lastFridayOneDayBefore.getTime()).to.equal(atMaturity.getTime());
      expect(lastFridayAtMaturity.getTime()).to.equal(atMaturity.getTime());
      expect(lastFridayRightAfter.getTime()).to.equal(nextMaturity.getTime());
      expect(lastFridayOneDayAfter.getTime()).to.equal(nextMaturity.getTime());
      expect(lastFridayOneWeekAfter.getTime()).to.equal(nextMaturity.getTime());
    });
  });

  describe('getNextCycleMaturityDate', () => {
    it('should correctly calculate maturity date mid-year', () => {
      // example maturity June 24th, 2022

      const oneDayBefore = new Date(Date.UTC(2022, 5, 23, 8, 0, 0, 0));
      const atMaturity = new Date(Date.UTC(2022, 5, 24, 8, 0, 0, 0));
      const rightAfter = new Date(Date.UTC(2022, 5, 24, 8, 0, 0, 1));
      const oneDayAfter = new Date(Date.UTC(2022, 5, 25, 8, 0, 0, 0));
      const oneWeekAfter = new Date(Date.UTC(2022, 6, 1, 8, 0, 0, 0));
      const nextMaturity = new Date(Date.UTC(2022, 6, 29, 8, 0, 0, 0));
      const finalMaturity = new Date(Date.UTC(2022, 7, 26, 8, 0, 0, 0));

      const lastFridayOneDayBefore = getNextCycleMaturityDate(oneDayBefore);
      const lastFridayAtMaturity = getNextCycleMaturityDate(atMaturity);
      const lastFridayRightAfter = getNextCycleMaturityDate(rightAfter);
      const lastFridayOneDayAfter = getNextCycleMaturityDate(oneDayAfter);
      const lastFridayOneWeekAfter = getNextCycleMaturityDate(oneWeekAfter);

      expect(lastFridayOneDayBefore.getTime()).to.equal(nextMaturity.getTime());
      expect(lastFridayAtMaturity.getTime()).to.equal(nextMaturity.getTime());
      expect(lastFridayRightAfter.getTime()).to.equal(finalMaturity.getTime());
      expect(lastFridayOneDayAfter.getTime()).to.equal(finalMaturity.getTime());
      expect(lastFridayOneWeekAfter.getTime()).to.equal(
        finalMaturity.getTime(),
      );
    });

    it('should correctly calculate maturity date end-of-year', () => {
      // example maturity Dec 30th, 2022

      const oneDayBefore = new Date(Date.UTC(2022, 11, 29, 8, 0, 0, 0));
      const atMaturity = new Date(Date.UTC(2022, 11, 30, 8, 0, 0, 0));
      const rightAfter = new Date(Date.UTC(2022, 11, 30, 8, 0, 0, 1));
      const oneDayAfter = new Date(Date.UTC(2022, 11, 31, 8, 0, 0, 0));
      const oneWeekAfter = new Date(Date.UTC(2023, 0, 6, 8, 0, 0, 0));
      const nextMaturity = new Date(Date.UTC(2023, 0, 27, 8, 0, 0, 0));
      const finalMaturity = new Date(Date.UTC(2023, 1, 24, 8, 0, 0, 0));

      const lastFridayOneDayBefore = getNextCycleMaturityDate(oneDayBefore);
      const lastFridayAtMaturity = getNextCycleMaturityDate(atMaturity);
      const lastFridayRightAfter = getNextCycleMaturityDate(rightAfter);
      const lastFridayOneDayAfter = getNextCycleMaturityDate(oneDayAfter);
      const lastFridayOneWeekAfter = getNextCycleMaturityDate(oneWeekAfter);

      expect(lastFridayOneDayBefore.getTime()).to.equal(nextMaturity.getTime());
      expect(lastFridayAtMaturity.getTime()).to.equal(nextMaturity.getTime());
      expect(lastFridayRightAfter.getTime()).to.equal(finalMaturity.getTime());
      expect(lastFridayOneDayAfter.getTime()).to.equal(finalMaturity.getTime());
      expect(lastFridayOneWeekAfter.getTime()).to.equal(
        finalMaturity.getTime(),
      );
    });
  });

  describe('getPreviousCycleMaturityDate', () => {
    it('should correctly calculate maturity date mid-year', () => {
      // example maturity June 24th, 2022

      const prevMaturity = new Date(Date.UTC(2022, 4, 27, 8, 0, 0, 0));
      const oneDayBefore = new Date(Date.UTC(2022, 5, 23, 8, 0, 0, 0));
      const atMaturity = new Date(Date.UTC(2022, 5, 24, 8, 0, 0, 0));
      const rightAfter = new Date(Date.UTC(2022, 5, 24, 8, 0, 0, 1));
      const oneDayAfter = new Date(Date.UTC(2022, 5, 25, 8, 0, 0, 0));
      const oneWeekAfter = new Date(Date.UTC(2022, 6, 1, 8, 0, 0, 0));

      const lastFridayOneDayBefore = getPreviousCycleMaturityDate(oneDayBefore);
      const lastFridayAtMaturity = getPreviousCycleMaturityDate(atMaturity);
      const lastFridayRightAfter = getPreviousCycleMaturityDate(rightAfter);
      const lastFridayOneDayAfter = getPreviousCycleMaturityDate(oneDayAfter);
      const lastFridayOneWeekAfter = getPreviousCycleMaturityDate(oneWeekAfter);

      expect(lastFridayOneDayBefore.getTime()).to.equal(prevMaturity.getTime());
      expect(lastFridayAtMaturity.getTime()).to.equal(prevMaturity.getTime());
      expect(lastFridayRightAfter.getTime()).to.equal(atMaturity.getTime());
      expect(lastFridayOneDayAfter.getTime()).to.equal(atMaturity.getTime());
      expect(lastFridayOneWeekAfter.getTime()).to.equal(atMaturity.getTime());
    });

    it('should correctly calculate maturity date end-of-year', () => {
      // example maturity Dec 30th, 2022

      const prevMaturity = new Date(Date.UTC(2022, 10, 25, 8, 0, 0, 0));
      const oneDayBefore = new Date(Date.UTC(2022, 11, 29, 8, 0, 0, 0));
      const atMaturity = new Date(Date.UTC(2022, 11, 30, 8, 0, 0, 0));
      const rightAfter = new Date(Date.UTC(2022, 11, 30, 8, 0, 0, 1));
      const oneDayAfter = new Date(Date.UTC(2022, 11, 31, 8, 0, 0, 0));
      const oneWeekAfter = new Date(Date.UTC(2023, 0, 6, 8, 0, 0, 0));

      const lastFridayOneDayBefore = getPreviousCycleMaturityDate(oneDayBefore);
      const lastFridayAtMaturity = getPreviousCycleMaturityDate(atMaturity);
      const lastFridayRightAfter = getPreviousCycleMaturityDate(rightAfter);
      const lastFridayOneDayAfter = getPreviousCycleMaturityDate(oneDayAfter);
      const lastFridayOneWeekAfter = getPreviousCycleMaturityDate(oneWeekAfter);

      expect(lastFridayOneDayBefore.getTime()).to.equal(prevMaturity.getTime());
      expect(lastFridayAtMaturity.getTime()).to.equal(prevMaturity.getTime());
      expect(lastFridayRightAfter.getTime()).to.equal(atMaturity.getTime());
      expect(lastFridayOneDayAfter.getTime()).to.equal(atMaturity.getTime());
      expect(lastFridayOneWeekAfter.getTime()).to.equal(atMaturity.getTime());
    });
  });

  describe('getCsoEvent', () => {
    it('should correctly calculate maturity date mid-year', () => {
      // example maturity June 24th, 2022

      const oneDayBefore = new Date(Date.UTC(2022, 5, 23, 8, 0, 0, 0));
      const atMaturity = new Date(Date.UTC(2022, 5, 24, 8, 0, 0, 0));
      const rightAfter = new Date(Date.UTC(2022, 5, 24, 8, 0, 0, 1));
      const sevenHoursAfter = new Date(Date.UTC(2022, 5, 24, 15, 0, 0, 0));
      const eightHoursAfter = new Date(Date.UTC(2022, 5, 24, 16, 0, 0, 0));
      const thirtyTwoHoursAfter = new Date(Date.UTC(2022, 5, 25, 16, 0, 0, 0));
      const sixtyEightHoursAfter = new Date(Date.UTC(2022, 5, 27, 4, 0, 0, 0));
      const seventySixHoursAfter = new Date(Date.UTC(2022, 5, 27, 12, 0, 0, 0));

      const oneDayBeforeCsoEvent = getCsoEvent(oneDayBefore);
      const atMaturityCsoEvent = getCsoEvent(atMaturity);
      const rightAfterCsoEvent = getCsoEvent(rightAfter);
      const sevenHoursAfterCsoEvent = getCsoEvent(sevenHoursAfter);
      const eightHoursAfterCsoEvent = getCsoEvent(eightHoursAfter);
      const thirtyTwoHoursAfterCsoEvent = getCsoEvent(thirtyTwoHoursAfter);
      const sixtyEightHoursAfterCsoEvent = getCsoEvent(sixtyEightHoursAfter);
      const seventySixHoursAfterCsoEvent = getCsoEvent(seventySixHoursAfter);

      expect(oneDayBeforeCsoEvent).to.equal('tradingOpen');
      expect(atMaturityCsoEvent).to.equal('dlcExpiry');
      expect(rightAfterCsoEvent).to.equal('dlcExpiry');
      expect(sevenHoursAfterCsoEvent).to.equal('dlcAttestation');
      expect(eightHoursAfterCsoEvent).to.equal('rolloverOpen');
      expect(thirtyTwoHoursAfterCsoEvent).to.equal('newEntryOpen');
      expect(sixtyEightHoursAfterCsoEvent).to.equal('newEntryClosed');
      expect(seventySixHoursAfterCsoEvent).to.equal('tradingOpen');
    });

    it('should correctly calculate maturity date end-of-year', () => {
      // example maturity Dec 30th, 2022

      const oneDayBefore = new Date(Date.UTC(2022, 11, 29, 8, 0, 0, 0));
      const atMaturity = new Date(Date.UTC(2022, 11, 30, 8, 0, 0, 0));
      const rightAfter = new Date(Date.UTC(2022, 11, 30, 8, 0, 0, 1));
      const sevenHoursAfter = new Date(Date.UTC(2022, 11, 30, 15, 0, 0, 0));
      const eightHoursAfter = new Date(Date.UTC(2022, 11, 30, 16, 0, 0, 0));
      const thirtyTwoHoursAfter = new Date(Date.UTC(2022, 11, 31, 16, 0, 0, 0));
      const sixtyEightHoursAfter = new Date(Date.UTC(2023, 0, 2, 4, 0, 0, 0));
      const seventySixHoursAfter = new Date(Date.UTC(2023, 0, 2, 12, 0, 0, 0));

      const oneDayBeforeCsoEvent = getCsoEvent(oneDayBefore);
      const atMaturityCsoEvent = getCsoEvent(atMaturity);
      const rightAfterCsoEvent = getCsoEvent(rightAfter);
      const sevenHoursAfterCsoEvent = getCsoEvent(sevenHoursAfter);
      const eightHoursAfterCsoEvent = getCsoEvent(eightHoursAfter);
      const thirtyTwoHoursAfterCsoEvent = getCsoEvent(thirtyTwoHoursAfter);
      const sixtyEightHoursAfterCsoEvent = getCsoEvent(sixtyEightHoursAfter);
      const seventySixHoursAfterCsoEvent = getCsoEvent(seventySixHoursAfter);

      expect(oneDayBeforeCsoEvent).to.equal('tradingOpen');
      expect(atMaturityCsoEvent).to.equal('dlcExpiry');
      expect(rightAfterCsoEvent).to.equal('dlcExpiry');
      expect(sevenHoursAfterCsoEvent).to.equal('dlcAttestation');
      expect(eightHoursAfterCsoEvent).to.equal('rolloverOpen');
      expect(thirtyTwoHoursAfterCsoEvent).to.equal('newEntryOpen');
      expect(sixtyEightHoursAfterCsoEvent).to.equal('newEntryClosed');
      expect(seventySixHoursAfterCsoEvent).to.equal('tradingOpen');
    });
  });
});
