/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export enum MessageType {
  COMPLETE_DOCUMENT_STATE_REQUEST = 'COMPLETE_DOCUMENT_STATE_REQUEST',
  COMPLETE_DOCUMENT_STATE_ANSWER = 'COMPLETE_DOCUMENT_STATE_ANSWER',
  DOCUMENT_UPDATE = 'DOCUMENT_UPDATE',
  AWARENESS_UPDATE = 'AWARENESS_UPDATE',
  COMPLETE_AWARENESS_STATE_REQUEST = 'COMPLETE_AWARENESS_STATE_REQUEST',
  PING = 'PING',
  PONG = 'PONG',
  READY_REQUEST = 'READY_REQUEST',
  READY_ANSWER = 'READY_ANSWER',
  METADATA_UPDATED = 'METADATA_UPDATED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',
  SERVER_VERSION_UPDATED = 'SERVER_VERSION_UPDATED'
}
