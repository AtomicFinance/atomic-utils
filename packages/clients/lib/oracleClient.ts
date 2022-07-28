import { BaseClient } from './baseClient';

export interface Nonce {
  nonce: string;
}

export interface Announcement {
  announcementId: string;
  eventId: string;
  offerId: string;
  announcement: string;
  attestation?: string;
  cso: boolean;
  startDate: number;
  endDate: number;
  nonces: Nonce[];
  quantity?: number;
  outcome?: string;
}

export interface AnnouncementResponse {
  announcements: Announcement[];
}

/**
 * Oracle client
 */
export class OracleClient extends BaseClient {
  /**
   * getAnnouncements
   *
   * Get all announcements
   *
   * @returns
   */
  public getAnnouncements(
    offerId?: string,
    startDate?: number,
    endDate?: number,
    page?: number,
    limit?: number,
  ): Promise<AnnouncementResponse> {
    return this.get('/announcements', {
      offerId,
      startDate,
      endDate,
      page,
      limit,
    });
  }

  /**
   * getAnnouncementByEventId
   *
   * Get Announcement By Event ID
   *
   * @param {string} eventId the eventId for the DLC OracleAnnouncement
   *                         https://github.com/discreetlogcontracts/dlcspecs/blob/master/Messaging.md#oracle_event
   * @returns {Announcement}
   */
  public getAnnouncementByEventId(eventId: string): Promise<Announcement> {
    return this.get(`/announcements/${eventId}`);
  }

  /**
   * getAnnouncementByAnnouncementId
   *
   * Get Announcement By Annoucement ID
   *
   * @param {string} announcementId the announcementId for the DLC OracleAnnouncement
   *                         https://github.com/discreetlogcontracts/dlcspecs/blob/master/Messaging.md#oracle_event
   * @returns {Announcement}
   */
  public async getAnnouncementByAnnouncementId(
    announcementId: string,
  ): Promise<Announcement> {
    const response = await this.get(`/announcements/`, { announcementId });
    if (response.announcements.length === 0) {
      throw Error(`Announcement ${announcementId} not found`);
    }

    return response.announcements[0];
  }

  /**
   * postAnnouncementQuantity
   *
   * Specify quantity of funds entered for a particular announcement
   * Note: this function does not modify the DLC OracleAnnouncement
   *       itself but rather the Oracle internal DB
   *
   * @param {string} eventId the eventId for the DLC OracleAnnouncement
   *                         https://github.com/discreetlogcontracts/dlcspecs/blob/master/Messaging.md#oracle_event
   * @param {number} quantity the quantity entered in SATS
   * @returns {Announcement} return modified announcement
   */
  public postAnnouncementQuantity(
    eventId: string,
    quantity: number,
  ): Promise<Announcement> {
    if (!this.opts.apiKey)
      throw Error('API Key required for postAnnouncementQuantity');

    return this.post(`/announcements/${eventId}/quantity`, { quantity });
  }
}
