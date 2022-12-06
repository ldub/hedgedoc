/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setRealtimeUsers } from '../../../../../redux/realtime/methods'
import type { MessageTransporter } from '@hedgedoc/commons'
import { MessageType } from '@hedgedoc/commons'
import type { Listener } from 'eventemitter2'
import { useEffect } from 'react'

export const useReceiveRealtimeUsers = (messageTransporter: MessageTransporter | undefined) => {
  useEffect(() => {
    if (!messageTransporter) {
      return
    }
    const listener = messageTransporter.on(
      MessageType.COMPLETE_REALTIME_USER_STATE_UPDATE,
      (payload) => {
        setRealtimeUsers(payload.payload)
      },
      { objectify: true }
    ) as Listener

    return () => {
      listener.off()
    }
  }, [messageTransporter])
}
