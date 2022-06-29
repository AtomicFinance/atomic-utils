import { DayOfWeek, IStrategy } from './interfaces/IStrategy';

export const TIME_MINUTES = {
  _7days: 7 * 24 * 60,
};

export const TIME_MILISECS = {
  _24hours: 24 * 60 * 60 * 1000,
  _1hour: 60 * 60 * 1000,
  _1min: 60 * 1000,
};

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Calculate the number of days between
 * current time and a particular day of week
 * @param {Date} t current time
 * @param {DayOfWeek} d day of week
 * @returns {number} number of days
 */
export const daysUntil = (t: Date, d: DayOfWeek): number => {
  if (d === -1 || d === 7) {
    return 0;
  }

  let dayDiff = d - t.getUTCDay();
  if (dayDiff < 0) dayDiff += 7;

  return dayDiff;
};

/**
 * Calculate the minutes until a certain time and day
 *
 * Note: time of day is derived from t, and day of
 * week is derived from numDays
 * @param {Date} t current time
 * @param {number} numDays number of days until strategy day
 * @returns {number} number of minutes
 */
export const minutesUntil = (t: Date, numDays: number): number => {
  const minutes = t.getUTCMinutes();
  const hours = t.getUTCHours();
  return numDays * 24 * 60 - minutes - hours * 60;
};

/**
 * Calculate how many minutes until strategy startAt
 * @param {Date} t current time
 * @param {IStrategy} s The strategy
 * @returns {number} number of minutes
 */
export const minutesUntilStrategyStart = (t: Date, s: IStrategy): number => {
  return minutesUntilStrategyEvent(t, s, 'start');
};

/**
 * Calculate how many minutes until strategy endAt
 * @param {Date} t current time
 * @param {IStrategy} s The strategy
 * @returns {number} number of minutes
 */
export const minutesUntilStrategyEnd = (t: Date, s: IStrategy): number => {
  return minutesUntilStrategyEvent(t, s, 'end');
};

/**
 * Calculate how many minutes until strategy event
 * @param {Date} t current time
 * @param {IStrategy} s The strategy
 * @returns {number} number of minutes
 */
export const minutesUntilStrategyEvent = (
  t: Date,
  s: IStrategy,
  event: 'start' | 'end',
): number => {
  // hourly strategies' endAt are ignored – stop monitoring after an hour.
  if (event === 'end' && s.entryConditions.recurring == 'hourly') {
    const nearestXHour = roundToXHour(t, 1);
    return (+nearestXHour - +t) / TIME_MILISECS._1min;
  }

  const minutesUntilEvent =
    minutesUntil(t, daysUntil(t, s.entryConditions.dayOfWeek)) +
    (event === 'start' ? s.entryConditions.startAt : s.entryConditions.endAt);

  const finalMinutesUntilEvent =
    minutesUntilEvent <= 0
      ? minutesUntilEvent + TIME_MINUTES._7days
      : minutesUntilEvent;

  return finalMinutesUntilEvent;
};

/**
 * roundtoXHour rounds up to the nearest X Hour (i.e. round to nearest 4 hour)
 * @param date current Date
 * @param x multiplier
 * @returns Date
 */
export const roundToXHour = (date: Date, x: number): Date => {
  const p = x * 60 * 60 * 1000;
  return new Date(Math.ceil(date.getTime() / p) * p);
};
