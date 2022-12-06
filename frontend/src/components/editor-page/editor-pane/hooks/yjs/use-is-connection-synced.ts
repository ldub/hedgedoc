/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { YDocSyncClient } from '@hedgedoc/commons'
import type { Listener } from 'eventemitter2'
import { useEffect, useState } from 'react'

/**
 * Checks if the given message transporter has received at least one full synchronisation.
 *
 * @param yDocSyncAdapter The adapter that processes the synchronisation of the current document
 * @return If at least one full synchronisation is occurred.
 */
export const useIsConnectionSynced = (yDocSyncAdapter: YDocSyncClient | undefined): boolean => {
  const [editorEnabled, setEditorEnabled] = useState<boolean>(false)

  useEffect(() => {
    if (!yDocSyncAdapter) {
      return
    }
    const onceSyncedListener = yDocSyncAdapter.onceSynced(() => setEditorEnabled(true))
    const desyncedListener = yDocSyncAdapter.eventEmitter.on('desynced', () => setEditorEnabled(false), {
      objectify: true
    }) as Listener
    return () => {
      onceSyncedListener?.off()
      desyncedListener.off()
    }
  }, [yDocSyncAdapter])

  return editorEnabled
}
