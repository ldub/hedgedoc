/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MARKDOWN_CONTENT_CHANNEL_NAME } from '../constants/markdown-content-channel-name.js'
import { ConnectionState, MessageTransporter } from './message-transporter.js'
import { Message, MessageType } from './message.js'
import { Doc, encodeStateAsUpdate } from 'yjs'

/**
 * A mocked connection that doesn't send or receive any data and is instantly ready.
 */
export class LoopbackMessageTransporter extends MessageTransporter {
  private doc: Doc = new Doc()

  private connected = false

  constructor(initialContent: string) {
    super()
    this.doc.getText(MARKDOWN_CONTENT_CHANNEL_NAME).insert(0, initialContent)

    this.onAfterConnect()
  }

  disconnect(): void {
    if (!this.connected) {
      return
    }
    this.connected = false
    this.onDisconnecting()
  }

  sendMessage<M extends MessageType>(content: Message<M>) {
    if (content.type === MessageType.COMPLETE_DOCUMENT_STATE_REQUEST) {
      setTimeout(() => {
        const payload = Array.from(
          encodeStateAsUpdate(this.doc, new Uint8Array(content.payload))
        )
        this.receiveMessage({ type: MessageType.DOCUMENT_UPDATE, payload })
      }, 10)
    }
  }

  getConnectionState(): ConnectionState {
    return this.connected
      ? ConnectionState.CONNECTED
      : ConnectionState.DISCONNECT
  }

  start(): void {
    this.connected = true
  }
}
