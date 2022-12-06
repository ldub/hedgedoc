/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createCursorCssClass } from './create-cursor-css-class'
import { RemoteCursorMarker } from './remote-cursor-marker'
import styles from './style.module.scss'
import type { Extension, Transaction } from '@codemirror/state'
import { EditorSelection, StateEffect, StateField } from '@codemirror/state'
import type { ViewUpdate } from '@codemirror/view'
import { layer, RectangleMarker } from '@codemirror/view'
import { Optional } from '@mrdrogdrog/optional'
import equal from 'fast-deep-equal'

export interface RemoteCursor {
  name: string
  from: number
  to?: number
  styleIndex: number
}

export const remoteCursorUpdateEffect = StateEffect.define<RemoteCursor[]>()

const remoteCursorStateField = StateField.define<RemoteCursor[]>({
  compare(a: RemoteCursor[], b: RemoteCursor[]): boolean {
    return equal(a, b)
  },
  create(): RemoteCursor[] {
    return []
  },
  update(value: RemoteCursor[], transaction: Transaction): RemoteCursor[] {
    return Optional.ofNullable(transaction.effects.find((effect) => effect.is(remoteCursorUpdateEffect)))
      .map((remoteCursor) => remoteCursor.value as RemoteCursor[])
      .orElse(value)
  }
})

const update = (update: ViewUpdate): boolean => {
  const effect =
    update.transactions
      .flatMap((transaction) => transaction.effects)
      .filter((effect) => effect.is(remoteCursorUpdateEffect))
      .flatMap((effect) => effect.value as RemoteCursor[]).length > 0
  return update.docChanged || update.viewportChanged || effect
}

export const remoteCursorsExtension = (): Extension => {
  return [
    remoteCursorStateField.extension,
    layer({
      above: true,
      class: styles.cursorLayer,
      update: update,
      markers(view) {
        return view.state.field(remoteCursorStateField).flatMap((remoteCursor) => {
          const selectionRange = EditorSelection.cursor(remoteCursor.from)
          return RemoteCursorMarker.createCursor(view, selectionRange, remoteCursor.name, remoteCursor.styleIndex)
        })
      }
    }),
    layer({
      above: false,
      class: styles.selectionLayer,
      update: update,
      markers(view) {
        return view.state
          .field(remoteCursorStateField)
          .filter((remoteCursor) => remoteCursor.to !== undefined && remoteCursor.from !== remoteCursor.to)
          .flatMap((remoteCursor) => {
            const selectionRange = EditorSelection.range(remoteCursor.from, remoteCursor.to as number)
            return RectangleMarker.forRange(
              view,
              `${styles.cursor} ${createCursorCssClass(remoteCursor.styleIndex)}`,
              selectionRange
            )
          })
      }
    })
  ]
}
