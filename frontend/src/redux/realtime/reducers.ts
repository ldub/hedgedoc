/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RealtimeActions } from './types'
import { RealtimeUserActionType } from './types'
import type { RealtimeUser } from '@hedgedoc/commons'
import type { Reducer } from 'redux'

const initialState: RealtimeUser[] = []

/**
 * Applies {@link realtimeUsersReducer realtime actions} to the global application state.
 *
 * @param state the current state
 * @param action the action that should get applied
 * @return The new changed state
 */
export const realtimeUsersReducer: Reducer<RealtimeUser[], RealtimeActions> = (
  state = initialState,
  action: RealtimeActions
) => {
  switch (action.type) {
    case RealtimeUserActionType.SET_REALTIME_USERS:
      return action.users
    default:
      return state
  }
}
