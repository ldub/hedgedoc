/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Mock } from 'ts-mockery';

import { RealtimeConnection } from './realtime-connection';
import { RealtimeNote } from './realtime-note';
import { mockConnection } from './test-utils/mock-connection';
import { WebsocketDoc } from './websocket-doc';

jest.mock('@hedgedoc/commons');

describe('websocket-doc', () => {
  it('saves the initial content', () => {
    const textContent = 'textContent';
    const websocketDoc = new WebsocketDoc(Mock.of<RealtimeNote>(), textContent);

    expect(websocketDoc.getCurrentContent()).toBe(textContent);
  });

  it('distributes content updates to other synced clients', () => {
    const mockConnection1 = mockConnection(true);
    const mockConnection2 = mockConnection(false);
    const mockConnection3 = mockConnection(true);

    const send1 = jest.spyOn(
      mockConnection1.getSyncAdapter(),
      'sendDocumentUpdate',
    );
    const send2 = jest.spyOn(
      mockConnection2.getSyncAdapter(),
      'sendDocumentUpdate',
    );
    const send3 = jest.spyOn(
      mockConnection3.getSyncAdapter(),
      'sendDocumentUpdate',
    );

    const realtimeNote = Mock.of<RealtimeNote>({
      getConnections(): RealtimeConnection[] {
        return [mockConnection1, mockConnection2, mockConnection3];
      },
      getWebsocketDoc(): WebsocketDoc {
        return websocketDoc;
      },
    });

    const websocketDoc = new WebsocketDoc(realtimeNote, '');
    const mockUpdate = new Uint8Array([4, 5, 6, 7]);
    websocketDoc.getYDoc().emit('update', [mockUpdate, mockConnection1]);
    expect(send1).not.toHaveBeenCalled();
    expect(send2).not.toHaveBeenCalled();
    expect(send3).toHaveBeenCalledWith(mockUpdate);
    websocketDoc.destroy();
  });
});
