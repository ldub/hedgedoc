/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConnectionState, MessageTransporter } from './message-transporter.js'
import { Message, MessageType } from './message.js'
import WebSocket from 'isomorphic-ws'

export class WebsocketTransporter extends MessageTransporter {
  private readonly websocket: WebSocket

  constructor(websocket: WebSocket) {
    super()
    if (
      websocket.readyState === WebSocket.CLOSED ||
      websocket.readyState === WebSocket.CLOSING
    ) {
      return
    }
    this.websocket = websocket
    websocket.addEventListener('message', (event) => {
      if (typeof event.data !== 'string') {
        return
      }
      const message = JSON.parse(event.data) as Message<MessageType>
      this.receiveMessage(message)
    })
    websocket.addEventListener('error', () => this.disconnect())
    websocket.addEventListener('close', () => this.onDisconnecting())
  }

  public start(): void {
    if (this.websocket.readyState === WebSocket.OPEN) {
      this.onAfterConnect()
    } else {
      this.websocket.addEventListener('open', this.onAfterConnect.bind(this))
    }
  }

  public disconnect(): void {
    this.websocket?.close()
  }

  public sendMessage(content: Message<MessageType>): void {
    if (this.websocket?.readyState !== WebSocket.OPEN) {
      throw new Error("Can't send message over non-open socket")
    }

    try {
      this.websocket.send(JSON.stringify(content))
    } catch (error: unknown) {
      this.disconnect()
      throw error
    }
  }

  public getConnectionState(): ConnectionState {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      return ConnectionState.CONNECTED
    } else if (this.websocket?.readyState === WebSocket.CONNECTING) {
      return ConnectionState.CONNECTING
    } else {
      return ConnectionState.DISCONNECT
    }
  }
}
