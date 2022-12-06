/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  LoopbackMessageTransporter,
  MessageTransporter,
} from '@hedgedoc/commons';
import { Mock } from 'ts-mockery';

import { Note } from '../../notes/note.entity';
import { User } from '../../users/user.entity';
import { RealtimeConnection } from './realtime-connection';
import * as realtimeNoteModule from './realtime-note';
import { RealtimeNote } from './realtime-note';
import { mockRealtimeNote } from './test-utils/mock-realtime-note';
import { mockWebsocketDoc } from './test-utils/mock-websocket-doc';
import * as websocketDocModule from './websocket-doc';
import { WebsocketDoc } from './websocket-doc';

describe('websocket connection', () => {
  let mockedDoc: WebsocketDoc;
  let mockedRealtimeNote: RealtimeNote;
  let mockedUser: User;
  let mockedMessageTransporter: MessageTransporter;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
    mockedDoc = mockWebsocketDoc();
    mockedRealtimeNote = mockRealtimeNote(Mock.of<Note>(), mockedDoc);
    mockedUser = Mock.of<User>({});

    jest
      .spyOn(realtimeNoteModule, 'RealtimeNote')
      .mockImplementation(() => mockedRealtimeNote);
    jest
      .spyOn(websocketDocModule, 'WebsocketDoc')
      .mockImplementation(() => mockedDoc);
    mockedMessageTransporter = new LoopbackMessageTransporter('');
  });

  afterAll(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('removes the client from the note on transporter disconnect', () => {
    const sut = new RealtimeConnection(
      mockedMessageTransporter,
      mockedUser,
      mockedRealtimeNote,
    );

    const removeClientSpy = jest.spyOn(mockedRealtimeNote, 'removeClient');

    mockedMessageTransporter.disconnect();

    expect(removeClientSpy).toHaveBeenCalledWith(sut);
  });

  it('saves the correct user', () => {
    const sut = new RealtimeConnection(
      mockedMessageTransporter,
      mockedUser,
      mockedRealtimeNote,
    );

    expect(sut.getUser()).toBe(mockedUser);
  });

  it('returns the correct username', () => {
    const mockedUserWithUsername = Mock.of<User>({ username: 'MockUser' });

    const sut = new RealtimeConnection(
      mockedMessageTransporter,
      mockedUserWithUsername,
      mockedRealtimeNote,
    );

    expect(sut.getUsername()).toBe('MockUser');
  });

  it('returns a fallback if no username has been set', () => {
    const sut = new RealtimeConnection(
      mockedMessageTransporter,
      mockedUser,
      mockedRealtimeNote,
    );

    expect(sut.getUsername()).toBe('Guest');
  });
});
