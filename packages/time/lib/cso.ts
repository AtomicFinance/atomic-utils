export type CsoEvent =
  | 'dlcExpiry'
  | 'dlcAttestation'
  | 'rolloverOpen'
  | 'newEntryOpen'
  | 'newEntryClosed'
  | 'tradingOpen'
  | 'halfMonthEntryClosed'
  | 'tradingOpenHalfMonth';

export type CsoPeriod = 'weekly' | 'monthly' | 'bimonthly';
export type CsoLength = 'fullmonth' | 'halfmonth';

export const DLC_EXPIRY_LEN = 7;
export const DLC_ATTESTATION_LEN = 1;
export const ROLLOVER_OPEN_LEN = 24;
export const NEW_ENTRY_OPEN_LEN = 36;
export const NEW_ENTRY_CLOSED_LEN = 8;
export const HALF_MONTH_ENTRY_CLOSED_LEN = 6;
export const TRADING_OPEN_HALF_MONTH_LEN = 334;

import { getStrDate } from '@atomic-utils/deribit';
import assert from 'assert';

export const STR_DATE_REGEX = /(\d{1,2})([A-Z]+)(\d{1,2})/;

/**
 * getLastFridayInMonth
 *
 * Pass in year and month and return Date object with
 * last friday of the month
 *
 * @param {number} y Year in full format (i.e. 2022)
 * @param {number} m Month NOT 0-indexed (i.e. 1 => January)
 * @returns {Date} last friday of month
 */
export const getLastFridayInMonth = (y: number, m: number): Date => {
  const lastDay = new Date(Date.UTC(y, m, 0, 8, 0, 0));
  if (lastDay.getDay() < 5) {
    lastDay.setDate(lastDay.getDate() - 7);
  }
  lastDay.setDate(lastDay.getDate() - (lastDay.getDay() - 5));

  return lastDay;
};

/**
 * getCurrentCycleMaturityDate
 *
 * @param {Date} t_ current time
 * @returns {Date} last friday in current cycle
 */
export const getCurrentCycleMaturityDate = (t_: Date): Date => {
  const t = new Date(t_.getTime()); // clone to avoid mutation

  let y = t.getUTCFullYear();
  assert(
    y >= 2009,
    `Invalid date provided ${t} with timestamp ${t.getTime()}, you may have used seconds instead of milliseconds`,
  );
  assert(
    y <= 2100,
    `Invalid date provided ${t} with timestamp ${t.getTime()}, you may have used microseconds instead of milliseconds`,
  );

  let m = t.getUTCMonth() + 1;
  let lastFriday = getLastFridayInMonth(y, m);

  if (t >= lastFriday) {
    t.setUTCDate(1);
    t.setUTCMonth(t.getUTCMonth() + 1);

    y = t.getUTCFullYear();
    m = t.getUTCMonth() + 1;
    lastFriday = getLastFridayInMonth(y, m);
  }

  return lastFriday;
};

/**
 * getNextCycleMaturityDate
 *
 * @param {Date} t_ current time
 * @returns {Date} last friday in next cycle
 */
export const getNextCycleMaturityDate = (t_: Date): Date => {
  const t = new Date(t_.getTime()); // clone to avoid mutation

  const currentLastFriday = getCurrentCycleMaturityDate(t);
  currentLastFriday.setUTCSeconds(currentLastFriday.getUTCSeconds() + 1);
  const nextLastFriday = getCurrentCycleMaturityDate(currentLastFriday);

  return nextLastFriday;
};

/**
 * getPreviousCycleMaturityDate
 *
 * @param {Date} t_ current time
 * @returns {Date} last friday in previous cycle
 */
