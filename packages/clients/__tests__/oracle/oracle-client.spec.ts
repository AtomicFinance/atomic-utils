import { ConsoleTransport, Logger } from '@node-dlc/logger';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { OracleClient } from '../../lib';
import ORACLE from '../fixtures/oracleResponses';

const expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('Oracle client', () => {
  afterEach(() => {
    sinon.restore();
  });

  const logger = new Logger('oracle');
  logger.transports.push(new ConsoleTransport(console));
  const oracle = new OracleClient({
    uri: '',
    logger,
    apiKey: '123',
  });

  describe('getAnnouncements', () => {
    it('should succeed returning all announcements', async () => {
      const oracleSpy = sinon.stub(oracle, 'get');
      oracleSpy
        .withArgs('/announcements')
        .returns(ORACLE.ANNOUNCEMENTS_RESPONSE);
      const announcements = await oracle.getAnnouncements();

      expect(announcements).to.deep.equal(ORACLE.ANNOUNCEMENTS_RESPONSE);
    });

    it('fail if service is down', async () => {
      const oracleSpy = sinon.stub(oracle, 'axiosCall');
      oracleSpy.rejects(ORACLE.ECONNREFUSED);

      await expect(oracle.getAnnouncements()).to.be.rejectedWith(
        'Could not connect to Service',
      );
    });

    it('should succeed calling params', async () => {
      const oracleSpy = sinon.stub(oracle, 'get');
      oracleSpy
        .withArgs('/announcements', {
          offerId: ORACLE.ANNOUNCEMENT_RESPONSE.offerId,
        })
        .returns(ORACLE.ANNOUNCEMENTS_RESPONSE);

      await oracle.getAnnouncements(ORACLE.ANNOUNCEMENT_RESPONSE.offerId);

      expect(oracleSpy).to.be.calledOnceWithExactly('/announcements', {
        offerId: ORACLE.ANNOUNCEMENT_RESPONSE.offerId,
        startDate: undefined,
        endDate: undefined,
        page: undefined,
        limit: undefined,
      });
    });

    it('should succeed calling params', async () => {
      const oracleSpy = sinon.stub(oracle, 'get');
      oracleSpy
        .withArgs('/announcements', {
          offerId: ORACLE.ANNOUNCEMENT_RESPONSE.offerId,
          startDate: ORACLE.ANNOUNCEMENT_RESPONSE.startDate,
          endDate: ORACLE.ANNOUNCEMENT_RESPONSE.endDate,
          page: 1,
          limit: 10,
        })
        .returns(ORACLE.ANNOUNCEMENTS_RESPONSE);

      await oracle.getAnnouncements(
        ORACLE.ANNOUNCEMENT_RESPONSE.offerId,
        ORACLE.ANNOUNCEMENT_RESPONSE.startDate,
        ORACLE.ANNOUNCEMENT_RESPONSE.endDate,
        1,
        10,
      );

      expect(oracleSpy).to.be.calledOnceWithExactly('/announcements', {
        offerId: ORACLE.ANNOUNCEMENT_RESPONSE.offerId,
        startDate: ORACLE.ANNOUNCEMENT_RESPONSE.startDate,
        endDate: ORACLE.ANNOUNCEMENT_RESPONSE.endDate,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getAnnouncementByEventId', () => {
    it('should succeed returning announcement', async () => {
      const oracleSpy = sinon.stub(oracle);
      oracleSpy.getAnnouncementByEventId.resolves(ORACLE.ANNOUNCEMENT_RESPONSE);
      const announcement = await oracle.getAnnouncementByEventId(
        ORACLE.ANNOUNCEMENT_RESPONSE.eventId,
      );
      expect(announcement).to.deep.equal(ORACLE.ANNOUNCEMENT_RESPONSE);
    });
  });

  describe('getAnnouncementByAnnouncementId', () => {
    it('should succeed returning announcement', async () => {
      const oracleSpy = sinon.stub(oracle);
      oracleSpy.getAnnouncementByAnnouncementId.resolves(
        ORACLE.ANNOUNCEMENT_RESPONSE,
      );
      const announcement = await oracle.getAnnouncementByAnnouncementId(
        ORACLE.ANNOUNCEMENT_RESPONSE.announcementId,
      );
      expect(announcement).to.deep.equal(ORACLE.ANNOUNCEMENT_RESPONSE);
    });
  });

  describe('postAnnouncementQuantity', () => {
    it('should post quantity and return announcement with quantity', async () => {
      const oracleSpy = sinon.stub(oracle, 'post');
      oracleSpy
        .withArgs(
          `/announcements/${ORACLE.ANNOUNCEMENT_RESPONSE.eventId}/quantity`,
          { quantity: ORACLE.ANNOUNCEMENT_QUANTITY_RESPONSE.quantity },
        )
        .returns(ORACLE.ANNOUNCEMENT_QUANTITY_RESPONSE);
      const announcementWithQuantity = await oracle.postAnnouncementQuantity(
        ORACLE.ANNOUNCEMENT_RESPONSE.eventId,
        ORACLE.ANNOUNCEMENT_QUANTITY_RESPONSE.quantity,
      );

      expect(announcementWithQuantity).to.deep.equal(
        ORACLE.ANNOUNCEMENT_QUANTITY_RESPONSE,
      );
    });

    it('should fail incorrect API Key', async () => {
      const unauthorizedErrorMessage =
        'Unauthorized: Incorrect API Key. IP ::ffff:127.0.0.1';
      const oracleSpy = sinon.stub(oracle, 'axiosCall');
      oracleSpy.rejects(ORACLE.INCORRECT_API_KEY);

      await expect(
        oracle.postAnnouncementQuantity(
          ORACLE.ANNOUNCEMENT_RESPONSE.eventId,
          ORACLE.ANNOUNCEMENT_QUANTITY_RESPONSE.quantity,
        ),
      ).to.be.rejectedWith(unauthorizedErrorMessage);
    });

    it('should fail if API Key not provided', async () => {
      const oracle = new OracleClient({ uri: '', logger });

      expect(() =>
        oracle.postAnnouncementQuantity(
          ORACLE.ANNOUNCEMENT_RESPONSE.eventId,
          ORACLE.ANNOUNCEMENT_QUANTITY_RESPONSE.quantity,
        ),
      ).to.throw('API Key required for postAnnouncementQuantity');
    });
  });

  describe('react native', () => {
    it('should fail if incorrect base url', async () => {
      const oracleSpy = sinon.stub(oracle, 'axiosCall');
      oracleSpy.rejects(ORACLE.REACT_NATIVE_INCORRECT_BASE_URL_ERROR);
      await expect(oracle.getAnnouncements()).to.be.rejectedWith(
        'Invalid endpoint: GET /api/announcements/api/v1/announcements',
      );
    });
  });
});
