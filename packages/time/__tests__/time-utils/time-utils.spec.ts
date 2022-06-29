import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import {
  daysUntil,
  minutesUntil,
  minutesUntilStrategyEnd,
  TIME_MINUTES,
} from '../../lib';
import { DayOfWeek, Recurring } from '../../lib/interfaces/IStrategy';

chai.use(sinonChai);

describe('Time utilities', () => {
  describe('daysUntil', () => {
    const mockStrategy = {
      name: 'unit-test-strategy-1',
      enabled: true,
      test: true,
      entryConditions: {
        startAt: 0,
        endAt: 1440,
        recurring: 'weekly' as Recurring,
        interval: 1,
        dayOfWeek: DayOfWeek.Friday,
      },
    };

    it('should correctly calculate daysUntil for all days of week', () => {
      const t1 = new Date(Date.UTC(2021, 10, 5)); // month is 0-indexed 2021-11-5
      const n1 = daysUntil(t1, mockStrategy.entryConditions.dayOfWeek);

      const t2 = new Date(Date.UTC(2021, 10, 6));
      const n2 = daysUntil(t2, mockStrategy.entryConditions.dayOfWeek);

      const t3 = new Date(Date.UTC(2021, 10, 7));
      const n3 = daysUntil(t3, mockStrategy.entryConditions.dayOfWeek);

      const t4 = new Date(Date.UTC(2021, 10, 8));
      const n4 = daysUntil(t4, mockStrategy.entryConditions.dayOfWeek);

      const t5 = new Date(Date.UTC(2021, 10, 9));
      const n5 = daysUntil(t5, mockStrategy.entryConditions.dayOfWeek);

      const t6 = new Date(Date.UTC(2021, 10, 10));
      const n6 = daysUntil(t6, mockStrategy.entryConditions.dayOfWeek);

      const t7 = new Date(Date.UTC(2021, 10, 11));
      const n7 = daysUntil(t7, mockStrategy.entryConditions.dayOfWeek);

      const t8 = new Date(Date.UTC(2021, 10, 12));
      const n8 = daysUntil(t8, mockStrategy.entryConditions.dayOfWeek);

      expect(n1).to.equal(0);
      expect(n2).to.equal(6);
      expect(n3).to.equal(5);
      expect(n4).to.equal(4);
      expect(n5).to.equal(3);
      expect(n6).to.equal(2);
      expect(n7).to.equal(1);
      expect(n8).to.equal(0);
    });

    it('should calculate for almost end of day', () => {
      const t = new Date(Date.UTC(2021, 10, 5, 23, 59));
      const n = daysUntil(t, mockStrategy.entryConditions.dayOfWeek);

      expect(n).to.equal(0);
    });
  });

  describe('minutesUntil', () => {
    it('should return minutes until for numDays = 4 correctly', async () => {
      const minutes = minutesUntil(new Date(), 4);

      // 4 days from now at 00:00:00 UTC
      const futureDate =
        new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() +
        4 * 24 * 60 * 60 * 1000;

      const expectedMinutes = Math.ceil(
        (futureDate - new Date().getTime()) / (60 * 1000),
      );

      expect(minutes).to.equal(expectedMinutes);
    });

    it('should return minutes until for numDays = 7 correctly', async () => {
      const minutes = minutesUntil(new Date(), 7);

      // 7 days from now at 00:00:00 UTC
      const futureDate =
        new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() +
        7 * 24 * 60 * 60 * 1000;

      const expectedMinutes = Math.ceil(
        (futureDate - new Date().getTime()) / (60 * 1000),
      );

      expect(minutes).to.equal(expectedMinutes);
    });

    it('should return minutes until for numDays = 0 correctly (should be zero or negative)', async () => {
      const minutes = minutesUntil(new Date(), 0);

      const futureDate = new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime();

      const expectedMinutes = Math.ceil(
        (futureDate - new Date().getTime()) / (60 * 1000),
      );

      expect(minutes).to.equal(expectedMinutes);
      expect(minutes).to.be.lessThanOrEqual(0);
    });
  });

  describe('minutesUntilStrategyEnd', () => {
    it('should return minutes until for numDays = 0 correctly, if strategy has not yet ended', async () => {
      const t = new Date(Date.UTC(2020, 0, 1, 5, 0));

      const minutes = t.getUTCMinutes();
      const hours = t.getUTCHours();

      const minutesOfDayThusFar = minutes + hours * 60;
      const expectedMinutesUntilEnd = 5;

      const mockStrategy = {
        name: 'unit-test-strategy-1',
        enabled: true,
        test: true,
        entryConditions: {
          startAt: 0,
          endAt: minutesOfDayThusFar + expectedMinutesUntilEnd, // mock strategy ending in five minutes
          recurring: 'weekly' as Recurring,
          interval: 1,
          dayOfWeek: t.getUTCDay(),
        },
      };

      const calculatedMinutesUntilEnd = minutesUntilStrategyEnd(
        t,
        mockStrategy,
      );

      expect(calculatedMinutesUntilEnd).to.equal(expectedMinutesUntilEnd);
    });

    it('should return minutes until for numDays = 0 correctly, if strategy has not yet started nor ended', async () => {
      const t = new Date(Date.UTC(2020, 0, 1, 5, 0));

      const minutes = t.getUTCMinutes();
      const hours = t.getUTCHours();

      const minutesOfDayThusFar = minutes + hours * 60;
      const expectedMinutesUntilEnd = 5;

      const mockStrategy = {
        name: 'unit-test-strategy-1',
        enabled: true,
        test: true,
        entryConditions: {
          startAt: minutesOfDayThusFar + 1,
          endAt: minutesOfDayThusFar + expectedMinutesUntilEnd, // mock strategy ending in five minutes
          recurring: 'weekly' as Recurring,
          interval: 1,
          dayOfWeek: t.getUTCDay(),
        },
      };

      const calculatedMinutesUntilEnd = minutesUntilStrategyEnd(
        t,
        mockStrategy,
      );

      expect(calculatedMinutesUntilEnd).to.equal(expectedMinutesUntilEnd);
    });

    it('should return minutes until for numDays = 0 correctly, if strategy has ended five minutes ago', async () => {
      const t = new Date(Date.UTC(2020, 0, 1, 5, 0));

      const minutes = t.getUTCMinutes();
      const hours = t.getUTCHours();

      const minutesOfDayThusFar = minutes + hours * 60;
      const expectedMinutesAfterEnd = 5;

      const mockStrategy = {
        name: 'unit-test-strategy-1',
        enabled: true,
        test: true,
        entryConditions: {
          startAt: 0,
          endAt: minutesOfDayThusFar - expectedMinutesAfterEnd, // mock strategy ended five minutes ago
          recurring: 'weekly' as Recurring,
          interval: 1,
          dayOfWeek: t.getUTCDay(),
        },
      };

      const calculatedMinutesUntilEnd = minutesUntilStrategyEnd(
        t,
        mockStrategy,
      );

      expect(calculatedMinutesUntilEnd).to.equal(
        TIME_MINUTES._7days - expectedMinutesAfterEnd,
      );
    });

    it('should return minutes until for numDays = 0 correctly, if strategy has ended now', async () => {
      const t = new Date(Date.UTC(2020, 0, 1, 5, 0));

      const minutes = t.getUTCMinutes();
      const hours = t.getUTCHours();

      const minutesOfDayThusFar = minutes + hours * 60;

      const mockStrategy = {
        name: 'unit-test-strategy-1',
        enabled: true,
        test: true,
        entryConditions: {
          startAt: 0,
          endAt: minutesOfDayThusFar, // mock strategy ended five minutes ago
          recurring: 'weekly' as Recurring,
          interval: 1,
          dayOfWeek: t.getUTCDay(),
        },
      };

      const calculatedMinutesUntilEnd = minutesUntilStrategyEnd(
        t,
        mockStrategy,
      );

      expect(calculatedMinutesUntilEnd).to.equal(TIME_MINUTES._7days);
    });
  });
});
