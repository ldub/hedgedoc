/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface RealtimeUser {
  username: string
  active: boolean
  styleIndex: number
  cursor: RealtimeUserCursor
}

export interface RealtimeUserCursor {
  from: number
  to?: number
}
