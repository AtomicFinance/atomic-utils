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
export type CsoLength =
  | 'full-month'
  | 'half-month'
  | 'one-and-a-half-months'
  | 'two-months';

export type CsoEventIdType = 'period' | 'split' | 'unsplit';

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
  if (lastDay.getUTCDay() < 5) {
    lastDay.setDate(lastDay.getDate() - 7);
  }
  lastDay.setDate(lastDay.getDate() - (lastDay.getUTCDay() - 5));

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
    y >= 2009, // since cycle maturity cannot be before Bitcoin was created
    `Invalid date provided ${t} with timestamp ${t.getTime()}, you may have used seconds instead of milliseconds`,
  );
  assert(
    y <= 2100, // reasonable upper bound
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
export const getCsoStartAndEndDate = (
  t_: Date,
  forceExtendedPeriod = false,
): StartEndDates => {
  const t = new Date(t_.getTime());

  const csoEvent = getCsoEvent(t);

  const { newEntryClosed, halfMonthEntryClosed, upcomingDlcExpiry } =
    getCsoEventDates(t);

  const { upcomingDlcExpiry: followingDlcExpiry } = getCsoEventDates(
    new Date(upcomingDlcExpiry.getTime() + 1),
  );

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

    const { upcomingDlcExpiry: followingDlcExpiry } = getCsoEventDates(
      new Date(nextDlcExpiry.getTime() + 1),
    );

    return {
      startDate: nextNewEntryClosed,
      endDate: forceExtendedPeriod ? followingDlcExpiry : nextDlcExpiry,
    };
  } else if (csoEvent === 'newEntryClosed' || csoEvent === 'tradingOpen') {
    // Create half month event ID
    return {
      startDate: halfMonthEntryClosed,
      endDate: forceExtendedPeriod ? followingDlcExpiry : upcomingDlcExpiry,
    };
  } else {
    // Create full month for current month
    return {
      startDate: newEntryClosed,
      endDate: forceExtendedPeriod ? followingDlcExpiry : upcomingDlcExpiry,
    };
  }
};

/**
 * getUpcomingFriday
 *
 * From the current time, get the upcoming Friday.
 * If the current time is Friday and is after 8am UTC, then return the next week's Friday
 *
 * @param {Date} t_ current time
 * @returns
 */
export const getUpcomingFriday = (t_: Date): Date => {
  const t = new Date(t_.getTime());
  let dayDelta = (5 - t.getUTCDay()) % 7;

  if (dayDelta === 0 && t.getUTCHours() >= 8) {
    dayDelta = 7;
  }

  t.setUTCDate(t.getUTCDate() + dayDelta);

  return new Date(t.setUTCHours(8, 0, 0, 0));
};

/**
 * getPreviousFriday
 *
 * From the current time, get the previous Friday.
 * If the current time is Friday and is before 8am UTC, then return the previous week's Friday
 *
 * @param {Date} t_ current time
 * @returns
 */
export const getPreviousFriday = (t_: Date): Date => {
  const t = new Date(t_.getTime());
  let dayDelta = (5 - t.getUTCDay() + 7) % 7;

  if (
    dayDelta === 0 &&
    (t.getUTCHours() > 8 ||
      (t.getUTCHours() === 8 &&
        t.getUTCMinutes() === 0 &&
        t.getUTCSeconds() > 0) ||
      (t.getUTCHours() === 8 && t.getUTCMinutes() > 0))
  ) {
    dayDelta = 7;
  }

  t.setUTCDate(t.getUTCDate() - (7 - dayDelta));

  return new Date(t.setUTCHours(8, 0, 0, 0));
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
  forceExtendedPeriod = false,
): string => {
  const t = new Date(t_.getTime());

  const { startDate, endDate } = getCsoStartAndEndDate(t, forceExtendedPeriod);

  return [
    provider,
    strategyId,
    period,
    getStrDate(startDate),
    getStrDate(endDate),
  ].join('-');
};

/**
 * getCsoTradeSplitEventId
 *
 * This function generates an event ID for a split trade.
 *
 * @param {string} provider - The company or trader providing the strategy.
 * @param {string} strategyId - The unique identifier for the strategy.
 * @param {number} tradeIndex - The index of the trade.
 * @returns {string} - The event ID string in the format [provider]-[strategyId]-trade-[tradeIndex].
 *                     i.e. atomic-oyster-trade-84
 */
export const getCsoTradeSplitEventId = (
  provider: string,
  strategyId: string,
  tradeIndex: number,
): string => {
  return [provider, strategyId, 'trade', tradeIndex].join('-');
};

/**
 * getCsoTradeUnsplitEventId
 *
 * This function generates an event ID for an unsplit trade.
 *
 * @param {Date} t_ - The current time.
 * @param {string} provider - The company or trader providing the strategy.
 * @param {string} strategyId - The unique identifier for the strategy.
 * @param {number} numTrades - The number of trades.
 * @returns {string} - The event ID string in the format [provider]-[strategyId]-[numTrades]-trades-[startDate].
 *                     i.e. atomic-oyster-5-trades-1JAN24
 */
export const getCsoTradeUnsplitEventId = (
  t_: Date,
  provider: string,
  strategyId: string,
  numTrades: number,
): string => {
  const t = new Date(t_.getTime());

  return [provider, strategyId, numTrades, 'trades', getStrDate(t)].join('-');
};