export const getPreviousCycleMaturityDate = (t_: Date): Date => {
  const t = new Date(t_.getTime()); // clone to avoid mutation

  const currentLastFriday = getCurrentCycleMaturityDate(t);
  currentLastFriday.setUTCMonth(currentLastFriday.getUTCMonth() - 1);
  currentLastFriday.setUTCDate(currentLastFriday.getDate() - 14);
  const previousLastFriday = getCurrentCycleMaturityDate(currentLastFriday);

  return previousLastFriday;
};

export const getCsoEventDates = (t_: Date): CsoEventDates => {
  const t = new Date(t_.getTime());

  const upcomingDlcExpiry = getCurrentCycleMaturityDate(t);
  const previousDlcExpiry = getPreviousCycleMaturityDate(t);

  const dlcAttestation = new Date(previousDlcExpiry.getTime());
  dlcAttestation.setUTCHours(dlcAttestation.getUTCHours() + DLC_EXPIRY_LEN);
  const rolloverOpen = new Date(dlcAttestation.getTime());
  rolloverOpen.setUTCHours(rolloverOpen.getUTCHours() + DLC_ATTESTATION_LEN);
  const newEntryOpen = new Date(rolloverOpen.getTime());
  newEntryOpen.setUTCHours(newEntryOpen.getUTCHours() + ROLLOVER_OPEN_LEN);
  const newEntryClosed = new Date(newEntryOpen.getTime());
  newEntryClosed.setUTCHours(newEntryClosed.getUTCHours() + NEW_ENTRY_OPEN_LEN);
  const tradingOpen = new Date(newEntryClosed.getTime());
  tradingOpen.setUTCHours(tradingOpen.getUTCHours() + NEW_ENTRY_CLOSED_LEN);

  const tradingOpenHalfMonth = new Date(upcomingDlcExpiry.getTime());
  tradingOpenHalfMonth.setUTCHours(
    tradingOpenHalfMonth.getUTCHours() - TRADING_OPEN_HALF_MONTH_LEN,
  );
  const halfMonthEntryClosed = new Date(tradingOpenHalfMonth.getTime());
  halfMonthEntryClosed.setUTCHours(
    halfMonthEntryClosed.getUTCHours() - HALF_MONTH_ENTRY_CLOSED_LEN,
  );

  return {
    previousDlcExpiry,
    dlcAttestation,
    rolloverOpen,
    newEntryOpen,
    newEntryClosed,
    tradingOpen,
    halfMonthEntryClosed,
    tradingOpenHalfMonth,
    upcomingDlcExpiry,
  };
};

/**
 * getCsoEvent
 *
 * @param {Date} t_ current time
 * @returns {CsoEvent} which cso event the date provided is within
 */
export const getCsoEvent = (t_: Date): CsoEvent => {
  const t = new Date(t_.getTime());

  const {
    previousDlcExpiry,
    dlcAttestation,
    rolloverOpen,
    newEntryOpen,
    newEntryClosed,
    tradingOpen,
    halfMonthEntryClosed,
    tradingOpenHalfMonth,
    upcomingDlcExpiry,
  } = getCsoEventDates(t);

  switch (true) {
    case t >= previousDlcExpiry && t < dlcAttestation:
      return 'dlcExpiry';
    case t >= dlcAttestation && t < rolloverOpen:
      return 'dlcAttestation';
    case t >= rolloverOpen && t < newEntryOpen:
      return 'rolloverOpen';
    case t >= newEntryOpen && t < newEntryClosed:
      return 'newEntryOpen';
    case t >= newEntryClosed && t < tradingOpen:
      return 'newEntryClosed';
    case t >= tradingOpen && t < halfMonthEntryClosed:
      return 'tradingOpen';
    case t >= halfMonthEntryClosed && t < tradingOpenHalfMonth:
      return 'halfMonthEntryClosed';
    case t >= tradingOpenHalfMonth && t < upcomingDlcExpiry:
      return 'tradingOpenHalfMonth';
    case t.getTime() === upcomingDlcExpiry.getTime():
      return 'dlcExpiry';
  }
};

