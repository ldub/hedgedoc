/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageType } from './message-type.enum.js'
import { NumericPayloadMessage } from './message.js'
import type { Doc } from 'yjs'
import { encodeStateVector } from 'yjs'

export type CompleteDocumentStateRequestMessage =
  NumericPayloadMessage<MessageType.COMPLETE_DOCUMENT_STATE_REQUEST>

export function encodeCompleteDocumentStateRequestMessage(
  doc: Doc
): CompleteDocumentStateRequestMessage {
  return {
    type: MessageType.COMPLETE_DOCUMENT_STATE_REQUEST,
    payload: Array.from(encodeStateVector(doc))
  }
}
