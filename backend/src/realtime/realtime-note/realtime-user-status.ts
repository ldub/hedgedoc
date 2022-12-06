/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageType, RealtimeUser } from '@hedgedoc/commons';
import { Listener } from 'eventemitter2';

import { RealtimeConnection } from './realtime-connection';
import { RealtimeNote } from './realtime-note';

export class RealtimeUserStatus {
  private readonly realtimeUser: RealtimeUser;

  constructor(
    displayName: string | undefined,
    private connection: RealtimeConnection,
  ) {
    this.realtimeUser = {
      username: displayName ?? this.generateGuestName(),
      active: true,
      styleIndex: this.findLeastUsedStyleIndex(
        this.createStyleIndexToCountMap(connection.getRealtimeNote()),
      ),
      cursor: {
        from: 0,
        to: 0,
      },
    };

    this.bindRealtimeUserStateEvents(connection);
  }

  private bindRealtimeUserStateEvents(connection: RealtimeConnection): void {
    const realtimeNote = connection.getRealtimeNote();
    const transporterMessagesListener = connection.getTransporter().on(
      MessageType.REALTIME_USER_CURSOR_UPDATE,
      (message) => {
        this.realtimeUser.cursor = message.payload;
        this.sendRealtimeUserStatusUpdateEvent(this);
      },
      { objectify: true },
    ) as Listener;

    const clientAddedListener = realtimeNote.once(
      'clientAdded',
      (client: RealtimeConnection) => {
        if (client === connection) {
          this.sendRealtimeUserStatusUpdateEvent();
        }
      },
      {
        objectify: true,
      },
    ) as Listener;

    const clientRemoveListener = realtimeNote.on(
      'clientRemoved',
      (client: RealtimeConnection) => {
        if (client === connection) {
          this.sendRealtimeUserStatusUpdateEvent();
        }
      },
      {
        objectify: true,
      },
    ) as Listener;

    connection.getTransporter().on('disconnected', () => {
      transporterMessagesListener.off();
      clientAddedListener.off();
      clientRemoveListener.off();
    });
  }

  private sendRealtimeUserStatusUpdateEvent(origin?: RealtimeUserStatus): void {
    this.collectAllConnectionsExcept(this.connection).forEach((client) => {
      const payload = this.collectAllConnectionsExcept(client).map(
        (client) => client.getRealtimeUserState().realtimeUser,
      );

      client.getTransporter().sendMessage({
        type: MessageType.COMPLETE_REALTIME_USER_STATE_UPDATE,
        payload,
      });
    });
  }

  private collectAllConnectionsExcept(
    exceptClient: RealtimeConnection,
  ): RealtimeConnection[] {
    return this.connection
      .getRealtimeNote()
      .getConnections()
      .filter((client2) => client2 !== exceptClient);
  }

  private generateGuestName(): string {
    return 'unknown';
  }

  private findLeastUsedStyleIndex(map: Map<number, number>): number {
    let leastUsedStyleIndex = 0;
    let leastUsedStyleIndexCount = map.get(0) ?? 0;
    for (let styleIndex = 0; styleIndex < 8; styleIndex++) {
      const count = map.get(styleIndex) ?? 0;
      if (count < leastUsedStyleIndexCount) {
        leastUsedStyleIndexCount = count;
        leastUsedStyleIndex = styleIndex;
      }
    }
    return leastUsedStyleIndex;
  }

  private createStyleIndexToCountMap(
    realtimeNote: RealtimeNote,
  ): Map<number, number> {
    return realtimeNote
      .getConnections()
      .map(
        (connection) =>
          connection.getRealtimeUserState().realtimeUser.styleIndex,
      )
      .reduce((map, styleIndex) => {
        const count = (map.get(styleIndex) ?? 0) + 1;
        map.set(styleIndex, count);
        return map;
      }, new Map<number, number>());
  }
}