/**
 * getCsoStartAndEndDate
 *
 * Pass in current time and get start and end date of event that user can enter into
 * immediately
 *
 * @param t_ current time
 * @returns {StartEndDates} start and end dates of the CSO event
 */
export const getCsoStartAndEndDate = (t_: Date): StartEndDates => {
  const t = new Date(t_.getTime());

  const csoEvent = getCsoEvent(t);

  const { newEntryClosed, halfMonthEntryClosed, upcomingDlcExpiry } =
    getCsoEventDates(t);

  if (
    csoEvent === 'halfMonthEntryClosed' ||
    csoEvent === 'tradingOpenHalfMonth'
  ) {
    // Create full month for next month
    const nextT = new Date(upcomingDlcExpiry.getTime() + 1);

    const {
      newEntryClosed: nextNewEntryClosed,
      upcomingDlcExpiry: nextDlcExpiry,
    } = getCsoEventDates(nextT);

    return {
      startDate: nextNewEntryClosed,
      endDate: nextDlcExpiry,
    };
  } else if (csoEvent === 'newEntryClosed' || csoEvent === 'tradingOpen') {
    // Create half month event ID
    return {
      startDate: halfMonthEntryClosed,
      endDate: upcomingDlcExpiry,
    };
  } else {
    // Create full month for current month
    return {
      startDate: newEntryClosed,
      endDate: upcomingDlcExpiry,
    };
  }
};

/**
 * getCsoEventId
 *
 * Pass in Date and return event ID of announcement that user can enter into immediately
 *
 * @param {Date} t_ current time
 * @param {string} provider company or trader providing strategy
 * @param {string} strategyId unique identifier for strategy
 * @param {CsoPeriod} period i.e. monthly
 * @returns {string} event ID string i.e. atomic-call_spread_v1-monthly-27JUN22-29JUL22
 */
export const getCsoEventId = (
  t_: Date,
  provider: string,
  strategyId: string,
  period: CsoPeriod,
): string => {
  const t = new Date(t_.getTime());

  const { startDate, endDate } = getCsoStartAndEndDate(t);

  return [
    provider,
    strategyId,
    period,
    getStrDate(startDate),
    getStrDate(endDate),
  ].join('-');
};

/**
 * getStartAndEndDateFromCsoEventId
 *
 * Pass in eventId and return start and end date by checking if date is
 * equal to tradingOpen, tradingOpenHalfMonth or dlcExpiry, else just
 * output date inside cso params for eventId
 *
 * @param {string} eventId format [provider]-[strategyId]-[period]-[startDate]-[endDate]
 * @returns {CsoParams} provider, strategyId, period, and start and end dates
 */
export const getParamsFromCsoEventId = (eventId: string): CsoParams => {
  const eventParams = eventId.split('-');

  if (eventParams.length !== 5)
    throw Error(
      `Invalid eventId provided: ${eventId}. Expected format [provider]-[strategyId]-[period]-[startDate]-[endDate]`,
    );

  const [provider, strategyId, period, startDateStr, endDateStr] = eventParams;

  if (!STR_DATE_REGEX.test(startDateStr) || !STR_DATE_REGEX.test(endDateStr))
    throw new Error(
      `Invalid start or end date provided. Start Date: ${startDateStr}. End Date: ${endDateStr}`,
    );

  const startDate = extractCsoEventIdDateFromStr(startDateStr);
  const endDate = extractCsoEventIdDateFromStr(endDateStr);

  return {
    provider,
    strategyId,
    period,
    startDate,
    endDate,
  };
};

/**
 * extractCsoEventIdDateFromStr
 *
 * Get Date from string date while checking if date matches tradingOpen,
 * tradingOpenHalfMonth or dlcExpiry
 *
 * @param {string} dateStr string date in format [day][month][year] i.e. 21AUG22
 * @returns {Date}
 */
