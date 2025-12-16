import { Award } from 'lucide-react';
import { VeteranRank } from '../../lib/supabase';

const RANKS = [
  { name: 'Bronze Veteran' as VeteranRank, stars: 0, color: 'from-amber-600 to-amber-700' },
  { name: 'Silver Veteran' as VeteranRank, stars: 25000, color: 'from-gray-400 to-gray-500' },
  { name: 'Ruby Veteran' as VeteranRank, stars: 40000, color: 'from-red-500 to-rose-600' },
  { name: 'Golden Veteran' as VeteranRank, stars: 50000, color: 'from-yellow-400 to-yellow-600' },
  { name: 'Diamond Veteran' as VeteranRank, stars: 60000, color: 'from-cyan-400 to-blue-500' },
  { name: 'Sapphire Veteran' as VeteranRank, stars: 65000, color: 'from-blue-600 to-indigo-700' },
  { name: 'Platinum Veteran' as VeteranRank, stars: 70000, color: 'from-slate-400 to-slate-600' },
  { name: 'Eternal Sage' as VeteranRank, stars: 100000, color: 'from-purple-500 to-pink-600' },
];

export function getRank(stars: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (stars >= RANKS[i].stars) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

export function getNextRank(stars: number) {
  const currentRankIndex = RANKS.findIndex((rank, index) => {
    const nextRank = RANKS[index + 1];
    return stars >= rank.stars && (!nextRank || stars < nextRank.stars);
  });

  if (currentRankIndex === -1 || currentRankIndex === RANKS.length - 1) {
    return null;
  }

  return RANKS[currentRankIndex + 1];
}

interface RankBadgeProps {
  stars: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RankBadge({ stars, showProgress = false, size = 'md' }: RankBadgeProps) {
  const currentRank = getRank(stars);
  const nextRank = getNextRank(stars);

  const sizeStyles = {
    sm: 'text-xs px-3 py-1',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-3',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  const progress = nextRank
    ? ((stars - currentRank.stars) / (nextRank.stars - currentRank.stars)) * 100
    : 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 bg-gradient-to-r ${currentRank.color} text-white rounded-full font-bold shadow-lg ${sizeStyles[size]}`}>
          <Award size={iconSizes[size]} />
          <span>{currentRank.name}</span>
        </div>
        <div className="text-lg font-semibold text-gray-700">
          {stars.toLocaleString()} stars
        </div>
      </div>

      {showProgress && nextRank && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress to {nextRank.name}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${nextRank.color} transition-all duration-500 rounded-full`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-right">
            {(nextRank.stars - stars).toLocaleString()} stars to go
          </div>
        </div>
      )}
    </div>
  );
}
