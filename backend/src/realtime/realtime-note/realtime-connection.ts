/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConnectionState, MessageTransporter } from '@hedgedoc/commons';
import { YDocSyncServer } from '@hedgedoc/commons';
import { Logger } from '@nestjs/common';

import { User } from '../../users/user.entity';
import { RealtimeNote } from './realtime-note';
import { RealtimeUserStatus } from './realtime-user-status';

/**
 * Manages the connection to a specific client.
 */
export class RealtimeConnection {
  protected readonly logger = new Logger(RealtimeConnection.name);
  private readonly transporter: MessageTransporter;
  private readonly yDocSyncAdapter: YDocSyncServer;
  private readonly realtimeUserState: RealtimeUserStatus;

  /**
   * Instantiates the connection wrapper.
   *
   * @param messageTransporter The message transporter that handles the communication with the client.
   * @param user The user of the client
   * @param realtimeNote The {@link RealtimeNote} that the client connected to.
   * @throws Error if the socket is not open
   */
  constructor(
    messageTransporter: MessageTransporter,
    private user: User | null,
    private realtimeNote: RealtimeNote,
  ) {
    this.transporter = messageTransporter;
    this.transporter.on('disconnected', () => {
      realtimeNote.removeClient(this);
    });
    this.yDocSyncAdapter = new YDocSyncServer(
      realtimeNote.getWebsocketDoc().getYDoc(),
      this.transporter,
    );
    this.realtimeUserState = new RealtimeUserStatus(user?.displayName, this);
  }

  public getRealtimeUserState(): RealtimeUserStatus {
    return this.realtimeUserState;
  }

  /**
   * Defines if the current connection has received at least one full synchronisation.
   */
  public isSynced(): boolean {
    return (
      this.transporter.getConnectionState() === ConnectionState.CONNECTED &&
      this.yDocSyncAdapter.isSynced()
    );
  }

  public getTransporter(): MessageTransporter {
    return this.transporter;
  }

  public getUser(): User | null {
    return this.user;
  }

  public getSyncAdapter(): YDocSyncServer {
    return this.yDocSyncAdapter;
  }

  public getUsername(): string {
    return this.getUser()?.username ?? 'Guest';
  }

  public getRealtimeNote(): RealtimeNote {
    return this.realtimeNote;
  }
}
