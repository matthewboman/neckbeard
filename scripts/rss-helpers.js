import crypto from 'node:crypto'

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function episodeId(item) {
  const source = item.guid || item.id || item.link || item.enclosure?.url || `${item.title}-${item.pubDate}`
  return crypto.createHash('sha1').update(String(source)).digest('hex').slice(0, 16)
}

export function getAudioUrl(item) {
  return item.enclosure?.url || item.enclosure?.link || ''
}

export function newestFirst(items) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.isoDate || a.pubDate || 0).getTime() || 0
    const bTime = new Date(b.isoDate || b.pubDate || 0).getTime() || 0
    return bTime - aTime
  })
}
