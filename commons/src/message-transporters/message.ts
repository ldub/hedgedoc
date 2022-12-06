/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RealtimeUser, RealtimeUserCursor } from './realtime-user.js'

export enum MessageType {
  COMPLETE_DOCUMENT_STATE_REQUEST = 'COMPLETE_DOCUMENT_STATE_REQUEST',
  DOCUMENT_UPDATE = 'DOCUMENT_UPDATE',
  PING = 'PING',
  PONG = 'PONG',
  METADATA_UPDATED = 'METADATA_UPDATED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',
  SERVER_VERSION_UPDATED = 'SERVER_VERSION_UPDATED',
  COMPLETE_REALTIME_USER_STATE_UPDATE = 'REALTIME_USER_STATE_UPDATE',
  REALTIME_USER_CURSOR_UPDATE = 'REALTIME_USER_CURSOR_UPDATE'
}

export interface MessagePayloads {
  [MessageType.COMPLETE_DOCUMENT_STATE_REQUEST]: number[]
  [MessageType.DOCUMENT_UPDATE]: number[]
  [MessageType.COMPLETE_REALTIME_USER_STATE_UPDATE]: RealtimeUser[]
  [MessageType.REALTIME_USER_CURSOR_UPDATE]: RealtimeUserCursor
}

export type Message<T extends MessageType> = T extends keyof MessagePayloads
  ? {
      type: T
      payload: MessagePayloads[T]
    }
  : {
      type: T
    }
