/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from '..'
import type { SetRealtimeUsersAction } from './types'
import { RealtimeUserActionType } from './types'
import type { RealtimeUser } from '@hedgedoc/commons'

/**
 * Dispatches an event to add a user
 */
export const setRealtimeUsers = (users: RealtimeUser[]): void => {
  const action: SetRealtimeUsersAction = {
    type: RealtimeUserActionType.SET_REALTIME_USERS,
    users
  }
  store.dispatch(action)
}
