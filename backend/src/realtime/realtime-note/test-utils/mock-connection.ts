/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { LoopbackMessageTransporter, YDocSyncServer } from '@hedgedoc/commons';
import { Mock } from 'ts-mockery';

import { User } from '../../../users/user.entity';
import { RealtimeConnection } from '../realtime-connection';

/**
 * Provides a partial mock for {@link RealtimeConnection}.
 *
 * @param synced Defines the return value for the `isSynced` function.
 */
export function mockConnection(synced: boolean): RealtimeConnection {
  const yDocSyncAdapter = Mock.of<YDocSyncServer>({
    sendDocumentUpdate: jest.fn(),
  });

  return Mock.of<RealtimeConnection>({
    isSynced: jest.fn(() => synced),
    getUser: jest.fn(() => Mock.of<User>({ username: 'mockedUser' })),
    getUsername: jest.fn(() => 'mocked user'),
    getSyncAdapter: jest.fn(() => yDocSyncAdapter),
    getTransporter: jest.fn(() => new LoopbackMessageTransporter('')),
  });
}
