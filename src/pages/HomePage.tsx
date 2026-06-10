import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Users, Shield, Zap } from 'lucide-react'
import { CampaignCard } from '../components/CampaignCard'
import { Button } from '../components/Button'
import { supabase } from '../lib/supabase'
import type { Campaign } from '../types/database'

const features = [
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Connect with supporters who believe in your vision and want to see it succeed.',
  },
  {
    icon: Shield,
    title: 'Simple Pledges',
    description: 'Support challenges easily with our streamlined pledge system.',
  },
  {
    icon: Zap,
    title: 'AI Assistant',
    description: 'Get help crafting compelling challenge stories with our AI-powered assistant.',
  },
]

const categories = [
  { name: 'Technology', slug: 'technology' },
  { name: 'Creative', slug: 'creative' },
  { name: 'Community', slug: 'community' },
  { name: 'Education', slug: 'education' },
  { name: 'Health', slug: 'health' },
  { name: 'Environment', slug: 'environment' },
]

export function HomePage() {
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCampaigns()
  }, [])

  async function loadCampaigns() {
    try {
      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .order('current_amount', { ascending: false })
        .limit(6)

      if (data) {
        setFeaturedCampaigns(data as Campaign[])
      }
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-400">AI-Powered Challenge Platform</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Support Challenges That
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-500">
              Make a Difference
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-secondary-400 mb-10">
            Join thousands of creators and supporters making impact through challenges.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/campaigns">
              <Button size="lg">
                Explore Challenges
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/create">
              <Button variant="outline" size="lg">
                Start a Challenge
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white text-center mb-12">
            Why Choose FundedPlus?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-secondary-800/50 rounded-2xl border border-secondary-700/50 hover:border-primary-500/50 transition-colors"
              >
                <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-secondary-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
                Featured Challenges
              </h2>
              <p className="text-secondary-400">Discover challenges gaining momentum</p>
            </div>
            <Link to="/campaigns">
              <Button variant="ghost">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-secondary-700 rounded-2xl mb-4" />
                  <div className="h-4 bg-secondary-700 rounded w-3/4 mb-2" />
                </div>
              ))}
            </div>
          ) : featuredCampaigns.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-secondary-400 mb-4">No challenges yet. Be the first!</p>
              <Link to="/create">
                <Button>Create Challenge</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white text-center mb-10">
            Browse by Category
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/campaigns?category=${category.slug}`}
                className="p-4 bg-secondary-800/50 rounded-xl border border-secondary-700/50 hover:border-primary-500/50 text-center group"
              >
                <h3 className="font-medium text-white group-hover:text-primary-400 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