export const getManualEventId = (
  provider: string,
  source: string,
  maturity: Date,
  symbol = 'BTC',
): string => {
  const month = maturity
    .toLocaleString('default', { month: 'short' })
    .toUpperCase()
    .split('.')[0];
  const year = maturity.getFullYear().toString().slice(-2);
  const day = maturity.getDate().toString();
  return `${provider}-${source}-${symbol}-${day}${month}${year}`;
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

export const getParamsFromCsoTradeSplitEventId = (
  eventId: string,
): CsoSplitParams => {
  const eventParams = eventId.split('-');

  if (eventParams.length !== 4)
    throw Error(
      `Invalid eventId provided: ${eventId}. Expected format [provider]-[strategyId]-[trade]-[tradeIndex]`,
    );

  const [provider, strategyId, , tradeIndexStr] = eventParams;

  const tradeIndex = parseInt(tradeIndexStr);

  if (isNaN(tradeIndex))
    throw Error(
      `Invalid tradeIndex provided: ${tradeIndexStr}. Expected integer`,
    );

  return {
    provider,
    strategyId,
    tradeIndex,
  };
};

export const getParamsFromCsoTradeUnsplitEventId = (
  eventId: string,
): CsoUnsplitParams => {
  const eventParams = eventId.split('-');

  if (eventParams.length !== 5)
    throw Error(
      `Invalid eventId provided: ${eventId}. Expected format [provider]-[strategyId]-[numTrades]-[trades]-[startDate]`,
    );

  const [provider, strategyId, numTradesStr, , startDateStr] = eventParams;

  const numTrades = parseInt(numTradesStr);

  if (isNaN(numTrades))
    throw Error(
      `Invalid numTrades provided: ${numTradesStr}. Expected integer`,
    );

  if (!STR_DATE_REGEX.test(startDateStr))
    throw new Error(`Invalid start date provided: ${startDateStr}`);

  const startDate = extractCsoEventIdDateFromStr(startDateStr);

  return {
    provider,
    strategyId,
    numTrades,
    startDate,
  };
};

/**
 * getParamsFromManualEventId
 *
 * Pass in eventId and return provider, source, maturity, and symbol
 *
 * @param {string} eventId format [provider]-[source]-[symbol]-[maturity]
 * @returns {ManualEventParams} provider, source, maturity, and symbol
 */
export const getParamsFromManualEventId = (
  eventId: string,
): ManualEventParams => {
  const eventParams = eventId.split('-');

  if (eventParams.length !== 4)
    throw Error(
      `Invalid eventId provided: ${eventId}. Expected format [provider]-[source]-[symbol]-[maturity]`,
    );

  const [provider, source, symbol, maturityStr] = eventParams;

  if (!STR_DATE_REGEX.test(maturityStr))
    throw new Error(`Invalid maturity date provided: ${maturityStr}`);

  const maturity = extractCsoEventIdDateFromStr(maturityStr);

  return {
    provider,
    source,
    symbol,
    maturity,
  };
};

export const getCsoEventIdType = (eventId: string): CsoEventIdType => {
  const eventParams = eventId.split('-');

  // Check the length and specific parts of the split eventId to determine its type
  switch (eventParams.length) {
    case 5:
      // If the eventId splits into 5 parts, it could be 'period' or 'unsplit'
      // Check the fourth part to differentiate
      return eventParams[3] === 'trades' ? 'unsplit' : 'period';
    case 4:
      // If the eventId splits into 4 parts, it's a 'split'
      return 'split';
    default:
      // If the eventId doesn't match the above cases, throw an error
      throw new Error(`Invalid eventId provided: ${eventId}`);
  }
};

export const getEventIdType = (eventId: string): CsoEventIdType | 'manual' => {
  const eventParams = eventId.split('-');

  // Check if the eventId is of type 'manual'
  if (eventParams.length === 4 && eventParams[2] !== 'trade') {
    return 'manual';
  }

  // If not 'manual', use the existing function to determine the type
  return getCsoEventIdType(eventId);
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

/**
 * isHalfMonth
 *
 * Determine if the current cycle is a half month cycle
 * @param {string} eventId current time
 * @returns {boolean} whether the current cycle is a half month
 */
export const isHalfMonth = (eventId: string): boolean => {
  const startDate = getParamsFromCsoEventId(eventId).startDate;
  return (
    startDate.getTime() ===
      getCsoEventDates(startDate).tradingOpenHalfMonth.getTime() ||
    startDate.getTime() ===
      getCsoEventDates(startDate).halfMonthEntryClosed.getTime()
  );
};

export const getCsoLength = (eventId: string): CsoLength => {
  const { startDate, endDate } = getParamsFromCsoEventId(eventId);

  const containsHalfMonth = isHalfMonth(eventId);

  // Get the difference in days
  const diffInDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (containsHalfMonth) {
    if (diffInDays > 30) return 'one-and-a-half-months';
    else return 'half-month';
  } else {
    if (diffInDays > 45) return 'two-months';
    else return 'full-month';
  }
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

export interface CsoSplitParams {
  provider: string;
  strategyId: string;
  tradeIndex: number;
}

export interface CsoUnsplitParams {
  provider: string;
  strategyId: string;
  numTrades: number;
  startDate: Date;
}

export interface ManualEventParams {
  provider: string;
  source: string;
  symbol: string;
  maturity: Date;
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
