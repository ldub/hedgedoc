/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { ORIGIN, useBaseUrl } from '../../../hooks/common/use-base-url'
import { useDarkModeState } from '../../../hooks/common/use-dark-mode-state'
import { cypressAttribute, cypressId } from '../../../utils/cypress-attribute'
import { findLanguageByCodeBlockName } from '../../markdown-renderer/extensions/base/code-block-markdown-extension/find-language-by-code-block-name'
import { useCodeMirrorReference, useSetCodeMirrorReference } from '../change-content-context/change-content-context'
import type { ScrollProps } from '../synced-scroll/scroll-props'
import styles from './extended-codemirror/codemirror.module.scss'
import { useCodeMirrorFileInsertExtension } from './hooks/code-mirror-extensions/use-code-mirror-file-insert-extension'
import { useCodeMirrorScrollWatchExtension } from './hooks/code-mirror-extensions/use-code-mirror-scroll-watch-extension'
import { useCodeMirrorSpellCheckExtension } from './hooks/code-mirror-extensions/use-code-mirror-spell-check-extension'
import { useOnImageUploadFromRenderer } from './hooks/image-upload-from-renderer/use-on-image-upload-from-renderer'
import { useCodeMirrorTablePasteExtension } from './hooks/table-paste/use-code-mirror-table-paste-extension'
import { useApplyScrollState } from './hooks/use-apply-scroll-state'
import { useCursorActivityCallback } from './hooks/use-cursor-activity-callback'
import { useBindYTextToRedux } from './hooks/yjs/use-bind-y-text-to-redux'
import { useCodeMirrorYjsExtension } from './hooks/yjs/use-code-mirror-yjs-extension'
import { useIsConnectionSynced } from './hooks/yjs/use-is-connection-synced'
import { useMarkdownContentYText } from './hooks/yjs/use-markdown-content-y-text'
import { useReceiveRealtimeUsers } from './hooks/yjs/use-receive-realtime-users'
import { useSendRealtimeCursor } from './hooks/yjs/use-send-realtime-cursor'
import { useYDoc } from './hooks/yjs/use-y-doc'
import { useLinter } from './linter/linter'
import { MaxLengthWarning } from './max-length-warning/max-length-warning'
import { StatusBar } from './status-bar/status-bar'
import { ToolBar } from './tool-bar/tool-bar'
import { autocompletion } from '@codemirror/autocomplete'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { lintGutter } from '@codemirror/lint'
import type { Extension, SelectionRange } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import type { MessageTransporter } from '@hedgedoc/commons'
import { MessageType, YDocSyncClient } from '@hedgedoc/commons'
import ReactCodeMirror from '@uiw/react-codemirror'
import React, { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export interface EditorPaneProps extends ScrollProps {
  messageTransporter: MessageTransporter | undefined
}

/**
 * Renders the text editor pane of the editor.
 * The used editor is {@link ReactCodeMirror code mirror}.
 *
 * @param scrollState The current {@link ScrollState}
 * @param onScroll The callback to update the {@link ScrollState}
 * @param onMakeScrollSource The callback to request to become the scroll source.
 * @external {ReactCodeMirror} https://npmjs.com/@uiw/react-codemirror
 */
export const EditorPane: React.FC<EditorPaneProps> = ({
  scrollState,
  onScroll,
  onMakeScrollSource,
  messageTransporter
}) => {
  const ligaturesEnabled = useApplicationState((state) => state.editorConfig.ligatures)

  useApplyScrollState(scrollState)

  const editorScrollExtension = useCodeMirrorScrollWatchExtension(onScroll)
  const tablePasteExtensions = useCodeMirrorTablePasteExtension()
  const fileInsertExtension = useCodeMirrorFileInsertExtension()
  const cursorActivityExtension = useCursorActivityCallback()

  const codeMirrorRef = useCodeMirrorReference()
  const setCodeMirrorReference = useSetCodeMirrorReference()

  const updateViewContext = useMemo(() => {
    return EditorView.updateListener.of((update) => {
      if (codeMirrorRef !== update.view) {
        setCodeMirrorReference(update.view)
      }
    })
  }, [codeMirrorRef, setCodeMirrorReference])

  const yDoc = useYDoc()
  const yText = useMarkdownContentYText(yDoc)

  const [yjsExtension, pluginLoaded] = useCodeMirrorYjsExtension(yText)

  const syncAdapter = useMemo(
    () => (messageTransporter && pluginLoaded ? new YDocSyncClient(yDoc, messageTransporter) : undefined),
    [messageTransporter, pluginLoaded, yDoc]
  )

  const connectionSynced = useIsConnectionSynced(syncAdapter)
  useBindYTextToRedux(yText)

  const linter = useLinter()
  const spellCheckExtension = useCodeMirrorSpellCheckExtension()

  useReceiveRealtimeUsers(messageTransporter)
  useSendRealtimeCursor()

  const lastCursorSent = useRef<SelectionRange>()

  const cursorSelectionExtension = useMemo((): Extension => {
    return EditorView.updateListener.of((update) => {
      const currentCursor = update.state.selection.main
      if (messageTransporter === undefined || lastCursorSent.current === currentCursor) {
        return
      }
      lastCursorSent.current = currentCursor
      const from = currentCursor.from
      const to = currentCursor.to
      messageTransporter?.sendMessage({
        type: MessageType.REALTIME_USER_CURSOR_UPDATE,
        payload: {
          from,
          to
        }
      })
    })
  }, [messageTransporter])

  const extensions = useMemo(
    () => [
      linter,
      lintGutter(),
      markdown({
        base: markdownLanguage,
        codeLanguages: (input) => findLanguageByCodeBlockName(languages, input)
      }),
      EditorView.lineWrapping,
      editorScrollExtension,
      cursorSelectionExtension,
      tablePasteExtensions,
      fileInsertExtension,
      autocompletion(),
      cursorActivityExtension,
      updateViewContext,
      yjsExtension,
      spellCheckExtension
    ],
    [
      linter,
      editorScrollExtension,
      cursorSelectionExtension,
      tablePasteExtensions,
      fileInsertExtension,
      cursorActivityExtension,
      updateViewContext,
      yjsExtension,
      spellCheckExtension
    ]
  )

  useOnImageUploadFromRenderer()

  const codeMirrorClassName = useMemo(
    () => `overflow-hidden ${styles.extendedCodemirror} h-100 ${ligaturesEnabled ? '' : styles['no-ligatures']}`,
    [ligaturesEnabled]
  )

  const { t } = useTranslation()

  const darkModeActivated = useDarkModeState()

  const editorOrigin = useBaseUrl(ORIGIN.EDITOR)

  return (
    <div
      className={`d-flex flex-column h-100 position-relative`}
      onTouchStart={onMakeScrollSource}
      onMouseEnter={onMakeScrollSource}
      {...cypressId('editor-pane')}
      {...cypressAttribute('editor-ready', String(updateViewContext !== null && connectionSynced))}>
      <MaxLengthWarning />
      <ToolBar />
      <ReactCodeMirror
        editable={updateViewContext !== null && connectionSynced}
        placeholder={t('editor.placeholder', { host: editorOrigin }) ?? ''}
        extensions={extensions}
        width={'100%'}
        height={'100%'}
        maxHeight={'100%'}
        maxWidth={'100%'}
        basicSetup={true}
        className={codeMirrorClassName}
        theme={darkModeActivated ? oneDark : undefined}
      />
      <StatusBar />
    </div>
  )
}
