/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Mock } from 'ts-mockery';
import { EventEmitter2 } from 'typed-event-emitter-2';

import { Note } from '../../../notes/note.entity';
import { MapType, RealtimeNote } from '../realtime-note';
import { WebsocketDoc } from '../websocket-doc';
import { mockWebsocketDoc } from './mock-websocket-doc';

class MockRealtimeNote extends EventEmitter2<MapType> {
  constructor(private note: Note, private doc: WebsocketDoc) {
    super();
  }

  public getNote(): Note {
    return this.note;
  }

  public getWebsocketDoc(): WebsocketDoc {
    return this.doc;
  }

  public removeClient(): void {
    //left blank for mock
  }

  public destroy(): void {
    //left blank for mock
  }
}

/**
 * Provides a partial mock for {@link RealtimeNote}
 * @param doc Defines the return value for `getYDoc`
 */
export function mockRealtimeNote(
  note?: Note,
  doc?: WebsocketDoc,
): RealtimeNote {
  return Mock.from<RealtimeNote>(
    new MockRealtimeNote(note ?? Mock.of<Note>(), doc ?? mockWebsocketDoc()),
  );
}
