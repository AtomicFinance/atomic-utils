import { getStrDate } from '@atomic-utils/deribit';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import { MONTH_NAMES } from '../../lib';
import {
  extractCsoEventIdDateFromStr,
  getCsoEvent,
  getCsoEventDates,
  getCsoEventId,
  getCurrentCycleMaturityDate,
  getLastFridayInMonth,
  getNextCycleMaturityDate,
  getParamsFromCsoEventId,
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

  describe('Cycle Maturity Helper Functions', () => {
    // example maturity June 24th, 2022
    const midYearDates = {
      prevMaturity: new Date(Date.UTC(2022, 4, 27, 8, 0, 0, 0)),
      oneDayBefore: new Date(Date.UTC(2022, 5, 23, 8, 0, 0, 0)),
      rightBefore: new Date(Date.UTC(2022, 5, 24, 7, 59, 59, 0)), // dlcExpiry
      atMaturity: new Date(Date.UTC(2022, 5, 24, 8, 0, 0, 0)), // dlcExpiry
      rightAfter: new Date(Date.UTC(2022, 5, 24, 8, 0, 0, 1)),
      sevenHoursAfter: new Date(Date.UTC(2022, 5, 24, 15, 0, 0, 0)), // dlcAttestation
      eightHoursAfter: new Date(Date.UTC(2022, 5, 24, 16, 0, 0, 0)), // rolloverOpen
      oneDayAfter: new Date(Date.UTC(2022, 5, 25, 8, 0, 0, 0)),
      thirtyTwoHoursAfter: new Date(Date.UTC(2022, 5, 25, 16, 0, 0, 0)), // newEntryOpen
      sixtyEightHoursAfter: new Date(Date.UTC(2022, 5, 27, 4, 0, 0, 0)), // newEntryClosed
      seventySixHoursAfter: new Date(Date.UTC(2022, 5, 27, 12, 0, 0, 0)), // tradingOpen
      oneWeekAfter: new Date(Date.UTC(2022, 6, 1, 8, 0, 0, 0)),
      twoWeeksAfter: new Date(Date.UTC(2022, 6, 15, 4, 0, 0, 0)), // halfMonthEntryClosed
      twoWeeksBeforeNext: new Date(Date.UTC(2022, 6, 15, 12, 0, 0, 0)), // tradingOpenHalfMonth
      oneWeekBeforeNext: new Date(Date.UTC(2022, 6, 22, 8, 0, 0, 0)),
      nextMaturity: new Date(Date.UTC(2022, 6, 29, 8, 0, 0, 0)), // dlcExpiry
      finalMaturity: new Date(Date.UTC(2022, 7, 26, 8, 0, 0, 0)), // dlcExpiry
    };

    // example maturity Dec 30th, 2022
    const endYearDates = {
      prevMaturity: new Date(Date.UTC(2022, 10, 25, 8, 0, 0, 0)),
      oneDayBefore: new Date(Date.UTC(2022, 11, 29, 8, 0, 0, 0)),
      rightBefore: new Date(Date.UTC(2022, 11, 30, 7, 59, 59, 0)),
      atMaturity: new Date(Date.UTC(2022, 11, 30, 8, 0, 0, 0)), // dlcExpiry
      rightAfter: new Date(Date.UTC(2022, 11, 30, 8, 0, 0, 1)),
      sevenHoursAfter: new Date(Date.UTC(2022, 11, 30, 15, 0, 0, 0)), // dlcAttestation
      eightHoursAfter: new Date(Date.UTC(2022, 11, 30, 16, 0, 0, 0)), // rolloverOpen
      oneDayAfter: new Date(Date.UTC(2022, 11, 31, 8, 0, 0, 0)),
      thirtyTwoHoursAfter: new Date(Date.UTC(2022, 11, 31, 16, 0, 0, 0)), // newEntryOpen
      sixtyEightHoursAfter: new Date(Date.UTC(2023, 0, 2, 4, 0, 0, 0)), // newEntryClosed
      seventySixHoursAfter: new Date(Date.UTC(2023, 0, 2, 12, 0, 0, 0)), // tradingOpen
      oneWeekAfter: new Date(Date.UTC(2023, 0, 6, 8, 0, 0, 0)),
      twoWeeksAfter: new Date(Date.UTC(2023, 0, 13, 4, 0, 0, 0)), // halfMonthEntryClosed
      twoWeeksBeforeNext: new Date(Date.UTC(2023, 0, 13, 12, 0, 0, 0)), // tradingOpenHalfMonth
      oneWeekBeforeNext: new Date(Date.UTC(2023, 0, 20, 8, 0, 0, 0)),
      nextMaturity: new Date(Date.UTC(2023, 0, 27, 8, 0, 0, 0)), // dlcExpiry
      finalMaturity: new Date(Date.UTC(2023, 1, 24, 8, 0, 0, 0)), // dlcExpiry
    };

    describe('getCurrentCycleMaturityDate', () => {
      for (let i = 0; i < 2; i++) {
        const period = i === 0 ? 'mid-year' : 'end-of-year';

        const {
          oneDayBefore,
          atMaturity,
          rightAfter,
          oneDayAfter,
          oneWeekAfter,
          nextMaturity,
        } = i === 0 ? midYearDates : endYearDates;

        it(`should correctly calculate current cycle maturity date ${period}`, () => {
          const lastFridayOneDayBefore =
            getCurrentCycleMaturityDate(oneDayBefore);
          const lastFridayAtMaturity = getCurrentCycleMaturityDate(atMaturity);
          const lastFridayRightAfter = getCurrentCycleMaturityDate(rightAfter);
          const lastFridayOneDayAfter =
            getCurrentCycleMaturityDate(oneDayAfter);
          const lastFridayOneWeekAfter =
            getCurrentCycleMaturityDate(oneWeekAfter);

          expect(lastFridayOneDayBefore.getTime()).to.equal(
            atMaturity.getTime(),
          );
          expect(lastFridayAtMaturity.getTime()).to.equal(
            nextMaturity.getTime(),
          );
          expect(lastFridayRightAfter.getTime()).to.equal(
            nextMaturity.getTime(),
          );
          expect(lastFridayOneDayAfter.getTime()).to.equal(
            nextMaturity.getTime(),
          );
          expect(lastFridayOneWeekAfter.getTime()).to.equal(
            nextMaturity.getTime(),
          );
        });
      }
    });

    describe('getNextCycleMaturityDate', () => {
      for (let i = 0; i < 2; i++) {
        const period = i === 0 ? 'mid-year' : 'end-of-year';

        const {
          oneDayBefore,
          atMaturity,
          rightAfter,
          oneDayAfter,
          oneWeekAfter,
          nextMaturity,
          finalMaturity,
        } = i === 0 ? midYearDates : endYearDates;

        it(`should correctly calculate next cycle maturity date ${period}`, () => {
          const lastFridayOneDayBefore = getNextCycleMaturityDate(oneDayBefore);
          const lastFridayAtMaturity = getNextCycleMaturityDate(atMaturity);
          const lastFridayRightAfter = getNextCycleMaturityDate(rightAfter);
          const lastFridayOneDayAfter = getNextCycleMaturityDate(oneDayAfter);
          const lastFridayOneWeekAfter = getNextCycleMaturityDate(oneWeekAfter);

          expect(lastFridayOneDayBefore.getTime()).to.equal(
            nextMaturity.getTime(),
          );
          expect(lastFridayAtMaturity.getTime()).to.equal(
            finalMaturity.getTime(),
          );
          expect(lastFridayRightAfter.getTime()).to.equal(
            finalMaturity.getTime(),
          );
          expect(lastFridayOneDayAfter.getTime()).to.equal(
            finalMaturity.getTime(),
          );
          expect(lastFridayOneWeekAfter.getTime()).to.equal(
            finalMaturity.getTime(),
          );
        });
      }
    });

    describe('getPreviousCycleMaturityDate', () => {
      for (let i = 0; i < 2; i++) {
        const period = i === 0 ? 'mid-year' : 'end-of-year';

        const {
          prevMaturity,
          oneDayBefore,
          atMaturity,
          rightAfter,
          oneDayAfter,
          oneWeekAfter,
        } = i === 0 ? midYearDates : endYearDates;

        it(`should correctly calculate previous cycle maturity date ${period}`, () => {
          const lastFridayOneDayBefore =
            getPreviousCycleMaturityDate(oneDayBefore);
          const lastFridayAtMaturity = getPreviousCycleMaturityDate(atMaturity);
          const lastFridayRightAfter = getPreviousCycleMaturityDate(rightAfter);
          const lastFridayOneDayAfter =
            getPreviousCycleMaturityDate(oneDayAfter);
          const lastFridayOneWeekAfter =
            getPreviousCycleMaturityDate(oneWeekAfter);

          expect(lastFridayOneDayBefore.getTime()).to.equal(
            prevMaturity.getTime(),
          );
          expect(lastFridayAtMaturity.getTime()).to.equal(atMaturity.getTime());
          expect(lastFridayRightAfter.getTime()).to.equal(atMaturity.getTime());
          expect(lastFridayOneDayAfter.getTime()).to.equal(
            atMaturity.getTime(),
          );
          expect(lastFridayOneWeekAfter.getTime()).to.equal(
            atMaturity.getTime(),
          );
        });
      }
    });

    describe('getCsoEvent', () => {
      for (let i = 0; i < 2; i++) {
        const period = i === 0 ? 'mid-year' : 'end-of-year';

        const {
          oneDayBefore,
          atMaturity,
          rightAfter,
          sevenHoursAfter,
          eightHoursAfter,
          thirtyTwoHoursAfter,
          sixtyEightHoursAfter,
          seventySixHoursAfter,
          twoWeeksAfter,
          twoWeeksBeforeNext,
          nextMaturity,
        } = i === 0 ? midYearDates : endYearDates;

        it(`should correctly determine cso event ${period}`, () => {
          const oneDayBeforeCsoEvent = getCsoEvent(oneDayBefore);
          const atMaturityCsoEvent = getCsoEvent(atMaturity);
          const rightAfterCsoEvent = getCsoEvent(rightAfter);
          const sevenHoursAfterCsoEvent = getCsoEvent(sevenHoursAfter);
          const eightHoursAfterCsoEvent = getCsoEvent(eightHoursAfter);
          const thirtyTwoHoursAfterCsoEvent = getCsoEvent(thirtyTwoHoursAfter);
          const sixtyEightHoursAfterCsoEvent =
            getCsoEvent(sixtyEightHoursAfter);
          const seventySixHoursAfterCsoEvent =
            getCsoEvent(seventySixHoursAfter);
          const twoWeeksAfterCsoEvent = getCsoEvent(twoWeeksAfter);
          const twoWeeksBeforeNextCsoEvent = getCsoEvent(twoWeeksBeforeNext);
          const nextMaturityCsoEvent = getCsoEvent(nextMaturity);

          expect(oneDayBeforeCsoEvent).to.equal('tradingOpenHalfMonth');
          expect(atMaturityCsoEvent).to.equal('dlcExpiry');
          expect(rightAfterCsoEvent).to.equal('dlcExpiry');
          expect(sevenHoursAfterCsoEvent).to.equal('dlcAttestation');
          expect(eightHoursAfterCsoEvent).to.equal('rolloverOpen');
          expect(thirtyTwoHoursAfterCsoEvent).to.equal('newEntryOpen');
          expect(sixtyEightHoursAfterCsoEvent).to.equal('newEntryClosed');
          expect(seventySixHoursAfterCsoEvent).to.equal('tradingOpen');
          expect(twoWeeksAfterCsoEvent).to.equal('halfMonthEntryClosed');
          expect(twoWeeksBeforeNextCsoEvent).to.equal('tradingOpenHalfMonth');
          expect(nextMaturityCsoEvent).to.equal('dlcExpiry');
        });
      }
    });

    describe('getCsoEventId', () => {
      for (let i = 0; i < 2; i++) {
        const period = i === 0 ? 'mid-year' : 'end-of-year';

        const {
          rightBefore,
          atMaturity,
          rightAfter,
          oneWeekAfter,
          oneWeekBeforeNext,
          nextMaturity,
        } = i === 0 ? midYearDates : endYearDates;

        it(`should correctly calculate CSO Event ID ${period}`, () => {
          const csoEventDetails = [
            'atomic',
            'call_spread_v1',
            'monthly',
          ] as const;

          const { tradingOpen, tradingOpenHalfMonth, upcomingDlcExpiry } =
            getCsoEventDates(atMaturity);
          const {
            tradingOpen: nextTradingOpen,
            upcomingDlcExpiry: nextDlcExpiry,
          } = getCsoEventDates(nextMaturity);

          const rightBeforeCsoEventId = getCsoEventId(
            rightBefore,
            ...csoEventDetails,
          );
          const atMaturityCsoEventId = getCsoEventId(
            atMaturity,
            ...csoEventDetails,
          );
          const rightAfterCsoEventId = getCsoEventId(
            rightAfter,
            ...csoEventDetails,
          );
          const oneWeekAfterCsoEventId = getCsoEventId(
            oneWeekAfter,
            ...csoEventDetails,
          );
          const oneWeekBeforeNextCsoEventId = getCsoEventId(
            oneWeekBeforeNext,
            ...csoEventDetails,
          );

          // atomic-call_spread_v1-monthly-27JUN22-29JUL22
          expect(rightBeforeCsoEventId).to.equal(
            [
              ...csoEventDetails,
              getStrDate(tradingOpen),
              getStrDate(upcomingDlcExpiry),
            ].join('-'),
          );

          // atomic-call_spread_v1-monthly-27JUN22-29JUL22
          expect(atMaturityCsoEventId).to.equal(
            [
              ...csoEventDetails,
              getStrDate(tradingOpen),
              getStrDate(upcomingDlcExpiry),
            ].join('-'),
          );

          // atomic-call_spread_v1-monthly-27JUN22-29JUL22
          expect(rightAfterCsoEventId).to.equal(
            [
              ...csoEventDetails,
              getStrDate(tradingOpen),
              getStrDate(upcomingDlcExpiry),
            ].join('-'),
          );

          // atomic-call_spread_v1-monthly-15JUL22-29JUL22
          expect(oneWeekAfterCsoEventId).to.equal(
            [
              ...csoEventDetails,
              getStrDate(tradingOpenHalfMonth),
              getStrDate(upcomingDlcExpiry),
            ].join('-'),
          );

          // atomic-call_spread_v1-monthly-1AUG22-26AUG22
          expect(oneWeekBeforeNextCsoEventId).to.equal(
            [
              ...csoEventDetails,
              getStrDate(nextTradingOpen),
              getStrDate(nextDlcExpiry),
            ].join('-'),
          );
        });
      }
    });

    describe('getParamsFromCsoEventId', () => {
      for (let i = 0; i < 2; i++) {
        const period = i === 0 ? 'mid-year' : 'end-of-year';

        const {
          atMaturity,
          rightAfter,
          oneWeekAfter,
          oneWeekBeforeNext,
          nextMaturity,
        } = i === 0 ? midYearDates : endYearDates;

        it(`should correctly calculate CSO Event ID ${period}`, () => {
          const csoEventDetails = [
            'atomic',
            'call_spread_v1',
            'monthly',
          ] as const;

          const {
            newEntryClosed,
            tradingOpen,
            halfMonthEntryClosed,
            tradingOpenHalfMonth,
            upcomingDlcExpiry,
          } = getCsoEventDates(atMaturity);
          const {
            newEntryClosed: nextNewEntryClosed,
            tradingOpen: nextTradingOpen,
            upcomingDlcExpiry: nextDlcExpiry,
          } = getCsoEventDates(nextMaturity);

          const rightAfterCsoEventId = getCsoEventId(
            rightAfter,
            ...csoEventDetails,
          );
          const oneWeekAfterCsoEventId = getCsoEventId(
            oneWeekAfter,
            ...csoEventDetails,
          );
          const oneWeekBeforeNextCsoEventId = getCsoEventId(
            oneWeekBeforeNext,
            ...csoEventDetails,
          );
          const otherCsoEventId = `${csoEventDetails.join('-')}-${getStrDate(
            oneWeekAfter,
          )}-${getStrDate(oneWeekBeforeNext)}`;

          const { startDate: startDateFirstMonth, endDate: endDateFirstMonth } =
            getParamsFromCsoEventId(rightAfterCsoEventId);
          const { startDate: startDateHalfMonth, endDate: endDateHalfMonth } =
            getParamsFromCsoEventId(oneWeekAfterCsoEventId);
          const {
            startDate: startDateSecondMonth,
            endDate: endDateSecondMonth,
          } = getParamsFromCsoEventId(oneWeekBeforeNextCsoEventId);

          const { startDate: otherStartDate, endDate: otherEndDate } =
            getParamsFromCsoEventId(otherCsoEventId);

          // Check that trading open starts at 12 pm UTC
          expect(tradingOpen.getUTCHours()).to.equal(12);

          // Check that trading open half month starts at 10 am UTC
          expect(tradingOpenHalfMonth.getUTCHours()).to.equal(10);

          // Check that dlcExpiry starts is at 8 am UTC
          expect(upcomingDlcExpiry.getUTCHours()).to.equal(8);

          // atomic-call_spread_v1-monthly-27JUN22-29JUL22
          expect(startDateFirstMonth.getTime()).to.equal(
            newEntryClosed.getTime(),
          );
          expect(endDateFirstMonth.getTime()).to.equal(
            upcomingDlcExpiry.getTime(),
          );

          // atomic-call_spread_v1-monthly-15JUL22-29JUL22
          expect(startDateHalfMonth.getTime()).to.equal(
            halfMonthEntryClosed.getTime(),
          );
          expect(endDateHalfMonth.getTime()).to.equal(
            upcomingDlcExpiry.getTime(),
          );

          // atomic-call_spread_v1-monthly-1AUG22-26AUG22
          expect(startDateSecondMonth.getTime()).to.equal(
            nextNewEntryClosed.getTime(),
          );
          expect(endDateSecondMonth.getTime()).to.equal(
            nextDlcExpiry.getTime(),
          );

          /**
           * atomic-call_spread_v1-monthly-1JUL22-22JUL22
           * non standard event ID
           * (start and end date aren't tradingOpen,
           *  tradingHalfMonthOpen, or dlcExpiry)
           */
          expect(oneWeekAfter.getUTCDate()).to.equal(
            otherStartDate.getUTCDate(),
          );
          expect(oneWeekBeforeNext.getUTCDate()).to.equal(
            otherEndDate.getUTCDate(),
          );
        });
      }

      it('should throw if format incorrect', () => {
        const invalidEventId =
          'invalid-atomic-call_spread_v1-monthly-27JUN22-29JUL22';

        expect(() => getParamsFromCsoEventId(invalidEventId)).to.throw(
          Error,
          `Invalid eventId provided: ${invalidEventId}. Expected format [provider]-[strategyId]-[period]-[startDate]-[endDate]`,
        );
      });

      it('should throw if date format incorrect', () => {
        const invalidStartDate = '27INVALID';
        const endDate = '29JUL22';

        const invalidEventId = `atomic-call_spread_v1-monthly-${invalidStartDate}-${endDate}`;

        expect(() => getParamsFromCsoEventId(invalidEventId)).to.throw(
          Error,
          `Invalid start or end date provided. Start Date: ${invalidStartDate}. End Date: ${endDate}`,
        );
      });
    });

    describe('extractCsoEventIdDateFromStr', () => {
      // These dates were previously resulting in incorrect current or previous dlc expiry

      it('should extract correct date for trading open', () => {
        const dateStr = '30JAN23';
        const date = extractCsoEventIdDateFromStr(dateStr);
        const { newEntryClosed } = getCsoEventDates(date);

        expect(date.getTime()).to.equal(newEntryClosed.getTime());
      });

      it('should extract correct date for dlc expiry', () => {
        const dateStr = '24FEB23';
        const date = extractCsoEventIdDateFromStr(dateStr);
        const { previousDlcExpiry } = getCsoEventDates(date);

        expect(date.getTime()).to.equal(previousDlcExpiry.getTime());
      });
    });
  });
});
