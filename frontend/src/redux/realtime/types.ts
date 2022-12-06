/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RealtimeUser } from '@hedgedoc/commons'
import type { Action } from 'redux'

export enum RealtimeUserActionType {
  SET_REALTIME_USERS = 'realtime/set-users'
}

export interface SetRealtimeUsersAction extends Action<RealtimeUserActionType> {
  type: RealtimeUserActionType.SET_REALTIME_USERS
  users: RealtimeUser[]
}

export type RealtimeActions = SetRealtimeUsersAction
