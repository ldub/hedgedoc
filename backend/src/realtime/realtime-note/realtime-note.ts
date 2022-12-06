/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Message, MessageType } from '@hedgedoc/commons';
import { Logger } from '@nestjs/common';
import { EventEmitter2, EventMap } from 'typed-event-emitter-2';

import { Note } from '../../notes/note.entity';
import { RealtimeConnection } from './realtime-connection';
import { WebsocketDoc } from './websocket-doc';

export interface MapType extends EventMap {
  clientAdded: (client: RealtimeConnection) => void;
  clientRemoved: (client: RealtimeConnection) => void;
}

/**
 * Represents a note currently being edited by a number of clients.
 */
export class RealtimeNote extends EventEmitter2<MapType> {
  protected logger: Logger;
  private readonly websocketDoc: WebsocketDoc;
  private readonly clients = new Set<RealtimeConnection>();
  private isClosing = false;

  constructor(private readonly note: Note, initialContent: string) {
    super();
    this.logger = new Logger(`${RealtimeNote.name} ${note.id}`);
    this.websocketDoc = new WebsocketDoc(this, initialContent);
    this.logger.debug(
      `New realtime session for note ${note.id} created. Length of initial content: ${initialContent.length} characters`,
    );
  }

  /**
   * Connects a new client to the note.
   *
   * For this purpose a {@link RealtimeConnection} is created and added to the client map.
   *
   * @param client the websocket connection to the client
   */
  public addClient(client: RealtimeConnection): void {
    this.clients.add(client);
    this.logger.debug(`User '${client.getUsername()}' connected`);
    this.emit('clientAdded', client);
  }

  /**
   * Disconnects the given websocket client while cleaning-up if it was the last user in the realtime note.
   *
   * @param {WebSocket} client The websocket client that disconnects.
   */
  public removeClient(client: RealtimeConnection): void {
    this.clients.delete(client);
    this.logger.debug(
      `User '${client.getUsername()}' disconnected. ${
        this.clients.size
      } clients left.`,
    );
    if (!this.hasConnections() && !this.isClosing) {
      this.destroy();
    } else {
      this.emit('clientRemoved', client);
    }
  }

  /**
   * Destroys the current realtime note by deleting the y-js doc and disconnecting all clients.
   *
   * @throws Error if note has already been destroyed
   */
  public destroy(): void {
    if (this.isClosing) {
      throw new Error('Note already destroyed');
    }
    this.logger.debug('Destroying realtime note.');
    this.emit('beforeDestroy');
    this.isClosing = true;
    this.websocketDoc.destroy();
    this.clients.forEach((value) => value.getTransporter().disconnect());
    this.emit('destroy');
  }

  /**
   * Checks if there's still clients connected to this note.
   *
   * @return {@code true} if there a still clinets connected, otherwise {@code false}
   */
  public hasConnections(): boolean {
    return this.clients.size !== 0;
  }

  /**
   * Returns all {@link RealtimeConnection WebsocketConnections} currently hold by this note.
   *
   * @return an array of {@link RealtimeConnection WebsocketConnections}
   */
  public getConnections(): RealtimeConnection[] {
    return [...this.clients];
  }

  /**
   * Get the {@link Doc YDoc} of the note.
   *
   * @return the {@link Doc YDoc} of the note
   */
  public getWebsocketDoc(): WebsocketDoc {
    return this.websocketDoc;
  }

  /**
   * Get the {@link Note note} that is edited.
   *
   * @return the {@link Note note}
   */
  public getNote(): Note {
    return this.note;
  }

  /**
   * Announce to all clients that the permissions of the note have been changed.
   */
  public announcePermissionChange(): void {
    this.sendToAllClients({ type: MessageType.METADATA_UPDATED });
  }

  /**
   * Announce to all clients that the note has been deleted.
   */
  public announceNoteDeletion(): void {
    this.sendToAllClients({ type: MessageType.DOCUMENT_DELETED });
  }

  /**
   * Broadcasts the given content to all connected clients.
   *
   * @param {Uint8Array} content The binary message to broadcast
   */
  private sendToAllClients(content: Message<MessageType>): void {
    this.getConnections().forEach((connection) => {
      connection.getTransporter().sendMessage(content);
    });
  }
}
