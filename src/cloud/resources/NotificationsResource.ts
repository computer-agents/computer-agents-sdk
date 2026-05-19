/**
 * Notifications Resource Manager
 *
 * Handles in-app product notifications and push token registration.
 */

import type { ApiClient } from '../ApiClient';
import type {
  InAppNotification,
  PushTokenDeleteResponse,
  PushTokenDescriptor,
  PushTokenRegistration,
  PushTokenRegistrationResponse,
} from '../types';

export class NotificationsResource {
  constructor(private readonly client: ApiClient) {}

  /**
   * List active in-app product notifications.
   */
  async listInApp(): Promise<InAppNotification[]> {
    const response = await this.client.get<{ data: InAppNotification[] }>('/notifications/in-app');
    return response.data;
  }

  /**
   * Register a push notification token for the current user.
   */
  async registerPushToken(params: PushTokenRegistration): Promise<PushTokenRegistrationResponse> {
    return this.client.post<PushTokenRegistrationResponse>('/notifications/push-token', params);
  }

  /**
   * Unregister a push notification token.
   */
  async unregisterPushToken(tokenOrParams: string | { token: string }): Promise<PushTokenDeleteResponse> {
    const body = typeof tokenOrParams === 'string' ? { token: tokenOrParams } : tokenOrParams;
    return this.client.request<PushTokenDeleteResponse>('DELETE', '/notifications/push-token', {
      body,
    });
  }

  /**
   * List active push token descriptors for the current user.
   */
  async listPushTokens(): Promise<PushTokenDescriptor[]> {
    const response = await this.client.get<{ tokens: PushTokenDescriptor[] }>('/notifications/push-tokens');
    return response.tokens;
  }
}
