import { Link } from 'react-router-dom'
import { Calendar, Users, Heart } from 'lucide-react'
import type { Campaign } from '../types/database'
import { formatCurrency, calculateProgress, formatTimeRemaining } from '../lib/utils'

interface Props {
  campaign: Campaign
}

export function CampaignCard({ campaign }: Props) {
  const progress = calculateProgress(campaign.current_amount, campaign.goal_amount)

  return (
    <Link to={`/campaign/${campaign.id}`} className="group">
      <article className="bg-secondary-800/50 rounded-2xl overflow-hidden border border-secondary-700/50 hover:border-primary-500/50 transition-all hover:shadow-xl hover:shadow-primary-500/10">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={campaign.image_url}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-secondary-900/80 backdrop-blur-sm rounded-full text-xs font-medium text-primary-400 capitalize">
              {campaign.category}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <button
              onClick={(e) => e.preventDefault()}
              className="p-2 bg-secondary-900/80 backdrop-blur-sm rounded-full hover:bg-primary-500 transition-colors"
            >
              <Heart className="w-4 h-4 text-secondary-400 hover:text-white" />
            </button>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-display text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
            {campaign.title}
          </h3>

          {campaign.short_description && (
            <p className="text-secondary-400 text-sm mb-4 line-clamp-2">
              {campaign.short_description}
            </p>
          )}

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-primary-400 font-semibold">{formatCurrency(campaign.current_amount)}</span>
              <span className="text-secondary-500">of {formatCurrency(campaign.goal_amount)}</span>
            </div>

            <div className="h-2 bg-secondary-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-secondary-500">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{campaign.backers_count} backers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{formatTimeRemaining(campaign.end_date)}</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