export const extractCsoEventIdDateFromStr = (dateStr: string): Date => {
  const [, day, month, year] = dateStr.match(STR_DATE_REGEX);

  // Set date to 12 PM UTC since it is between DLC Expiry and DLC Attestation
  // and also after Trading Open and Trading Open Half Month
  const date = new Date(`${month}-${day}-${year} 12:00:00 GMT`);

  const csoEvent = getCsoEvent(date);
  const {
    previousDlcExpiry,
    newEntryClosed,
    tradingOpen,
    tradingOpenHalfMonth,
    upcomingDlcExpiry,
  } = getCsoEventDates(date);

  if (csoEvent === 'tradingOpen') {
    if (date.getUTCDate() === tradingOpen.getUTCDate()) return newEntryClosed;
  } else if (csoEvent === 'tradingOpenHalfMonth') {
    if (date.getUTCDate() === tradingOpenHalfMonth.getUTCDate())
      return tradingOpenHalfMonth;
  } else if (csoEvent === 'dlcExpiry') {
    if (date.getUTCDate() === upcomingDlcExpiry.getUTCDate()) {
      return upcomingDlcExpiry;
    } else if (date.getUTCDate() === previousDlcExpiry.getUTCDate()) {
      return previousDlcExpiry;
    }
  } else {
    throw Error(
      `eventId dateStr invalid and likely on rollover weekend. CsoEvent: ${csoEvent}`,
    );
  }
  return date;
};

/**
 * findCycleMaturityMonthsInPast
 *
 * Enter number of cycles to look in past and get cycle maturity
 * i.e. passing in numMonths 3 will get the cycle maturity 3 months ago
 *
 * @param {Date} t_ current time
 * @param {number} numMonths number of months to go back
 * @returns {Date}
 */
export const findCycleMaturityMonthsInPast = (
  t_: Date,
  numMonths: number,
): Date => {
  let t = new Date(t_.getTime());

  if (numMonths === 0) throw Error('numMonths must be at least 1');

  for (let i = 0; i < numMonths; i++) {
    t = getPreviousCycleMaturityDate(new Date(t.getTime() - 1));
  }

  return t;
};

/**
 * findNumCyclesInPastMaturityExists
 *
 * Enter previousExpiry and find out how many months ago this expiry was
 *
 * @param {Date} t_ current time
 * @param {Date} previousExpiry previous cycle expiry
 * @returns {number}
 */
export const findNumCyclesInPastMaturityExists = (
  t_: Date,
  previousExpiry_: Date,
  maxTries = 1000,
): number => {
  let t = new Date(t_.getTime());

  if (previousExpiry_.getTime() >= t.getTime())
    throw Error('Previous Expiry should be less than current date');
  if (getCsoEvent(previousExpiry_) !== 'dlcExpiry')
    throw Error('Previous Expiry should be in time period dlcExpiry');

  const { previousDlcExpiry } = getCsoEventDates(previousExpiry_);
  const previousExpiry = previousDlcExpiry;

  if (t.getTime() === previousExpiry.getTime()) return 0;

  for (let i = 0; i < maxTries; i++) {
    t = getPreviousCycleMaturityDate(new Date(t.getTime() - 1));
    if (t.getTime() === previousExpiry.getTime()) return i + 1;
  }

  throw Error(
    `Could not find cycle maturity in the past after checking ${maxTries} months`,
  );
};

export interface StartEndDates {
  startDate: Date;
  endDate: Date;
}

export interface CsoParams {
  provider: string;
  strategyId: string;
  period: string;
  startDate: Date;
  endDate: Date;
}

export interface CsoEventDates {
  previousDlcExpiry: Date;
  dlcAttestation: Date;
  rolloverOpen: Date;
  newEntryOpen: Date;
  newEntryClosed: Date;
  tradingOpen: Date;
  halfMonthEntryClosed: Date;
  tradingOpenHalfMonth: Date;
  upcomingDlcExpiry: Date;
}
