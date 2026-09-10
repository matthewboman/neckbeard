import { escapeHtml, formatDate, formatTime, stripHtml } from './utils.js'

const state = {
  data: null,
  currentEpisode: null,
  currentPodcast: null
}

const homeView = document.querySelector('#homeView')
const podcastView = document.querySelector('#podcastView')
const podcastGrid = document.querySelector('#podcastGrid')
const searchInput = document.querySelector('#searchInput')
const emptyState = document.querySelector('#emptyState')
const backButton = document.querySelector('#backButton')
const updatedAt = document.querySelector('#updatedAt')

const player = document.querySelector('#player')
const audio = document.querySelector('#audio')
const playPause = document.querySelector('#playPause')
const rewind = document.querySelector('#rewind')
const forward = document.querySelector('#forward')
const seek = document.querySelector('#seek')
const currentTime = document.querySelector('#currentTime')
const duration = document.querySelector('#duration')
const speed = document.querySelector('#speed')
const closePlayer = document.querySelector('#closePlayer')
const playerEpisode = document.querySelector('#playerEpisode')
const playerPodcast = document.querySelector('#playerPodcast')
const playerArtwork = document.querySelector('#playerArtwork')

function artwork(podcast, className = 'size-20') {
  if (podcast.image) {
    return `<img src="${escapeHtml(podcast.image)}" alt="" class="${className} shrink-0 rounded-xl object-cover" loading="lazy">`
  }

  return `<div class="${className} flex shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-xl font-bold">${escapeHtml(podcast.title.slice(0, 1))}</div>`
}

function episodeButton(podcast, episode, compact = false) {
  const disabled = !episode.audio
  const label = disabled ? 'No audio URL' : 'Play episode'
  return `<button
    type="button"
    class="${compact ? 'secondary-button shrink-0' : 'icon-button shrink-0'}"
    data-play-podcast="${escapeHtml(podcast.id)}"
    data-play-episode="${escapeHtml(episode.id)}"
    aria-label="${label}"
    ${disabled ? 'disabled' : ''}
  >▶</button>`
}

function renderHome(filter = '') {
  const term = filter.trim().toLowerCase()
  const podcasts = state.data.podcasts.filter(podcast => {
    if (!term) return true
    const searchable = [
      podcast.title,
      podcast.description,
      ...podcast.episodes.flatMap(episode => [episode.title, stripHtml(episode.description)])
    ].join(' ').toLowerCase()
    return searchable.includes(term)
  })

  podcastGrid.innerHTML = podcasts.map(podcast => {
    const episode = podcast.episodes[0]
    if (!episode) return ''

    return `
      <article class="card p-4 sm:p-5">
        <div class="flex gap-4">
          <a href="#podcast=${encodeURIComponent(podcast.id)}" class="shrink-0 rounded-xl">${artwork(podcast)}</a>
          <div class="min-w-0 flex-1">
            <a href="#podcast=${encodeURIComponent(podcast.id)}" class="block text-lg font-bold hover:underline">${escapeHtml(podcast.title)}</a>
            <div class="mt-1 text-xs text-zinc-500">${formatDate(episode.publishedAt)}</div>
            <a href="#podcast=${encodeURIComponent(podcast.id)}" class="mt-2 block text-sm font-medium leading-5 hover:underline">${escapeHtml(episode.title)}</a>
          </div>
          ${episodeButton(podcast, episode, true)}
        </div>
      </article>
    `
  }).join('')

  emptyState.classList.toggle('hidden', podcasts.length > 0)
}

function renderPodcast(podcast) {
  const episodes = podcast.episodes.slice(0, 10)
  podcastView.innerHTML = `
    <div class="mb-8 flex items-start gap-5">
      ${artwork(podcast, 'size-24 sm:size-32')}
      <div class="min-w-0">
        <h1 class="text-2xl font-bold tracking-tight sm:text-4xl">${escapeHtml(podcast.title)}</h1>
        <p class="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">${escapeHtml(stripHtml(podcast.description))}</p>
        ${podcast.link ? `<a href="${escapeHtml(podcast.link)}" target="_blank" rel="noreferrer" class="mt-3 inline-block text-sm font-medium underline decoration-zinc-600 underline-offset-4 hover:decoration-white">Podcast website ↗</a>` : ''}
      </div>
    </div>

    <div class="space-y-3">
      ${episodes.map(episode => `
        <article class="card p-4 sm:p-5">
          <div class="flex items-start gap-4">
            <div class="min-w-0 flex-1">
              <div class="mb-1 text-xs text-zinc-500">${formatDate(episode.publishedAt)}${episode.duration ? ` · ${escapeHtml(String(episode.duration))}` : ''}</div>
              <h2 class="font-semibold leading-6">${escapeHtml(episode.title)}</h2>
              <p class="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">${escapeHtml(stripHtml(episode.description))}</p>
            </div>
            ${episodeButton(podcast, episode)}
          </div>
        </article>
      `).join('')}
    </div>
  `
}

