import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PLAYBACK_STORAGE_KEY,
  buildPlaybackState,
  clearPlaybackState,
  loadPlaybackState,
  savePlaybackState
} from '../assets/playback-state.js'

function memoryStorage() {
  const values = new Map()
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  }
}

test('playback state round-trips through storage', () => {
  const storage = memoryStorage()
  const playbackState = buildPlaybackState({
    podcast: { id: 'show', title: 'Show', image: 'cover.jpg' },
    episode: { id: 'episode', title: 'Episode', audio: 'https://example.com/episode.mp3' },
    currentTime: 123.5,
    playbackRate: 1.5
  })

  savePlaybackState(storage, playbackState)
  const restored = loadPlaybackState(storage)

  assert.equal(restored.podcast.id, 'show')
  assert.equal(restored.episode.audio, 'https://example.com/episode.mp3')
  assert.equal(restored.currentTime, 123.5)
  assert.equal(restored.playbackRate, 1.5)
})

test('clearPlaybackState removes the saved episode', () => {
  const storage = memoryStorage()
  storage.setItem(PLAYBACK_STORAGE_KEY, '{}')
  clearPlaybackState(storage)
  assert.equal(storage.getItem(PLAYBACK_STORAGE_KEY), null)
})
