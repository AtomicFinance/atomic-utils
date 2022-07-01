import { ConsoleTransport, Logger } from '@node-dlc/logger';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { StrategyClient } from '../../lib';
import STRATEGY from '../fixtures/strategyResponses';

const expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('Strategy client', () => {
  afterEach(() => {
    sinon.restore();
  });

  const strategyName = 'ribbon';
  const logger = new Logger('strategy');
  logger.transports.push(new ConsoleTransport(console));
  const strategyClient = new StrategyClient({ uri: '', logger });

  describe('getStrategy', () => {
    it('should succeed in returning strategy information', async () => {
      const strategySpy = sinon.stub(strategyClient, 'get');
      strategySpy
        .withArgs(`/${strategyName}`)
        .returns(STRATEGY.STRATEGY_RESPONSE);
      const announcements = await strategyClient.getStrategy(strategyName);

      expect(announcements).to.deep.equal(STRATEGY.STRATEGY_RESPONSE);
    });

    it('fail if service is down', async () => {
      const loggerSpy = sinon.stub(logger, 'error');

      const strategySpy = sinon.stub(strategyClient, 'axiosCall');
      strategySpy.rejects(STRATEGY.ECONNREFUSED);

      await strategyClient.getStrategy(strategyName);

      expect(loggerSpy).to.be.calledOnceWith(
        'Error: Could not connect to Strategy Service ',
      );
    });
  });

  describe('getStrategyTrades', () => {
    it('should succeed returning all strategy trades', async () => {
      const strategySpy = sinon
        .stub(strategyClient, 'get')
        .withArgs(`/${strategyName}/trades`)
        .returns(STRATEGY.STRATEGY_TRADES_RESPONSE);

      const announcement = await strategyClient.getStrategyTrades(strategyName);

      expect(announcement).to.deep.equal(STRATEGY.STRATEGY_TRADES_RESPONSE);
      expect(strategySpy).to.be.calledOnceWithExactly(
        `/${strategyName}/trades`,
        {
          startDate: undefined,
          endDate: undefined,
        },
      );
    });

    it('should succeed returning strategy trades filtered by start date', async () => {
      const strategySpy = sinon
        .stub(strategyClient, 'get')
        .withArgs(`/${strategyName}/trades`, {
          startDate: 2000,
          endDate: undefined,
        })
        .returns(STRATEGY.STRATEGY_TRADES_FILTERED_START_RESPONSE);

      const announcement = await strategyClient.getStrategyTrades(
        strategyName,
        { startDate: 2000 },
      );

      expect(announcement).to.deep.equal(
        STRATEGY.STRATEGY_TRADES_FILTERED_START_RESPONSE,
      );
      expect(strategySpy).to.be.calledOnceWithExactly(
        `/${strategyName}/trades`,
        {
          startDate: 2000,
          endDate: undefined,
        },
      );
    });

    it('should succeed returning strategy trades filtered by end date', async () => {
      const strategySpy = sinon
        .stub(strategyClient, 'get')
        .withArgs(`/${strategyName}/trades`, {
          startDate: undefined,
          endDate: 2000,
        })
        .returns(STRATEGY.STRATEGY_TRADES_FILTERED_END_RESPONSE);

      const announcement = await strategyClient.getStrategyTrades(
        strategyName,
        { endDate: 2000 },
      );

      expect(announcement).to.deep.equal(
        STRATEGY.STRATEGY_TRADES_FILTERED_END_RESPONSE,
      );
      expect(strategySpy).to.be.calledOnceWithExactly(
        `/${strategyName}/trades`,
        {
          startDate: undefined,
          endDate: 2000,
        },
      );
    });
  });

  describe('getStrategyState', () => {
    it('should succeed returning strategy state', async () => {
      const strategySpy = sinon
        .stub(strategyClient, 'get')
        .withArgs(`/${strategyName}/state`)
        .returns(STRATEGY.STRATEGY_STATE_RESPONSE);

      const announcement = await strategyClient.getStrategyState(strategyName);

      expect(announcement).to.deep.equal(STRATEGY.STRATEGY_STATE_RESPONSE);
      expect(strategySpy).to.be.calledOnceWithExactly(`/${strategyName}/state`);
    });
  });
});