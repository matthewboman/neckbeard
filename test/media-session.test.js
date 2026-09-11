import test from 'node:test'
import assert from 'node:assert/strict'
import { setMediaSessionMetadata, setMediaSessionPosition } from '../assets/media-session.js'

test('setMediaSessionMetadata exposes podcast and episode details', () => {
  const mediaSession = {}
  class FakeMediaMetadata {
    constructor(data) {
      Object.assign(this, data)
    }
  }

  setMediaSessionMetadata(
    mediaSession,
    FakeMediaMetadata,
    { title: 'Test Podcast', image: 'https://example.com/cover.jpg' },
    { title: 'Episode 1' }
  )

  assert.equal(mediaSession.metadata.title, 'Episode 1')
  assert.equal(mediaSession.metadata.artist, 'Test Podcast')
  assert.equal(mediaSession.metadata.artwork[0].src, 'https://example.com/cover.jpg')
})

test('setMediaSessionPosition clamps position to duration', () => {
  let positionState
  const mediaSession = {
    setPositionState: value => { positionState = value }
  }

  setMediaSessionPosition(mediaSession, {
    duration: 100,
    currentTime: 125,
    playbackRate: 1.5
  })

  assert.deepEqual(positionState, {
    duration: 100,
    playbackRate: 1.5,
    position: 100
  })
})