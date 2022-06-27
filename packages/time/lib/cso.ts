export type CsoEvent =
  | 'dlcExpiry'
  | 'dlcAttestation'
  | 'rolloverOpen'
  | 'newEntryOpen'
  | 'newEntryClosed'
  | 'tradingOpen';

export const DLC_EXPIRY_LEN = 7;
export const DLC_ATTESTATION_LEN = 1;
export const ROLLOVER_OPEN_LEN = 24;
export const NEW_ENTRY_OPEN_LEN = 36;
export const NEW_ENTRY_CLOSED_LEN = 8;

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
  let m = t.getUTCMonth() + 1;
  let lastFriday = getLastFridayInMonth(y, m);

  if (t > lastFriday) {
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
  currentLastFriday.setUTCDate(currentLastFriday.getDate() - 7);
  const previousLastFriday = getCurrentCycleMaturityDate(currentLastFriday);

  return previousLastFriday;
};

/**
 * getCsoEvent
 *
 * @param {Date} t_ current time
 * @returns {CsoEvent} which cso event the date provided is within
 */
export const getCsoEvent = (t_: Date): CsoEvent => {
  const t = new Date(t_.getTime());

  const previousDlcExpiry = getPreviousCycleMaturityDate(t);
  const upcomingDlcExpiry = getCurrentCycleMaturityDate(t);

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
    case t >= tradingOpen && t < upcomingDlcExpiry:
      return 'tradingOpen';
    case t.getTime() === upcomingDlcExpiry.getTime():
      return 'dlcExpiry';
  }
};