function route() {
  const match = location.hash.match(/^#podcast=(.+)$/)
  const podcastId = match ? decodeURIComponent(match[1]) : null
  const podcast = podcastId ? state.data.podcasts.find(item => item.id === podcastId) : null

  if (podcast) {
    homeView.classList.add('hidden')
    podcastView.classList.remove('hidden')
    backButton.classList.remove('hidden')
    renderPodcast(podcast)
    document.title = `${podcast.title} · Podcasts`
    window.scrollTo({ top: 0 })
    return
  }

  homeView.classList.remove('hidden')
  podcastView.classList.add('hidden')
  backButton.classList.add('hidden')
  document.title = 'Podcasts'
  renderHome(searchInput.value)
}

function findEpisode(podcastId, episodeId) {
  const podcast = state.data.podcasts.find(item => item.id === podcastId)
  const episode = podcast?.episodes.find(item => item.id === episodeId)
  return { podcast, episode }
}

function setArtwork(podcast) {
  playerArtwork.innerHTML = podcast.image
    ? `<img src="${escapeHtml(podcast.image)}" alt="" class="size-full object-cover">`
    : escapeHtml(podcast.title.slice(0, 1))
}

function startEpisode(podcast, episode) {
  if (!episode.audio) return

  const sameEpisode = state.currentEpisode?.id === episode.id && state.currentPodcast?.id === podcast.id
  if (!sameEpisode) {
    state.currentPodcast = podcast
    state.currentEpisode = episode
    audio.src = episode.audio
    playerEpisode.textContent = episode.title
    playerPodcast.textContent = podcast.title
    setArtwork(podcast)
  }

  player.classList.remove('hidden')
  audio.play().catch(() => {})
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-play-episode]')
  if (!button) return
  const { podcast, episode } = findEpisode(button.dataset.playPodcast, button.dataset.playEpisode)
  if (podcast && episode) startEpisode(podcast, episode)
})

searchInput.addEventListener('input', () => renderHome(searchInput.value))
backButton.addEventListener('click', () => { location.hash = '' })
window.addEventListener('hashchange', route)

playPause.addEventListener('click', () => {
  if (audio.paused) audio.play().catch(() => {})
  else audio.pause()
})

rewind.addEventListener('click', () => {
  audio.currentTime = Math.max(0, audio.currentTime - 15)
})

forward.addEventListener('click', () => {
  if (!Number.isFinite(audio.duration)) return
  audio.currentTime = Math.min(audio.duration, audio.currentTime + 30)
})

speed.addEventListener('change', () => {
  audio.playbackRate = Number(speed.value)
})

seek.addEventListener('input', () => {
  if (!Number.isFinite(audio.duration)) return
  audio.currentTime = audio.duration * (Number(seek.value) / 100)
})

closePlayer.addEventListener('click', () => {
  audio.pause()
  player.classList.add('hidden')
})

audio.addEventListener('play', () => {
  playPause.textContent = '❚❚'
  playPause.setAttribute('aria-label', 'Pause')
})

audio.addEventListener('pause', () => {
  playPause.textContent = '▶'
  playPause.setAttribute('aria-label', 'Play')
})

audio.addEventListener('loadedmetadata', () => {
  duration.textContent = formatTime(audio.duration)
})

audio.addEventListener('timeupdate', () => {
  currentTime.textContent = formatTime(audio.currentTime)
  seek.value = Number.isFinite(audio.duration) && audio.duration > 0
    ? String((audio.currentTime / audio.duration) * 100)
    : '0'
})

async function init() {
  const response = await fetch('./data/podcasts.json', { cache: 'no-store' })
  if (!response.ok) throw new Error(`Could not load podcasts.json (${response.status})`)
  state.data = await response.json()
  updatedAt.textContent = state.data.updatedAt ? `Updated ${formatDate(state.data.updatedAt)}` : ''
  route()
}

init().catch(error => {
  podcastGrid.innerHTML = `<div class="card p-6 text-sm text-red-300">${escapeHtml(error.message)}</div>`
})
