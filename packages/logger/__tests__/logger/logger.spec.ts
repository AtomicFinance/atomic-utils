import { Logger, LogLevel } from '@node-dlc/logger';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sentryTestkit from 'sentry-testkit';

import {
  ITransport,
  SentryTransport,
} from '../../lib/transports/sentry-transport';

const { testkit, sentryTransport } = sentryTestkit();
const DUMMY_DSN = 'https://acacaeaccacacacabcaacdacdacadaca@sentry.io/000001';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Logger', () => {
  let transport: ITransport;
  let sut: Logger;

  beforeEach(() => {
    transport = new SentryTransport({
      dsn: DUMMY_DSN,
      transport: sentryTransport,
    });
    sut = new Logger();
    sut.transports.push(transport);
    sut.level = LogLevel.Trace;
    testkit.reset();
  });

  it('should generate sentry warning report', async () => {
    sut.warn('testing failed');
    await sleep(50);

    expect(testkit.reports()).is.not.empty;
    expect(testkit.reports()[0].message).to.match(
      /\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d\d\dZ \[WRN\]: testing failed/,
    );
  });

  it('should generate sentry error report', async () => {
    sut.error(new Error('testing'));
    await sleep(50);

    expect(testkit.reports()).is.not.empty;
    expect(testkit.reports()[0].error.message).to.equal('testing');
  });
});

const sleep = (ms: number): Promise<unknown> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
