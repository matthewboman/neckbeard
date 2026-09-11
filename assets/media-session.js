export function setMediaSessionMetadata(mediaSession, MediaMetadataClass, podcast, episode) {
  if (!mediaSession || !MediaMetadataClass || !podcast || !episode) return

  const artwork = podcast.image
    ? [{ src: podcast.image }]
    : []

  mediaSession.metadata = new MediaMetadataClass({
    title: episode.title,
    artist: podcast.title,
    album: podcast.title,
    artwork
  })
}

export function setMediaSessionPosition(mediaSession, audio) {
  if (!mediaSession?.setPositionState) return
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return
  if (!Number.isFinite(audio.currentTime)) return

  const position = Math.min(Math.max(0, audio.currentTime), audio.duration)

  try {
    mediaSession.setPositionState({
      duration: audio.duration,
      playbackRate: audio.playbackRate || 1,
      position
    })
  } catch {
    // Some WebKit versions reject position updates during media transitions.
  }
}