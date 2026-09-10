import test from 'node:test'
import assert from 'node:assert/strict'
import { getAudioUrl, newestFirst, slugify } from '../scripts/rss-helpers.js'

test('slugify creates stable URL-safe podcast ids', () => {
  assert.equal(slugify('99% Invisible'), '99-invisible')
})

test('getAudioUrl reads RSS enclosure URLs', () => {
  assert.equal(getAudioUrl({ enclosure: { url: 'https://example.com/audio.mp3' } }), 'https://example.com/audio.mp3')
})

test('newestFirst sorts episodes by date descending', () => {
  const items = newestFirst([
    { title: 'older', isoDate: '2026-01-01T00:00:00Z' },
    { title: 'newer', isoDate: '2026-02-01T00:00:00Z' }
  ])
  assert.deepEqual(items.map(item => item.title), ['newer', 'older'])
})
