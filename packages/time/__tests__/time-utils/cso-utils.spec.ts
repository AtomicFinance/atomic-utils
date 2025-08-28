import { getStrDate } from '@atomic-utils/deribit';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import { MONTH_NAMES } from '../../lib';
import {
  extractCsoEventIdDateFromStr,
  findCycleMaturityMonthsInPast,
  findNumCyclesInPastMaturityExists,
  getCsoEvent,
  getCsoEventDates,
  getCsoEventId,
  getCsoEventIdType,
  getCsoLength,
  getCsoStartAndEndDate,
  getCsoTradeSplitEventId,
  getCsoTradeUnsplitEventId,
  getCurrentCycleMaturityDate,
  getEventIdType,
  getLastFridayInMonth,
  getManualEventId,
  getNextCycleMaturityDate,
  getParamsFromCsoEventId,
  getParamsFromCsoTradeSplitEventId,
  getParamsFromCsoTradeUnsplitEventId,
  getParamsFromManualEventId,
  getPreviousCycleMaturityDate,
  getPreviousFriday,
  getUpcomingFriday,
  isHalfMonth,
} from '../../lib/cso';

chai.use(sinonChai);

describe('CSO utilities', () => {
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

  // example maturity June 24th, 2022
  const midYearDates = {
    prevMaturity: new Date(Date.UTC(2022, 4, 27, 8, 0, 0, 0)),
    weekBeforeMaturity: new Date(Date.UTC(2022, 5, 17, 8, 0, 0, 0)),
    oneDayBefore: new Date(Date.UTC(2022, 5, 23, 8, 0, 0, 0)),
    rightBefore: new Date(Date.UTC(2022, 5, 24, 7, 59, 59, 0)), // dlcExpiry
    atMaturity: new Date(Date.UTC(2022, 5, 24, 8, 0, 0, 0)), // dlcExpiry
    rightAfter: new Date(Date.UTC(2022, 5, 24, 8, 0, 0, 1)),
    minuteAfter: new Date(Date.UTC(2022, 5, 24, 8, 1, 0, 0)),
    sevenHoursAfter: new Date(Date.UTC(2022, 5, 24, 15, 0, 0, 0)), // dlcAttestation
    eightHoursAfter: new Date(Date.UTC(2022, 5, 24, 16, 0, 0, 0)), // rolloverOpen
    oneDayAfter: new Date(Date.UTC(2022, 5, 25, 8, 0, 0, 0)),
    thirtyTwoHoursAfter: new Date(Date.UTC(2022, 5, 25, 16, 0, 0, 0)), // newEntryOpen
    sixtyEightHoursAfter: new Date(Date.UTC(2022, 5, 27, 4, 0, 0, 0)), // newEntryClosed
    seventySixHoursAfter: new Date(Date.UTC(2022, 5, 27, 12, 0, 0, 0)), // tradingOpen
    oneWeekAfter: new Date(Date.UTC(2022, 6, 1, 8, 0, 0, 0)),
    twoWeeksAfter: new Date(Date.UTC(2022, 6, 8, 8, 0, 0, 0)),
    halfwayThrough: new Date(Date.UTC(2022, 6, 15, 4, 0, 0, 0)), // halfMonthEntryClosed
    twoWeeksBeforeNext: new Date(Date.UTC(2022, 6, 15, 12, 0, 0, 0)), // tradingOpenHalfMonth
    oneWeekBeforeNext: new Date(Date.UTC(2022, 6, 22, 8, 0, 0, 0)),
    nextMaturity: new Date(Date.UTC(2022, 6, 29, 8, 0, 0, 0)), // dlcExpiry
    finalMaturity: new Date(Date.UTC(2022, 7, 26, 8, 0, 0, 0)), // dlcExpiry
  };

  // example maturity Dec 30th, 2022
  const endYearDates = {
    prevMaturity: new Date(Date.UTC(2022, 10, 25, 8, 0, 0, 0)),
    weekBeforeMaturity: new Date(Date.UTC(2022, 11, 23, 8, 0, 0, 0)),
    oneDayBefore: new Date(Date.UTC(2022, 11, 29, 8, 0, 0, 0)),
    rightBefore: new Date(Date.UTC(2022, 11, 30, 7, 59, 59, 0)),
    atMaturity: new Date(Date.UTC(2022, 11, 30, 8, 0, 0, 0)), // dlcExpiry
    rightAfter: new Date(Date.UTC(2022, 11, 30, 8, 0, 0, 1)),
    minuteAfter: new Date(Date.UTC(2022, 11, 30, 8, 1, 0, 0)),
    sevenHoursAfter: new Date(Date.UTC(2022, 11, 30, 15, 0, 0, 0)), // dlcAttestation
    eightHoursAfter: new Date(Date.UTC(2022, 11, 30, 16, 0, 0, 0)), // rolloverOpen
    oneDayAfter: new Date(Date.UTC(2022, 11, 31, 8, 0, 0, 0)),
    thirtyTwoHoursAfter: new Date(Date.UTC(2022, 11, 31, 16, 0, 0, 0)), // newEntryOpen
    sixtyEightHoursAfter: new Date(Date.UTC(2023, 0, 2, 4, 0, 0, 0)), // newEntryClosed
    seventySixHoursAfter: new Date(Date.UTC(2023, 0, 2, 12, 0, 0, 0)), // tradingOpen
    oneWeekAfter: new Date(Date.UTC(2023, 0, 6, 8, 0, 0, 0)),
    twoWeeksAfter: new Date(Date.UTC(2023, 0, 13, 8, 0, 0, 0)),
    halfwayThrough: new Date(Date.UTC(2023, 0, 13, 4, 0, 0, 0)), // halfMonthEntryClosed
    twoWeeksBeforeNext: new Date(Date.UTC(2023, 0, 13, 12, 0, 0, 0)), // tradingOpenHalfMonth
    oneWeekBeforeNext: new Date(Date.UTC(2023, 0, 20, 8, 0, 0, 0)),
    nextMaturity: new Date(Date.UTC(2023, 0, 27, 8, 0, 0, 0)), // dlcExpiry
    finalMaturity: new Date(Date.UTC(2023, 1, 24, 8, 0, 0, 0)), // dlcExpiry
  };

  describe('getLastFridayInMonth', () => {
    const year = 2022;

    for (let month = 0; month < 12; month++) {
      it(`should get lastFriday for ${MONTH_NAMES[month]}`, () => {
        const lastFriday = getLastFridayInMonth(year, month + 1); // month is 0-indexed in test but not with getLastFridayInMonth

        expect(lastFriday.getTime()).to.equal(lastFridays[month].getTime());
      });
    }
  });

  describe('getUpcomingFriday', () => {
    for (let i = 0; i < 2; i++) {
      const period = i === 0 ? 'mid-year' : 'end-of-year';

      const {
        oneDayBefore,
        rightBefore,
        atMaturity,
        rightAfter,
        sevenHoursAfter,
        seventySixHoursAfter,
        oneWeekAfter,
        twoWeeksAfter,
      } = i === 0 ? midYearDates : endYearDates;

      it(`should get upcoming friday for cycle period ${period}`, () => {
        const friFromOneDayBefore = getUpcomingFriday(oneDayBefore);
        const friFromRightBefore = getUpcomingFriday(rightBefore);
        const friFromAtMaturity = getUpcomingFriday(atMaturity);
        const friFromRightAfter = getUpcomingFriday(rightAfter);
        const friFromSevenHoursAfter = getUpcomingFriday(sevenHoursAfter);
        const friFromSeventySixHoursAfter =
          getUpcomingFriday(seventySixHoursAfter);
        const friFromOneWeekAfter = getUpcomingFriday(oneWeekAfter);

        expect(friFromOneDayBefore.getTime()).to.equal(atMaturity.getTime());
        expect(friFromRightBefore.getTime()).to.equal(atMaturity.getTime());
        expect(friFromAtMaturity.getTime()).to.equal(oneWeekAfter.getTime());
        expect(friFromRightAfter.getTime()).to.equal(oneWeekAfter.getTime());
        expect(friFromSevenHoursAfter.getTime()).to.equal(
          oneWeekAfter.getTime(),
        );
        expect(friFromSeventySixHoursAfter.getTime()).to.equal(
          oneWeekAfter.getTime(),
        );
        expect(friFromOneWeekAfter.getTime()).to.equal(twoWeeksAfter.getTime());
      });
    }
  });

  describe('getPreviousFriday', () => {
    for (let i = 0; i < 2; i++) {
      const period = i === 0 ? 'mid-year' : 'end-of-year';

      const {
        weekBeforeMaturity,
        atMaturity,
        rightAfter,
        minuteAfter,
        sevenHoursAfter,
        seventySixHoursAfter,
        oneWeekAfter,
        twoWeeksAfter,
      } = i === 0 ? midYearDates : endYearDates;

      it(`should get previous friday for cycle period ${period}`, () => {
        const friFromMaturity = getPreviousFriday(atMaturity);
        const friFromRightAfter = getPreviousFriday(rightAfter);
        const friFromMinuteAfter = getPreviousFriday(minuteAfter);
        const friFromSevenHoursAfter = getPreviousFriday(sevenHoursAfter);
        const friFromSeventySixHoursAfter =
          getPreviousFriday(seventySixHoursAfter);
        const friFromOneWeekAfter = getPreviousFriday(oneWeekAfter);
        const friFromTwoWeeksAfter = getPreviousFriday(twoWeeksAfter);

        expect(friFromMaturity.getTime()).to.equal(
          weekBeforeMaturity.getTime(),
        );
        expect(friFromRightAfter.getTime()).to.equal(
          weekBeforeMaturity.getTime(),
        );
        expect(friFromMinuteAfter.getTime()).to.equal(atMaturity.getTime());
        expect(friFromSevenHoursAfter.getTime()).to.equal(atMaturity.getTime());
        expect(friFromSeventySixHoursAfter.getTime()).to.equal(
          atMaturity.getTime(),
        );
        expect(friFromOneWeekAfter.getTime()).to.equal(atMaturity.getTime());
        expect(friFromTwoWeeksAfter.getTime()).to.equal(oneWeekAfter.getTime());
      });
    }
  });

  describe('Cycle Maturity Helper Functions', () => {
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

      it('should fail if seconds provided', () => {
        const timestampInSeconds = Math.floor(lastFridays[0].getTime() / 1000);
        const t = new Date(timestampInSeconds);

        expect(() => getCurrentCycleMaturityDate(t)).to.throw(
          Error,
          `Invalid date provided ${t} with timestamp ${t.getTime()}, you may have used seconds instead of milliseconds`,
        );
      });

      it('should fail if microseconds provided', () => {
        const timestampInMicroSeconds = lastFridays[0].getTime() * 1000;
        const t = new Date(timestampInMicroSeconds);

        expect(() => getCurrentCycleMaturityDate(t)).to.throw(
          Error,
          `Invalid date provided ${t} with timestamp ${t.getTime()}, you may have used microseconds instead of milliseconds`,
        );
      });
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
          halfwayThrough,
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
          const twoWeeksAfterCsoEvent = getCsoEvent(halfwayThrough);
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
            tradingOpenHalfMonth.getTime(),
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

      it('should succeed getting params from cso event id two months', () => {
        const { startDate, endDate } = getParamsFromCsoEventId(
          'atomic-engine-monthly-1APR24-31MAY24',
        );
        expect(startDate.getTime()).to.equal(1711944000000);
        expect(endDate.getTime()).to.equal(1717142400000);
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

      it('should handle React Native problematic date formats', () => {
        // Test the specific date formats that were causing issues in React Native
        const problematicDates = [
          '29MAY23', // atomic-oyster-monthly-29MAY23-30JUN23
          '3JUL23', // atomic-oyster-monthly-3JUL23-28JUL23
          '31JUL23', // atomic-oyster-monthly-31JUL23-25AUG23
        ];

        problematicDates.forEach((dateStr) => {
          const date = extractCsoEventIdDateFromStr(dateStr);
          expect(date).to.be.instanceOf(Date);
          expect(isNaN(date.getTime())).to.be.false;
          expect(date.getTime()).to.be.greaterThan(0);
        });
      });

      it('should throw error for invalid month abbreviation', () => {
        const invalidDateStr = '15INV23';
        expect(() => extractCsoEventIdDateFromStr(invalidDateStr)).to.throw(
          Error,
          'Invalid month abbreviation: INV',
        );
      });
    });

    describe('findCycleMaturityMonthsInPast', () => {
      it('should find cycle maturity 1 month in the past', () => {
        const currentMaturity = lastFridays[lastFridays.length - 1];
        const expectedMaturity = lastFridays[lastFridays.length - 2];

        const actualMaturity = findCycleMaturityMonthsInPast(
          currentMaturity,
          1,
        );

        expect(actualMaturity.getTime()).to.equal(expectedMaturity.getTime());
      });

      it('should find cycle maturity 3 months in the past', () => {
        const currentMaturity = lastFridays[lastFridays.length - 1];
        const expectedMaturity = lastFridays[lastFridays.length - 4];

        const actualMaturity = findCycleMaturityMonthsInPast(
          currentMaturity,
          3,
        );

        expect(actualMaturity.getTime()).to.equal(expectedMaturity.getTime());
      });

      it('should fail if numMonths provided is 0', () => {
        const currentMaturity = lastFridays[lastFridays.length - 1];

        expect(() =>
          findCycleMaturityMonthsInPast(currentMaturity, 0),
        ).to.throw(Error, 'numMonths must be at least 1');
      });
    });

    describe('findNumCyclesInPastMaturityExists', () => {
      it('should succeed if previous expiry provided is exactly expiry', () => {
        const currentMaturity = lastFridays[lastFridays.length - 1];
        const previousMaturity = lastFridays[lastFridays.length - 2];

        const actualNumCylesInPast = findNumCyclesInPastMaturityExists(
          currentMaturity,
          previousMaturity,
        );
        const expectedNumCyclesInPast = 1;

        expect(actualNumCylesInPast).to.equal(expectedNumCyclesInPast);
      });

      it('should succeed if previous expiry provided is slightly after expiry', () => {
        const currentMaturity = lastFridays[lastFridays.length - 1];
        const previousMaturity = lastFridays[lastFridays.length - 2];

        const actualNumCylesInPast = findNumCyclesInPastMaturityExists(
          currentMaturity,
          new Date(previousMaturity.getTime() + 1000),
        );
        const expectedNumCyclesInPast = 1;

        expect(actualNumCylesInPast).to.equal(expectedNumCyclesInPast);
      });

      it('should fail if current date provided is outside dlcExpiry', () => {
        const currentMaturity = lastFridays[lastFridays.length - 1];
        const previousMaturity = lastFridays[lastFridays.length - 2];

        expect(() =>
          findNumCyclesInPastMaturityExists(
            currentMaturity,
            new Date(previousMaturity.getTime() - 1),
          ),
        ).to.throw(Error, 'Previous Expiry should be in time period dlcExpiry');
      });

      it('should fail if previousExpiry greater than current date provided', () => {
        const currentMaturity = lastFridays[lastFridays.length - 1];

        expect(() =>
          findNumCyclesInPastMaturityExists(
            currentMaturity,
            new Date(currentMaturity.getTime() + 1),
          ),
        ).to.throw(Error, 'Previous Expiry should be less than current date');
      });

      it('should fail if maxTries exceeded', () => {
        const currentMaturity = lastFridays[lastFridays.length - 1];
        const previousMaturity = lastFridays[lastFridays.length - 4];
        const maxTries = 1;

        expect(() =>
          findNumCyclesInPastMaturityExists(
            currentMaturity,
            previousMaturity,
            maxTries,
          ),
        ).to.throw(
          Error,
          'Could not find cycle maturity in the past after checking 1 months',
        );
      });
    });

    describe('isHalfMonth', () => {
      it('should return true if cycle is half month', () => {
        const csoEventDetails = [
          'atomic',
          'call_spread_v1',
          'monthly',
        ] as const;

        const halfCycle = new Date(Date.UTC(2022, 6, 10));
        const maturity = new Date(Date.UTC(2022, 6, 20));

        const halfCycleEventId = getCsoEventId(halfCycle, ...csoEventDetails);
        const fullCycleEventId = getCsoEventId(maturity, ...csoEventDetails);

        expect(isHalfMonth(halfCycleEventId)).to.equal(true);
        expect(isHalfMonth(fullCycleEventId)).to.equal(false);
      });
    });

    describe('getCsoStartAndEndDate', () => {
      const beforeHalfMonth = new Date(Date.UTC(2023, 6, 4));
      const beforeFullMonth = new Date(Date.UTC(2023, 6, 18));

      const provider = 'atomic';
      const strategyId = 'call_spread_v1';
      const period = 'monthly';

      it('should calculate properly for one and a half month', () => {
        const { startDate, endDate } = getCsoStartAndEndDate(
          beforeHalfMonth,
          true,
        );

        const eventId = getCsoEventId(
          beforeHalfMonth,
          provider,
          strategyId,
          period,
          true,
        );

        const params = getParamsFromCsoEventId(eventId);

        const expectedStartDate = new Date(Date.UTC(2023, 6, 14, 4)); // half month entry close
        const expectedParamsStart = new Date(Date.UTC(2023, 6, 14, 10)); // half month trading start
        const expectedEndDate = new Date(Date.UTC(2023, 7, 25, 8));

        expect(startDate.getTime()).to.equal(expectedStartDate.getTime());
        expect(endDate.getTime()).to.equal(expectedEndDate.getTime());

        expect(params.startDate.getTime()).to.equal(
          expectedParamsStart.getTime(),
        );
        expect(params.endDate.getTime()).to.equal(expectedEndDate.getTime());
      });

      it('should calculate properly for half month', () => {
        const { startDate, endDate } = getCsoStartAndEndDate(
          beforeHalfMonth,
          false,
        );

        const eventId = getCsoEventId(
          beforeHalfMonth,
          provider,
          strategyId,
          period,
          false,
        );

        const params = getParamsFromCsoEventId(eventId);

        const expectedStartDate = new Date(Date.UTC(2023, 6, 14, 4));
        const expectedParamsStart = new Date(Date.UTC(2023, 6, 14, 10)); // half month trading start
        const expectedEndDate = new Date(Date.UTC(2023, 6, 28, 8));

        expect(startDate.getTime()).to.equal(expectedStartDate.getTime());
        expect(endDate.getTime()).to.equal(expectedEndDate.getTime());
        expect(params.startDate.getTime()).to.equal(
          expectedParamsStart.getTime(),
        );
      });

      it('should calculate properly for two months', () => {
        const { startDate, endDate } = getCsoStartAndEndDate(
          beforeFullMonth,
          true,
        );

        const eventId = getCsoEventId(
          beforeFullMonth,
          provider,
          strategyId,
          period,
          true,
        );

        const params = getParamsFromCsoEventId(eventId);

        const expectedStartDate = new Date(Date.UTC(2023, 6, 31, 4)); // full month trading start
        const expectedParamsStart = new Date(Date.UTC(2023, 6, 31, 4)); // full month trading start
        const expectedEndDate = new Date(Date.UTC(2023, 8, 29, 8));

        expect(startDate.getTime()).to.equal(expectedStartDate.getTime());
        expect(endDate.getTime()).to.equal(expectedEndDate.getTime());

        expect(params.startDate.getTime()).to.equal(
          expectedParamsStart.getTime(),
        );
        expect(params.endDate.getTime()).to.equal(expectedEndDate.getTime());
      });
    });

    describe('getCsoLength', () => {
      it('should return "half-month" for a half month event', () => {
        const eventId = 'atomic-oyster-monthly-11AUG23-25AUG23';
        expect(getCsoLength(eventId)).to.equal('half-month');
      });

      it('should return "full-month" for a full month event', () => {
        const eventId = 'atomic-oyster-monthly-31JUL23-25AUG23';
        expect(getCsoLength(eventId)).to.equal('full-month');
      });

      it('should return "one-and-a-half-months" for a half month event starting one month earlier', () => {
        const eventId = 'atomic-oyster-monthly-14JUL23-25AUG23';
        expect(getCsoLength(eventId)).to.equal('one-and-a-half-months');
      });

      it('should return "two-months" for a two months event', () => {
        const eventId = 'atomic-oyster-monthly-3JUL23-25AUG23';
        expect(getCsoLength(eventId)).to.equal('two-months');
      });
    });
  });

  describe('Split Trades', () => {
    describe('getCsoTradeSplitEventId', () => {
      it('should generate split eventId properly', () => {
        const splitEventId = getCsoTradeSplitEventId('atomic', 'engine', 44);

        expect(splitEventId).to.equal('atomic-engine-trade-44');
      });
    });

    describe('getParamsFromCsoTradeSplitEventId', () => {
      it('should get params from split eventId properly', () => {
        const splitEventId = 'atomic-engine-trade-44';

        const { provider, strategyId, tradeIndex } =
          getParamsFromCsoTradeSplitEventId(splitEventId);

        expect(provider).to.equal('atomic');
        expect(strategyId).to.equal('engine');
        expect(tradeIndex).to.equal(44);
      });
    });

    describe('getCsoTradeUnsplitEventId', () => {
      it('should generate split eventId properly', () => {
        const unsplitEventId = getCsoTradeUnsplitEventId(
          lastFridays[0],
          'atomic',
          'oyster',
          5,
        );

        expect(unsplitEventId).to.equal('atomic-oyster-5-trades-28JAN22');
      });
    });

    describe('getParamsFromCsoTradeUnsplitEventId', () => {
      it('should get params from unsplit eventId properly', () => {
        const unsplitEventId = 'atomic-oyster-5-trades-28JAN22';

        const { provider, strategyId, numTrades, startDate } =
          getParamsFromCsoTradeUnsplitEventId(unsplitEventId);

        expect(provider).to.equal('atomic');
        expect(strategyId).to.equal('oyster');
        expect(numTrades).to.equal(5);
        expect(startDate.getTime()).to.equal(lastFridays[0].getTime());
      });
    });

    describe('getManualEventId', () => {
      it('should generate manual eventId properly', () => {
        const provider = 'atomic';
        const source = 'deribit';
        const maturity = lastFridays[0];
        const symbol = 'BTC';

        const manualEventId = getManualEventId(
          provider,
          source,
          maturity,
          symbol,
        );

        expect(manualEventId).to.equal('atomic-deribit-BTC-28JAN22');
      });
    });

    describe('getParamsFromManualEventId', () => {
      it('should get params from manual eventId properly', () => {
        const manualEventId = 'atomic-deribit-BTC-28JAN22';

        const { provider, source, symbol, maturity } =
          getParamsFromManualEventId(manualEventId);

        expect(provider).to.equal('atomic');
        expect(source).to.equal('deribit');
        expect(symbol).to.equal('BTC');
        expect(maturity.getTime()).to.equal(lastFridays[0].getTime());
      });
    });

    describe('getCsoEventIdType', () => {
      it('should output the correct eventId type', () => {
        const csoEventId = 'atomic-oyster-monthly-1AUG22-26AUG22';
        const splitEventId = 'atomic-engine-trade-44';
        const unsplitEventId = 'atomic-oyster-5-trades-28JAN22';

        expect(getCsoEventIdType(csoEventId)).to.equal('period');
        expect(getCsoEventIdType(splitEventId)).to.equal('split');
        expect(getCsoEventIdType(unsplitEventId)).to.equal('unsplit');
      });
    });

    describe('getEventIdType', () => {
      it('should correctly identify the type of eventId', () => {
        const periodEventId = 'atomic-oyster-monthly-1AUG22-26AUG22';
        const splitEventId = 'atomic-engine-trade-44';
        const unsplitEventId = 'atomic-oyster-5-trades-28JAN22';
        const manualEventId = 'atomic-deribit-BTC-14JUL23';

        expect(getEventIdType(periodEventId)).to.equal('period');
        expect(getEventIdType(splitEventId)).to.equal('split');
        expect(getEventIdType(unsplitEventId)).to.equal('unsplit');
        expect(getEventIdType(manualEventId)).to.equal('manual');
      });
    });

    describe('should parse eventId', () => {
      it('should parse eventId properly', () => {
        const eventId = 'atomic-oyster-monthly-3JUL23-28JUL23';
        const { provider, strategyId, period, startDate, endDate } =
          getParamsFromCsoEventId(eventId);

        expect(provider).to.equal('atomic');
        expect(strategyId).to.equal('oyster');
        expect(period).to.equal('monthly');
        expect(startDate.getTime()).to.equal(1688356800000);
        expect(endDate.getTime()).to.equal(1690531200000);
      });
    });
  });
});
