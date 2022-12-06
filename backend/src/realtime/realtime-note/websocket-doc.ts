/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  MARKDOWN_CONTENT_CHANNEL_NAME,
  Message,
  MessageType,
} from '@hedgedoc/commons';
import { Doc } from 'yjs';

import { RealtimeConnection } from './realtime-connection';
import { RealtimeNote } from './realtime-note';

/**
 * This is the implementation of {@link Doc YDoc} which includes additional handlers for message sending and receiving.
 */
export class WebsocketDoc {
  private yDoc: Doc = new Doc();

  /**
   * Creates a new WebsocketDoc instance.
   *
   * The new instance is filled with the given initial content and an event listener will be registered to handle
   * updates to the doc.
   *
   * @param realtimeNote - the {@link RealtimeNote} handling this {@link Doc YDoc}
   * @param initialContent - the initial content of the {@link Doc YDoc}
   */
  constructor(private realtimeNote: RealtimeNote, initialContent: string) {
    this.initializeContent(initialContent);
    this.bindUpdateEvent();
  }

  /**
   * Binds the event that distributes updates in the current {@link Doc y-doc} to all clients.
   */
  private bindUpdateEvent(): void {
    this.yDoc.on('update', (update: Uint8Array, origin: RealtimeConnection) => {
      const payload: Message<MessageType.DOCUMENT_UPDATE> = {
        type: MessageType.DOCUMENT_UPDATE,
        payload: Array.from(update),
      };
      this.realtimeNote
        .getConnections()
        .filter((connection) => connection !== origin && connection.isSynced())
        .forEach((connection) => {
          connection.getTransporter().sendMessage(payload);
        });
    });
  }

  /**
   * Sets the {@link YDoc's Doc} content to include the initialContent.
   *
   * This message should only be called when a new {@link RealtimeNote } is created.
   *
   * @param initialContent - the initial content to set the {@link Doc YDoc's} content to.
   * @private
   */
  private initializeContent(initialContent: string): void {
    this.yDoc.getText(MARKDOWN_CONTENT_CHANNEL_NAME).insert(0, initialContent);
  }

  /**
   * Gets the current content of the note as it's currently edited in realtime.
   *
   * Please be aware that the return of this method may be very quickly outdated.
   *
   * @return The current note content.
   */
  public getCurrentContent(): string {
    return this.yDoc.getText(MARKDOWN_CONTENT_CHANNEL_NAME).toString();
  }

  public destroy(): void {
    this.yDoc.destroy();
  }

  public getYDoc(): Doc {
    return this.yDoc;
  }
}
