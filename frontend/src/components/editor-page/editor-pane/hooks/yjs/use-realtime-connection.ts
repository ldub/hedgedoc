/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getGlobalState } from '../../../../../redux'
import { Logger } from '../../../../../utils/logger'
import { isMockMode } from '../../../../../utils/test-modes'
import { useWebsocketUrl } from './use-websocket-url'
import type { MessageTransporter } from '@hedgedoc/commons'
import { LoopbackMessageTransporter, WebsocketTransporter } from '@hedgedoc/commons'
import WebSocket from 'isomorphic-ws'
import { useCallback, useEffect, useRef, useState } from 'react'

const logger = new Logger('websocket connection')

/**
 * Creates a {@link WebsocketTransporter websocket message transporter } that handles the realtime communication with the backend.
 *
 * @return the created connection handler
 */
export const useRealtimeConnection = (): MessageTransporter | undefined => {
  const websocketUrl = useWebsocketUrl()
  const [messageTransporter, setMessageTransporter] = useState<MessageTransporter>()

  const establishWebsocketConnection = useCallback(() => {
    let newTransporter: MessageTransporter | undefined = undefined

    if (isMockMode) {
      logger.debug('Creating Loopback connection...')
      newTransporter = new LoopbackMessageTransporter(getGlobalState().noteDetails.markdownContent.plain)
    } else if (websocketUrl) {
      logger.debug(`Connecting to ${websocketUrl.toString()}`)
      newTransporter = new WebsocketTransporter(new WebSocket(websocketUrl))
    } else {
      throw new Error('No websocket url!')
    }

    newTransporter.start()
    newTransporter.on('disconnected', () => {
      setMessageTransporter(undefined)
    })

    setMessageTransporter(newTransporter)
  }, [websocketUrl])

  const firstConnect = useRef<boolean>(true)
  useEffect(() => {
    if (!messageTransporter) {
      if (firstConnect.current) {
        establishWebsocketConnection()
      } else {
        setTimeout(() => establishWebsocketConnection(), 3000)
        firstConnect.current = false
      }
    }
  }, [establishWebsocketConnection, messageTransporter])

  useEffect(() => {
    if (!messageTransporter) {
      return
    }
    const disconnectCallback = () => setMessageTransporter(undefined)
    window.addEventListener('beforeunload', disconnectCallback)
    return () => {
      messageTransporter.disconnect()
      window.removeEventListener('beforeunload', disconnectCallback)
    }
  }, [messageTransporter])

  return messageTransporter
}
