import { useEffect, useState } from 'react'
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { BadgeDollarSign, Sparkles } from 'lucide-react'
import { CampaignCard } from '../components/CampaignCard'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/utils'
import type { Campaign } from '../types/database'

export function ProfilePage() {
  const { user } = useUser()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalDonated: 0, campaignsCreated: 0, totalBacked: 0 })

  useEffect(() => {
    if (user) {
      loadData()
      createProfileIfNeeded()
    }
  }, [user])

  async function createProfileIfNeeded() {
    if (!user) return
    const { data: existing } = await supabase.from('profiles').select('id').eq('clerk_id', user.id).maybeSingle()
    if (!existing) {
      await supabase.from('profiles').insert({
        clerk_id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        name: user.fullName || user.username || 'Anonymous',
        avatar_url: user.imageUrl,
      })
    }
  }

  async function loadData() {
    if (!user) return
    try {
      const { data: userCampaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
      if (userCampaigns) setCampaigns(userCampaigns as Campaign[])

      const { data: userDonations } = await supabase
        .from('donations')
        .select('id, amount, created_at, campaigns(title, id)')
        .eq('donor_id', user.id)
        .eq('anonymous', false)
        .order('created_at', { ascending: false })
        .limit(10)
      if (userDonations) setDonations(userDonations)

      setStats({
        totalDonated: userDonations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0,
        campaignsCreated: userCampaigns?.length || 0,
        totalBacked: new Set(userDonations?.map((d: any) => d.campaigns?.id)).size || 0,
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <SignedOut>
        <div className="text-center py-20">
          <p className="text-secondary-400 text-lg mb-6">Sign in to view your profile</p>
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl">
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">
          {user?.imageUrl && (
            <img src={user.imageUrl} alt={user.fullName || 'Profile'} className="w-24 h-24 rounded-2xl object-cover border-2 border-primary-500/20" />
          )}
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">{user?.fullName || 'Your Profile'}</h1>
            <p className="text-secondary-400">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-secondary-800/50 rounded-xl border border-secondary-700 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <BadgeDollarSign className="w-5 h-5 text-primary-400" />
              </div>
              <span className="text-secondary-400 text-sm">Total Donated</span>
            </div>
            <p className="font-display text-2xl font-bold text-white">{formatCurrency(stats.totalDonated)}</p>
          </div>

          <div className="bg-secondary-800/50 rounded-xl border border-secondary-700 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-accent-500/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-accent-400" />
              </div>
              <span className="text-secondary-400 text-sm">Campaigns Created</span>
            </div>
            <p className="font-display text-2xl font-bold text-white">{stats.campaignsCreated}</p>
          </div>

          <div className="bg-secondary-800/50 rounded-xl border border-secondary-700 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-secondary-500/10 rounded-lg">
                <BadgeDollarSign className="w-5 h-5 text-secondary-400" />
              </div>
              <span className="text-secondary-400 text-sm">Campaigns Backed</span>
            </div>
            <p className="font-display text-2xl font-bold text-white">{stats.totalBacked}</p>
          </div>
        </div>

        {campaigns.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display text-xl font-semibold text-white mb-4">Your Campaigns</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.slice(0, 3).map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
        )}

        {donations.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-semibold text-white mb-4">Recent Donations</h2>
            <div className="space-y-3">
              {donations.slice(0, 5).map((donation: any) => (
                <div key={donation.id} className="flex items-center justify-between p-4 bg-secondary-800/50 rounded-xl border border-secondary-700">
                  <div>
                    <Link to={`/campaign/${donation.campaigns?.id}`} className="text-white hover:text-primary-400">
                      {donation.campaigns?.title || 'Unknown Campaign'}
                    </Link>
                    <p className="text-secondary-500 text-sm">{new Date(donation.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="font-semibold text-primary-400">{formatCurrency(donation.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {campaigns.length === 0 && donations.length === 0 && !loading && (
          <div className="text-center py-16 bg-secondary-800/30 rounded-2xl border border-secondary-700">
            <p className="text-secondary-400 mb-4">You haven't created or backed any campaigns yet</p>
            <div className="flex justify-center gap-4">
              <Link to="/campaigns">
                <button className="px-5 py-2.5 bg-secondary-700 hover:bg-secondary-600 text-white rounded-xl">Explore Campaigns</button>
              </Link>
              <Link to="/create">
                <button className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl">Start a Campaign</button>
              </Link>
            </div>
          </div>
        )}
      </SignedIn>
    </div>
  )
}
