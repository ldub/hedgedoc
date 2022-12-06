/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { MessageTransporter } from '@hedgedoc/commons'
import React from 'react'
import { Modal } from 'react-bootstrap'

export interface RealtimeConnectionModalProps {
  messageTransporter: MessageTransporter | undefined
}

export const RealtimeConnectionModal: React.FC<RealtimeConnectionModalProps> = ({ messageTransporter }) => {
  return (
    <Modal show={messageTransporter === undefined}>
      <Modal.Body></Modal.Body>
    </Modal>
  )
}
