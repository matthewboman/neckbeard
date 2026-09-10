import fs from 'node:fs/promises'
import Parser from 'rss-parser'
import { episodeId, getAudioUrl, newestFirst, slugify } from './rss-helpers.js'

const parser = new Parser({
  timeout: 20000,
  customFields: {
    feed: [['itunes:image', 'itunesImage']],
    item: [['itunes:duration', 'itunesDuration']]
  }
})

const feeds = JSON.parse(await fs.readFile(new URL('../data/feeds.json', import.meta.url), 'utf8'))
const podcasts = []

for (const configuredFeed of feeds) {
  try {
    console.log(`Fetching ${configuredFeed.name}: ${configuredFeed.url}`)
    const feed = await parser.parseURL(configuredFeed.url)
    const title = feed.title || configuredFeed.name
    const image = feed.itunes?.image || feed.image?.url || feed.itunesImage?.$?.href || ''

    const episodes = newestFirst(feed.items || [])
      .slice(0, 10)
      .map(item => ({
        id: episodeId(item),
        title: item.title || 'Untitled episode',
        description: item.contentSnippet || item.content || item.summary || '',
        publishedAt: item.isoDate || item.pubDate || '',
        audio: getAudioUrl(item),
        duration: item.itunes?.duration || item.itunesDuration || '',
        link: item.link || ''
      }))

    podcasts.push({
      id: configuredFeed.id || slugify(title),
      title,
      description: feed.description || '',
      image,
      link: feed.link || '',
      rss: configuredFeed.url,
      episodes
    })
  } catch (error) {
    console.error(`Failed to update ${configuredFeed.name}: ${error.message}`)
    process.exitCode = 1
  }
}

if (process.exitCode) {
  throw new Error('One or more feeds failed; podcasts.json was not replaced.')
}

const output = {
  updatedAt: new Date().toISOString(),
  podcasts: podcasts.sort((a, b) => a.title.localeCompare(b.title))
}

await fs.writeFile(
  new URL('../data/podcasts.json', import.meta.url),
  `${JSON.stringify(output, null, 2)}\n`
)

console.log(`Updated ${podcasts.length} podcasts.`)
