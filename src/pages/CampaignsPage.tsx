import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { CampaignCard } from '../components/CampaignCard'
import { Button } from '../components/Button'
import { supabase } from '../lib/supabase'
import type { Campaign, CampaignCategory } from '../types/database'

const categories: CampaignCategory[] = [
  'technology', 'creative', 'community', 'education', 'health', 'environment', 'business', 'other'
]

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'trending', label: 'Most Funded' },
  { value: 'ending_soon', label: 'Ending Soon' },
]

export function CampaignsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState<CampaignCategory | null>(
    searchParams.get('category') as CampaignCategory | null
  )
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')

  useEffect(() => {
    loadCampaigns()
  }, [selectedCategory, sortBy])

  async function loadCampaigns() {
    setLoading(true)
    try {
      let query = supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')

      if (selectedCategory) {
        query = query.eq('category', selectedCategory)
      }

      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false })
      } else if (sortBy === 'trending') {
        query = query.order('current_amount', { ascending: false })
      } else if (sortBy === 'ending_soon') {
        query = query.order('end_date', { ascending: true })
      }

      const { data } = await query.limit(24)

      if (data) {
        let filtered = data as Campaign[]
        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          filtered = filtered.filter(
            (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
          )
        }
        setCampaigns(filtered)
      }
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    loadCampaigns()
  }

  function clearFilters() {
    setSelectedCategory(null)
    setSortBy('newest')
    setSearchQuery('')
    setSearchParams(new URLSearchParams())
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex-1">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search challenges..."
              className="w-full pl-12 pr-4 py-3 bg-secondary-800 border border-secondary-700 rounded-xl text-white placeholder-secondary-500 focus:outline-none focus:border-primary-500"
            />
          </form>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-secondary-800 border border-secondary-700 rounded-xl text-white"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !selectedCategory ? 'bg-primary-500 text-white' : 'bg-secondary-800 text-secondary-400 hover:text-white'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              selectedCategory === category
                ? 'bg-primary-500 text-white'
                : 'bg-secondary-800 text-secondary-400 hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}

        {(selectedCategory || searchQuery || sortBy !== 'newest') && (
          <button onClick={clearFilters} className="px-4 py-2 rounded-full text-sm font-medium bg-secondary-800 text-secondary-400 hover:text-white flex items-center gap-1">
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-secondary-700 rounded-2xl mb-4" />
              <div className="h-4 bg-secondary-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : campaigns.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-secondary-400 text-lg mb-4">No campaigns found</p>
          <Button onClick={clearFilters}>Clear Filters</Button>
        </div>
      )}
    </div>
  )
}
