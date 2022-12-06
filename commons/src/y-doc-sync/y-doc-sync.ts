/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  ConnectionState,
  MessageTransporter
} from '../message-transporters/message-transporter.js'
import { MessageType } from '../message-transporters/message.js'
import { Listener } from 'eventemitter2'
import { EventEmitter2 } from 'typed-event-emitter-2'
import { applyUpdate, Doc, encodeStateAsUpdate } from 'yjs'

type Events = 'synced' | 'desynced'

export abstract class YDocSync {
  private synced = false

  public readonly eventEmitter = new EventEmitter2<Record<Events, () => void>>()

  constructor(
    protected readonly doc: Doc,
    protected readonly messageTransporter: MessageTransporter
  ) {
    this.bindDocumentSyncMessageEvents(doc)

    if (
      this.messageTransporter.getConnectionState() ===
      ConnectionState.DISCONNECT
    ) {
      this.messageTransporter.once('connected', () => {
        this.afterConnect()
      })
    } else {
      this.afterConnect()
    }
  }

  public onceSynced(callback: () => void): Listener | undefined {
    if (this.isSynced()) {
      callback()
      return
    } else {
      return this.eventEmitter.once('synced', callback, {
        objectify: true
      }) as Listener
    }
  }

  public isSynced(): boolean {
    return this.synced
  }

  protected bindDocumentSyncMessageEvents(doc: Doc) {
    this.messageTransporter.on(
      MessageType.COMPLETE_DOCUMENT_STATE_REQUEST,
      (payload) => {
        this.messageTransporter.sendMessage({
          type: MessageType.DOCUMENT_UPDATE,
          payload: Array.from(
            encodeStateAsUpdate(doc, new Uint8Array(payload.payload))
          )
        })
      }
    )

    this.messageTransporter.on(MessageType.DOCUMENT_UPDATE, (payload) => {
      applyUpdate(doc, new Uint8Array(payload.payload), this)
    })

    doc.on('destroy', () => this.messageTransporter.disconnect())

    this.messageTransporter.on('disconnected', () => {
      this.synced = false
      this.eventEmitter.emit('desynced')
    })
  }

  public sendDocumentUpdate(payload: number[]): void {
    this.messageTransporter.sendMessage({
      type: MessageType.DOCUMENT_UPDATE,
      payload
    })
  }

  protected markAsSynced(): void {
    if (this.synced) {
      return
    }
    this.synced = true
    this.eventEmitter.emit('synced')
  }

  protected afterConnect(): void {
    //
  }
}
