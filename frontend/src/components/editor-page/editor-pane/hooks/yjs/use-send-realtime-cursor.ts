/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { useCodeMirrorReference } from '../../../change-content-context/change-content-context'
import type { RemoteCursor } from '../code-mirror-extensions/sync/remote-cursors/remote-cursors-extension'
import { remoteCursorUpdateEffect } from '../code-mirror-extensions/sync/remote-cursors/remote-cursors-extension'
import { useEffect } from 'react'

export const useSendRealtimeCursor = () => {
  const realtimeUsers = useApplicationState((state) => state.realtimeUsers)
  const codeMirrorRef = useCodeMirrorReference()

  useEffect(() => {
    const remoteCursors = realtimeUsers.map(
      (value) =>
        ({
          from: value.cursor.from,
          to: value.cursor.to,
          name: value.username,
          styleIndex: value.styleIndex
        } as RemoteCursor)
    )
    codeMirrorRef?.dispatch({
      effects: [remoteCursorUpdateEffect.of(remoteCursors)]
    })
  }, [codeMirrorRef, realtimeUsers])
}
