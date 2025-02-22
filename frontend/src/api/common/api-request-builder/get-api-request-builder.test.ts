/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GetApiRequestBuilder } from './get-api-request-builder'
import { expectFetch } from './test-utils/expect-fetch'

describe('GetApiRequestBuilder', () => {
  let originalFetch: (typeof global)['fetch']

  beforeAll(() => {
    originalFetch = global.fetch
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  describe('sendRequest', () => {
    it('without headers', async () => {
      expectFetch('api/private/test', 200, { method: 'GET' })
      await new GetApiRequestBuilder<string>('test').sendRequest()
    })

    it('with single header', async () => {
      const expectedHeaders = new Headers()
      expectedHeaders.append('test', 'true')
      expectFetch('api/private/test', 200, {
        method: 'GET',
        headers: expectedHeaders
      })
      await new GetApiRequestBuilder<string>('test').withHeader('test', 'true').sendRequest()
    })

    it('with overriding single header', async () => {
      const expectedHeaders = new Headers()
      expectedHeaders.append('test', 'false')
      expectFetch('api/private/test', 200, {
        method: 'GET',
        headers: expectedHeaders
      })
      await new GetApiRequestBuilder<string>('test')
        .withHeader('test', 'true')
        .withHeader('test', 'false')
        .sendRequest()
    })

    it('with multiple different headers', async () => {
      const expectedHeaders = new Headers()
      expectedHeaders.append('test', 'true')
      expectedHeaders.append('test2', 'false')
      expectFetch('api/private/test', 200, {
        method: 'GET',
        headers: expectedHeaders
      })
      await new GetApiRequestBuilder<string>('test')
        .withHeader('test', 'true')
        .withHeader('test2', 'false')
        .sendRequest()
    })
  })

  it('sendRequest with expected status code', async () => {
    expectFetch('api/private/test', 200, { method: 'GET' })
    await new GetApiRequestBuilder<string>('test').withExpectedStatusCode(200).sendRequest()
  })

  describe('sendRequest with custom options', () => {
    it('with one option', async () => {
      expectFetch('api/private/test', 200, {
        method: 'GET',
        cache: 'force-cache'
      })
      await new GetApiRequestBuilder<string>('test')
        .withCustomOptions({
          cache: 'force-cache'
        })
        .sendRequest()
    })

    it('overriding single option', async () => {
      expectFetch('api/private/test', 200, {
        method: 'GET',
        cache: 'no-store'
      })
      await new GetApiRequestBuilder<string>('test')
        .withCustomOptions({
          cache: 'force-cache'
        })
        .withCustomOptions({
          cache: 'no-store'
        })
        .sendRequest()
    })

    it('with multiple options', async () => {
      expectFetch('api/private/test', 200, {
        method: 'GET',
        cache: 'force-cache',
        integrity: 'test'
      })
      await new GetApiRequestBuilder<string>('test')
        .withCustomOptions({
          cache: 'force-cache',
          integrity: 'test'
        })
        .sendRequest()
    })
  })

  describe('sendRequest with custom error map', () => {
    it('for valid status code', async () => {
      expectFetch('api/private/test', 200, { method: 'GET' })
      await new GetApiRequestBuilder<string>('test')
        .withStatusCodeErrorMapping({
          400: 'noooooo',
          401: 'not you!'
        })
        .sendRequest()
    })

    it('for invalid status code 1', async () => {
      expectFetch('api/private/test', 400, { method: 'GET' })
      const request = new GetApiRequestBuilder<string>('test')
        .withStatusCodeErrorMapping({
          400: 'noooooo',
          401: 'not you!'
        })
        .sendRequest()
      await expect(request).rejects.toThrow('noooooo')
    })

    it('for invalid status code 2', async () => {
      expectFetch('api/private/test', 401, { method: 'GET' })
      const request = new GetApiRequestBuilder<string>('test')
        .withStatusCodeErrorMapping({
          400: 'noooooo',
          401: 'not you!'
        })
        .sendRequest()
      await expect(request).rejects.toThrow('not you!')
    })
  })
})
