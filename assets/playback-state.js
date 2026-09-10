export const PLAYBACK_STORAGE_KEY = 'podcast-pages.playback'

export function buildPlaybackState({ podcast, episode, currentTime, playbackRate }) {
  if (!podcast || !episode?.audio) return null

  return {
    podcast: {
      id: podcast.id,
      title: podcast.title,
      image: podcast.image || ''
    },
    episode: {
      id: episode.id,
      title: episode.title,
      audio: episode.audio
    },
    currentTime: Number.isFinite(currentTime) ? currentTime : 0,
    playbackRate: Number.isFinite(playbackRate) ? playbackRate : 1,
    savedAt: new Date().toISOString()
  }
}

export function savePlaybackState(storage, playbackState) {
  if (!playbackState) return
  storage.setItem(PLAYBACK_STORAGE_KEY, JSON.stringify(playbackState))
}

export function loadPlaybackState(storage) {
  const raw = storage.getItem(PLAYBACK_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (!parsed?.episode?.audio || !parsed?.episode?.title || !parsed?.podcast?.title) return null
    return parsed
  } catch {
    return null
  }
}

export function clearPlaybackState(storage) {
  storage.removeItem(PLAYBACK_STORAGE_KEY)
}
