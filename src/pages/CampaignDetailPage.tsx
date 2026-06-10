import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, useAuth } from '@clerk/clerk-react'
import { Heart, Share2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '../components/Button'
import { supabase } from '../lib/supabase'
import { formatCurrency, calculateProgress, formatTimeRemaining } from '../lib/utils'
import type { Campaign, CampaignCategory } from '../types/database'

interface PledgeData {
  id: string
  amount: number
  message: string | null
  anonymous: boolean
  created_at: string
  donor_id: string
}

const categoryLabels: Record<CampaignCategory, string> = {
  technology: 'Technology', creative: 'Creative', community: 'Community',
  education: 'Education', health: 'Health', environment: 'Environment',
  business: 'Business', other: 'Other',
}

export function CampaignDetailPage() {
  const { id } = useParams()
  const { userId } = useAuth()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [pledges, setPledges] = useState<PledgeData[]>([])
  const [loading, setLoading] = useState(true)
  const [pledging, setPledging] = useState(false)
  const [pledgeAmount, setPledgeAmount] = useState('')
  const [pledgeMessage, setPledgeMessage] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (id) {
      loadCampaign()
      loadPledges()
    }
  }, [id])

  async function loadCampaign() {
    try {
      const { data } = await supabase.from('campaigns').select('*').eq('id', id).single()
      if (data) setCampaign(data as Campaign)
    } catch {
      console.error('Error loading campaign')
    } finally {
      setLoading(false)
    }
  }

  async function loadPledges() {
    try {
      const { data } = await supabase
        .from('donations')
        .select('*')
        .eq('campaign_id', id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) setPledges(data as PledgeData[])
    } catch {
      console.error('Error loading pledges')
    }
  }

  async function handlePledge() {
    if (!campaign || !pledgeAmount || parseFloat(pledgeAmount) < 1 || !userId) return
    setPledging(true)

    try {
      const { error } = await supabase.from('donations').insert({
        campaign_id: campaign.id,
        donor_id: userId,
        amount: parseFloat(pledgeAmount),
        message: pledgeMessage || null,
        anonymous,
      })

      if (error) throw error

      await supabase.rpc('update_campaign_total', { cid: campaign.id, amount: parseFloat(pledgeAmount) })

      setSuccess(true)
      setPledgeAmount('')
      setPledgeMessage('')
      loadCampaign()
      loadPledges()
    } catch {
      console.error('Error creating pledge')
    } finally {
      setPledging(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="aspect-video bg-secondary-700 rounded-2xl mb-6" />
          <div className="h-8 bg-secondary-700 rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
        <AlertCircle className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
        <h1 className="text-2xl font-display font-bold text-white mb-2">Challenge not found</h1>
        <Link to="/campaigns">
          <Button><ArrowLeft className="w-4 h-4 mr-2" />Back to Challenges</Button>
        </Link>
      </div>
    )
  }

  const progress = calculateProgress(campaign.current_amount, campaign.goal_amount)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <Link to="/campaigns" className="inline-flex items-center gap-2 text-secondary-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />Back to Challenges
      </Link>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="aspect-video rounded-2xl overflow-hidden mb-6 border border-secondary-700">
            <img src={campaign.image_url} alt={campaign.title} className="w-full h-full object-cover" />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">{campaign.title}</h1>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-sm font-medium text-primary-400">
              {categoryLabels[campaign.category]}
            </span>
            <span className="text-secondary-500 text-sm">
              Created {new Date(campaign.created_at).toLocaleDateString()}
            </span>
          </div>

          <p className="text-secondary-300 whitespace-pre-line">{campaign.description}</p>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
            <div className="bg-secondary-800/50 rounded-2xl border border-secondary-700 p-6">
              <div className="mb-6">
                <div className="text-3xl font-display font-bold text-primary-400 mb-1">
                  {formatCurrency(campaign.current_amount)}
                </div>
                <div className="text-secondary-400 text-sm mb-4">
                  pledged of {formatCurrency(campaign.goal_amount)} goal
                </div>

                <div className="h-3 bg-secondary-700 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-display font-bold text-white">{campaign.backers_count}</div>
                    <div className="text-secondary-500 text-sm">supporters</div>
                  </div>
                  <div>
                    <div className="text-2xl font-display font-bold text-white">
                      {formatTimeRemaining(campaign.end_date)}
                    </div>
                    <div className="text-secondary-500 text-sm">remaining</div>
                  </div>
                </div>
              </div>

              <SignedOut>
                <SignInButton mode="modal">
                  <Button className="w-full" size="lg">Sign in to Support</Button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                {success ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                    <p className="text-white font-medium mb-1">Pledge Successful!</p>
                    <p className="text-secondary-400 text-sm">Thank you for your support</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setSuccess(false)}>
                      Make Another Pledge
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-400 mb-2">
                        Pledge Amount (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-500">$</span>
                        <input
                          type="number"
                          value={pledgeAmount}
                          onChange={(e) => setPledgeAmount(e.target.value)}
                          placeholder="10"
                          min="1"
                          className="w-full pl-8 pr-4 py-3 bg-secondary-900 border border-secondary-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-400 mb-2">
                        Leave a Message (optional)
                      </label>
                      <textarea
                        value={pledgeMessage}
                        onChange={(e) => setPledgeMessage(e.target.value)}
                        placeholder="Support this challenge..."
                        rows={2}
                        className="w-full px-4 py-3 bg-secondary-900 border border-secondary-700 rounded-xl text-white resize-none"
                      />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={anonymous}
                        onChange={(e) => setAnonymous(e.target.checked)}
                        className="w-5 h-5 rounded text-primary-500 bg-secondary-900"
                      />
                      <span className="text-sm text-secondary-400">Make anonymous</span>
                    </label>

                    <Button
                      onClick={handlePledge}
                      loading={pledging}
                      disabled={!pledgeAmount || parseFloat(pledgeAmount) < 1}
                      className="w-full"
                      size="lg"
                    >
                      Pledge Now
                    </Button>
                  </div>
                )}
              </SignedIn>

              <div className="border-t border-secondary-700 mt-6 pt-6 flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-secondary-400 hover:text-white">
                  <Heart className="w-4 h-4" /><span className="text-sm">Save</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-secondary-400 hover:text-white">
                  <Share2 className="w-4 h-4" /><span className="text-sm">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {pledges.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-white mb-6">Recent Pledges</h2>
          <div className="space-y-4">
            {pledges.map((pledge) => (
              <div
                key={pledge.id}
                className="flex items-start gap-4 p-4 bg-secondary-800/50 rounded-xl border border-secondary-700"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                  {pledge.anonymous ? '?' : 'S'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">
                      {pledge.anonymous ? 'Anonymous' : 'Supporter'}
                    </span>
                    <span className="text-primary-400 font-semibold">{formatCurrency(pledge.amount)}</span>
                  </div>
                  {pledge.message && <p className="text-secondary-400 text-sm">{pledge.message}</p>}
                  <p className="text-secondary-600 text-xs mt-1">
                    {new Date(pledge.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
