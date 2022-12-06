/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CompleteDocumentStateRequestMessage } from './complete-document-state-request-message.js'
import { MessageType } from './message-type.enum.js'
import { NumericPayloadMessage } from './message.js'
import type { Doc } from 'yjs'
import { encodeStateAsUpdate } from 'yjs'

export type CompleteDocumentStateAnswerMessage =
  NumericPayloadMessage<MessageType.COMPLETE_DOCUMENT_STATE_ANSWER>

export function encodeCompleteDocumentStateAnswerMessage(
  doc: Doc,
  requestMessage: CompleteDocumentStateRequestMessage
): CompleteDocumentStateAnswerMessage {
  return {
    type: MessageType.COMPLETE_DOCUMENT_STATE_ANSWER,
    payload: Array.from(
      encodeStateAsUpdate(doc, new Uint8Array(requestMessage.payload))
    )
  }
}
