export interface FeedItem {
  title: string
  link: string
  description: string
  source: string
  publishedAt: string
  imageUrl: string | null
  // human-friendly labels (optional, can be derived from source/publishedAt)
  sourceLabel?: string
  publishedLabel?: string
}

export interface FeedCard extends FeedItem {
  sourceLabel: string
  publishedLabel: string
}
