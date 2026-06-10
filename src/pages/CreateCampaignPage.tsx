import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, useAuth } from '@clerk/clerk-react'
import { Sparkles, Upload, AlertCircle } from 'lucide-react'
import { Button } from '../components/Button'
import { supabase } from '../lib/supabase'
import type { CampaignCategory } from '../types/database'

const categories: { value: CampaignCategory; label: string }[] = [
  { value: 'technology', label: 'Technology' },
  { value: 'creative', label: 'Creative Works' },
  { value: 'community', label: 'Community' },
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health' },
  { value: 'environment', label: 'Environment' },
  { value: 'business', label: 'Business' },
  { value: 'other', label: 'Other' },
]

const sampleImages = [
  'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/669612/pexels-photo-669612.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?auto=compress&cs=tinysrgb&w=800',
]

export function CreateCampaignPage() {
  const navigate = useNavigate()
  const { userId } = useAuth()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    category: '' as CampaignCategory | '',
    goal_amount: '',
    end_date: '',
    image_url: sampleImages[0],
  })

  async function generateWithAI() {
    if (!formData.title && !formData.category) {
      setError('Please enter a title or select a category first')
      return
    }
    setAiLoading(true)
    setError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'campaign',
          title: formData.title,
          category: formData.category,
        }),
      })

      const result = await response.json()
      if (result.description) {
        setFormData(prev => ({
          ...prev,
          description: result.description,
          short_description: result.short_description || prev.short_description,
        }))
      }
    } catch {
      setError('Failed to generate content. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: insertError } = await supabase
        .from('campaigns')
        .insert({
          title: formData.title,
          description: formData.description,
          short_description: formData.short_description || formData.description.substring(0, 150),
          category: formData.category,
          goal_amount: parseFloat(formData.goal_amount),
          image_url: formData.image_url,
          creator_id: userId,
          end_date: formData.end_date,
          status: 'active',
        })
        .select()
        .single()

      if (insertError) throw insertError
      if (data) navigate(`/campaign/${data.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">Start Your Challenge</h1>
        <p className="text-secondary-400">Share your idea with the world</p>
      </div>

      <SignedOut>
        <div className="text-center py-16 bg-secondary-800/50 rounded-2xl border border-secondary-700">
          <AlertCircle className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
          <h2 className="text-xl font-display font-semibold text-white mb-2">Sign in Required</h2>
          <p className="text-secondary-400 mb-6">You need to be signed in to create a campaign</p>
          <SignInButton mode="modal">
            <Button>Sign In to Continue</Button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="bg-secondary-800/50 rounded-2xl border border-secondary-700 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">Challenge Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a compelling title"
                required
                className="w-full px-4 py-3 bg-secondary-900 border border-secondary-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as CampaignCategory }))}
                  required
                  className="w-full px-4 py-3 bg-secondary-900 border border-secondary-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">Funding Goal (USD) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-500">$</span>
                  <input
                    type="number"
                    value={formData.goal_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, goal_amount: e.target.value }))}
                    placeholder="10000"
                    min="100"
                    required
                    className="w-full pl-8 pr-4 py-3 bg-secondary-900 border border-secondary-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">Challenge End Date *</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-3 bg-secondary-900 border border-secondary-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="bg-secondary-800/50 rounded-2xl border border-secondary-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-secondary-300">Challenge Description *</label>
              <Button type="button" variant="outline" size="sm" onClick={generateWithAI} loading={aiLoading}>
                <Sparkles className="w-4 h-4 mr-1" />
                AI Assist
              </Button>
            </div>

            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your campaign in detail..."
              required
              rows={8}
              className="w-full px-4 py-3 bg-secondary-900 border border-secondary-700 rounded-xl text-white resize-none focus:outline-none focus:border-primary-500"
            />

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">Short Summary (optional)</label>
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                placeholder="Brief tagline for your campaign card"
                maxLength={150}
                className="w-full px-4 py-3 bg-secondary-900 border border-secondary-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="bg-secondary-800/50 rounded-2xl border border-secondary-700 p-6">
            <label className="block text-sm font-medium text-secondary-300 mb-3">
              <Upload className="w-4 h-4 inline mr-2" />
              Cover Image
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {sampleImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image_url: img }))}
                  className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    formData.image_url === img ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-transparent hover:border-secondary-600'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-sm text-secondary-400 mb-2">Or enter custom image URL:</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-secondary-900 border border-secondary-700 rounded-xl text-white focus:outline-none focus:border-primary-500 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={loading} disabled={!formData.title || !formData.category || !formData.goal_amount}>
              Create Challenge
            </Button>
          </div>
        </form>
      </SignedIn>
    </div>
  )
}
