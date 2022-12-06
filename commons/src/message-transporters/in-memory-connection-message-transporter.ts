/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConnectionState, MessageTransporter } from './message-transporter.js'
import { Message, MessageType } from './message.js'

export class InMemoryConnectionMessageTransporter extends MessageTransporter {
  private otherSide: InMemoryConnectionMessageTransporter | undefined

  constructor(private name: string) {
    super()
  }

  public connect(other: InMemoryConnectionMessageTransporter): void {
    this.otherSide = other
    other.otherSide = this
    this.onAfterConnect()
    other.onAfterConnect()
  }

  public disconnect(): void {
    this.onDisconnecting()

    if (this.otherSide) {
      this.otherSide.onDisconnecting()
      this.otherSide.otherSide = undefined
      this.otherSide = undefined
    }
  }

  sendMessage(content: Message<MessageType>): void {
    if (this.otherSide === undefined) {
      throw new Error('Disconnected')
    }
    console.debug(`${this.name}`, 'Sending', content)
    this.otherSide?.receiveMessage(content)
  }

  getConnectionState(): ConnectionState {
    return this.otherSide !== undefined
      ? ConnectionState.CONNECTED
      : ConnectionState.DISCONNECT
  }

  start(): void {
    //
  }
}
