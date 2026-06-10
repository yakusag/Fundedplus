export interface Campaign {
  id: string
  title: string
  description: string
  short_description?: string
  category: CampaignCategory
  goal_amount: number
  current_amount: number
  image_url: string
  creator_id: string
  created_at: string
  end_date: string
  status: 'active' | 'completed' | 'paused'
  backers_count: number
}

export type CampaignCategory =
  | 'technology'
  | 'creative'
  | 'community'
  | 'education'
  | 'health'
  | 'environment'
  | 'business'
  | 'other'

export interface Donation {
  id: string
  campaign_id: string
  donor_id: string
  amount: number
  created_at: string
  message?: string
  anonymous: boolean
}

export interface UserProfile {
  id: string
  clerk_id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
  total_donated: number
  campaigns_created: number
}
