/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageType } from './message-type.enum.js'
import { NumericPayloadMessage } from './message.js'
import type { Doc } from 'yjs'
import { applyUpdate } from 'yjs'

export type DocumentUpdateMessage =
  NumericPayloadMessage<MessageType.DOCUMENT_UPDATE>

export function applyDocumentUpdateMessage(
  message: DocumentUpdateMessage,
  doc: Doc,
  origin: unknown
): void {
  applyUpdate(doc, new Uint8Array(message.payload), origin)
}

export function encodeDocumentUpdateMessage(
  documentUpdate: Uint8Array
): DocumentUpdateMessage {
  return {
    type: MessageType.DOCUMENT_UPDATE,
    payload: Array.from(documentUpdate)
  }
}
