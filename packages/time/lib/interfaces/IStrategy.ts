export type Recurring = 'monthly' | 'weekly' | 'daily' | 'hourly';

export enum DayOfWeek {
  None = -1,
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Everyday = 7,
}

/**
 * A subset of the fields from the full strategy interface
 * Used to calculate the number of minutes until a strategy event
 */
export interface IStrategy {
  entryConditions: {
    startAt: number;
    endAt: number;
    recurring: Recurring;
    interval: number;
    dayOfWeek?: DayOfWeek;
  };
}
