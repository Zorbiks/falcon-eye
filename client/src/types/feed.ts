export interface FeedItem {
  title: string
  link: string
  description: string
  source: string
  publishedAt: string
  imageUrl: string | null
}

export interface FeedCard extends FeedItem {
  sourceLabel: string
  publishedLabel: string
}
