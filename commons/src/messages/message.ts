/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageType } from './message-type.enum.js'

export interface Message<T extends MessageType> {
  type: T
}

export interface NumericPayloadMessage<T extends MessageType>
  extends Message<T> {
  type: T
  payload: number[]
}
