/**
 * @import {Options} from 'hast-util-format'
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import process from 'node:process'
import test from 'node:test'
import {format} from 'hast-util-format'
import {fromHtml} from 'hast-util-from-html'
import {toHtml} from 'hast-util-to-html'

test('format', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('hast-util-format')).sort(), [
      'format'
    ])
  })
})

test('fixtures', async function (t) {
  const root = new URL('fixtures/', import.meta.url)
  const files = await fs.readdir(root)

  for (const name of files) {
    if (name.charAt(0) === '.') continue

    await t.test(name, async function () {
      const folder = new URL(name + '/', root)
      const input = await fs.readFile(new URL('input.html', folder), 'utf8')
      let expected = await fs.readFile(new URL('output.html', folder), 'utf8')
      /** @type {Options | undefined} */
      let config

      try {
        config = JSON.parse(
          String(await fs.readFile(new URL('options.json', folder)))
        )
      } catch {}

      const tree = fromHtml(input)

      format(tree, config)

      const actual = toHtml(tree)

      if ('UPDATE' in process.env) {
        await fs.writeFile(new URL('output.html', folder), actual)
        expected = actual
      }

      assert.equal(actual, expected)
    })
  }
})
