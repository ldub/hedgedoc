/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageType } from './message-type.enum.js'
import { NumericPayloadMessage } from './message.js'
import type { Awareness } from 'y-protocols/awareness'
import {
  applyAwarenessUpdate,
  encodeAwarenessUpdate
} from 'y-protocols/awareness'

export type AwarenessUpdateMessage =
  NumericPayloadMessage<MessageType.AWARENESS_UPDATE>

export function applyAwarenessUpdateMessage(
  message: AwarenessUpdateMessage,
  awareness: Awareness,
  origin: unknown
): void {
  applyAwarenessUpdate(awareness, new Uint8Array(message.payload), origin)
}

export function encodeAwarenessUpdateMessage(
  awareness: Awareness,
  updatedClientIds: number[]
): AwarenessUpdateMessage {
  return {
    type: MessageType.AWARENESS_UPDATE,
    payload: Array.from(encodeAwarenessUpdate(awareness, updatedClientIds))
  }
}
