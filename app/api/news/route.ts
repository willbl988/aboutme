import { NextResponse } from 'next/server'

interface NewsArticle {
  id: string
  title: string
  description: string
  link: string
  pubDate: string
  source: string
  image?: string
}

// Golf news RSS feeds
const NEWS_SOURCES = [
  {
    name: 'Golf Digest',
    rss: 'https://www.golfdigest.com/feed/rss',
  },
  {
    name: 'Golf.com',
    rss: 'https://golf.com/feed/',
  },
  {
    name: 'PGA Tour',
    rss: 'https://www.pgatour.com/rss/rss.xml',
  },
  {
    name: 'ESPN Golf',
    rss: 'https://www.espn.com/espn/rss/golf/news',
  },
]

// Fallback mock news for when RSS feeds aren't available
const MOCK_NEWS: NewsArticle[] = [
  {
    id: '1',
    title: 'Tiger Woods Announces Return to Competitive Golf',
    description: 'The golf legend has confirmed his participation in upcoming tournaments after recovering from injury.',
    link: 'https://example.com/news/1',
    pubDate: new Date().toISOString(),
    source: 'Golf Digest',
  },
  {
    id: '2',
    title: 'New Golf Course Opens in Pebble Beach',
    description: 'A stunning new 18-hole championship course has opened, offering breathtaking ocean views.',
    link: 'https://example.com/news/2',
    pubDate: new Date(Date.now() - 86400000).toISOString(),
    source: 'Golf.com',
  },
  {
    id: '3',
    title: 'PGA Tour Announces 2024 Schedule Updates',
    description: 'Major changes to the tournament schedule include new venues and expanded prize pools.',
    link: 'https://example.com/news/3',
    pubDate: new Date(Date.now() - 172800000).toISOString(),
    source: 'PGA Tour',
  },
  {
    id: '4',
    title: 'Rising Star Wins First Major Championship',
    description: 'A young golfer makes history by winning their first major tournament in dramatic fashion.',
    link: 'https://example.com/news/4',
    pubDate: new Date(Date.now() - 259200000).toISOString(),
    source: 'ESPN Golf',
  },
  {
    id: '5',
    title: 'Golf Technology: New Smart Clubs Hit the Market',
    description: 'Revolutionary new golf clubs with embedded sensors and AI-powered swing analysis are now available.',
    link: 'https://example.com/news/5',
    pubDate: new Date(Date.now() - 345600000).toISOString(),
    source: 'Golf Digest',
  },
  {
    id: '6',
    title: 'Sustainability in Golf: Courses Go Green',
    description: 'More golf courses are adopting eco-friendly practices to reduce water usage and environmental impact.',
    link: 'https://example.com/news/6',
    pubDate: new Date(Date.now() - 432000000).toISOString(),
    source: 'Golf.com',
  },
]

async function parseRSSFeed(url: string, sourceName: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Golf-Budz-News-Feed/1.0',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.status}`)
    }

    const xml = await response.text()
    
    // Simple RSS parsing (for production, consider using a proper RSS parser library)
    const items: NewsArticle[] = []
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
    
    for (const match of itemMatches) {
      const itemXml = match[1]
      const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)
      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/)
      const descMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/)
      const dateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)
      const imageMatch = itemXml.match(/<enclosure[^>]*url="([^"]*)"/) || itemXml.match(/<media:content[^>]*url="([^"]*)"/)

      if (titleMatch && linkMatch) {
        const title = (titleMatch[1] || titleMatch[2] || '').trim()
        const link = linkMatch[1].trim()
        const description = (descMatch?.[1] || descMatch?.[2] || '').trim().replace(/<[^>]*>/g, '').substring(0, 200)
        const pubDate = dateMatch?.[1] || new Date().toISOString()
        const image = imageMatch?.[1]

        items.push({
          id: `${sourceName}-${items.length}`,
          title,
          description,
          link,
          pubDate,
          source: sourceName,
          image,
        })
      }
    }

    return items.slice(0, 10) // Limit to 10 items per source
  } catch (error) {
    console.error(`Error parsing RSS feed from ${sourceName}:`, error)
    return []
  }
}

export async function GET() {
  try {
    let allArticles: NewsArticle[] = []

    // Try to fetch from RSS feeds
    const feedPromises = NEWS_SOURCES.map(source => 
      parseRSSFeed(source.rss, source.name)
    )

    const feedResults = await Promise.allSettled(feedPromises)
    
    feedResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allArticles.push(...result.value)
      }
    })

    // If no articles from RSS, use mock data
    if (allArticles.length === 0) {
      allArticles = MOCK_NEWS
    }

    // Sort by date (newest first)
    allArticles.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime()
      const dateB = new Date(b.pubDate).getTime()
      return dateB - dateA
    })

    // Limit to 30 most recent articles
    allArticles = allArticles.slice(0, 30)

    return NextResponse.json({ articles: allArticles })
  } catch (error) {
    console.error('Error fetching news:', error)
    // Return mock news as fallback
    return NextResponse.json({ articles: MOCK_NEWS })
  }
}

