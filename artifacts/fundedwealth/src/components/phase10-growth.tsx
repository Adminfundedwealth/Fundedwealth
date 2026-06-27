/**
 * Phase 10: Growth + Trust Frontend Components
 * 
 * Components:
 * - PublicPayoutsList
 * - CertificateVerifier
 * - LeaderboardView
 * - TraderReviews
 * - TraderProfile
 * - AffiliateStatsPanel
 * - BlogFeed
 * - ReputationScore
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, Award, TrendingUp, Star, Users, CheckCircle, QrCode } from 'lucide-react';

// ============================================================================
// 1. PUBLIC PAYOUTS LIST - Show recent verified withdrawals
// ============================================================================

export const PublicPayoutsList: React.FC<{ periodDays?: number }> = ({ periodDays = 7 }) => {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const res = await fetch(`/api/public/payouts?limit=20&period=${periodDays}`);
        const data = await res.json();
        setPayouts(data.payouts);
        setStats(data.stats);
      } catch (error) {
        console.error('Failed to fetch payouts', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayouts();
  }, [periodDays]);

  if (loading) return <div className="animate-pulse">Loading verified payouts...</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <CheckCircle className="text-green-600" size={24} />
        Recent Verified Payouts
      </h2>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total Paid Out</p>
            <p className="text-2xl font-bold text-green-700">
              ${stats.totalAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded">
            <p className="text-sm text-gray-600">Verified Traders</p>
            <p className="text-2xl font-bold text-blue-700">{stats.uniqueTraders}</p>
          </div>
        </div>
      )}

      {/* Payout List */}
      <div className="space-y-3">
        {payouts.map((payout) => (
          <div
            key={payout.id}
            className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">{payout.anonymousId}</p>
                <p className="text-sm text-gray-500">
                  {new Date(payout.payoutDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">
                  +${parseFloat(payout.amountUsd).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 uppercase">{payout.challengeDuration}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-xs text-gray-600">Verified withdrawal</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        All trader identities anonymized. Verified on-chain.
      </p>
    </div>
  );
};

// ============================================================================
// 2. CERTIFICATE VERIFIER - QR code verification display
// ============================================================================

export const CertificateVerifier: React.FC<{ certId?: string }> = ({ certId: initialCertId }) => {
  const [certId, setCertId] = useState(initialCertId || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verifyCertificate = async () => {
    if (!certId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/public/certificates/${certId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Certificate not found');
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Failed to verify certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <QrCode size={24} />
        Verify Certificate
      </h2>

      <div className="space-y-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Certificate ID or Scan QR
          </label>
          <input
            type="text"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            placeholder="cert-xyz123"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={verifyCertificate}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Verifying...' : 'Verify Certificate'}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 flex gap-2">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              Certificate Verified
            </p>
            <p className="text-sm text-green-800">{result.message}</p>
            <div className="mt-3 bg-white rounded p-3 text-sm space-y-1 border border-green-100">
              <p>
                <span className="font-semibold">Amount:</span> ${result.certificate.amount}
              </p>
              <p>
                <span className="font-semibold">Issued:</span>{' '}
                {new Date(result.certificate.issuedDate).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold">Verifications:</span>{' '}
                {result.certificate.verificationCount}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 3. LEADERBOARD VIEW - Rankings
// ============================================================================

export const LeaderboardView: React.FC<{ type?: string }> = ({
  type = 'traders_earnings',
}) => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(type);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`/api/leaderboards/${selectedType}?limit=50`);
        const data = await res.json();
        setLeaderboard(data.leaderboard);
      } catch (error) {
        console.error('Failed to fetch leaderboard', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedType]);

  const types = [
    { id: 'traders_earnings', label: 'Top Earners', icon: <Award size={16} className="inline mr-2" /> },
    { id: 'traders_consistency', label: 'Top Consistency', icon: <TrendingUp size={16} className="inline mr-2" /> },
    { id: 'affiliates_commissions', label: 'Top Affiliates', icon: <Users size={16} className="inline mr-2" /> },
  ];

  if (loading) return <div className="animate-pulse">Loading leaderboard...</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-3xl">
      {/* Tabs */}
      <div className="flex border-b">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedType(t.id)}
            className={`flex-1 py-3 px-4 text-center font-semibold transition ${
              selectedType === t.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Rankings */}
      <div className="divide-y">
        {leaderboard.slice(0, 10).map((entry, idx) => (
          <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <div
                className={`text-2xl font-bold w-10 h-10 rounded-full flex items-center justify-center ${
                  idx === 0
                    ? 'bg-yellow-100 text-yellow-600'
                    : idx === 1
                    ? 'bg-gray-100 text-gray-600'
                    : idx === 2
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-blue-50 text-blue-600'
                }`}
              >
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{entry.anonymousId}</p>
                <p className="text-xs text-gray-500">Verified trader</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{entry.metricLabel}</p>
              <p className="text-xs text-gray-500">{entry.period}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 4. TRADER REVIEWS - Verified trader reviews
// ============================================================================

export const TraderReviews: React.FC<{ traderId: string }> = ({ traderId }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/traders/${traderId}/reviews`);
        const data = await res.json();
        setReviews(data.reviews);
        setAvgRating(parseFloat(data.averageRating) || 0);
      } catch (error) {
        console.error('Failed to fetch reviews', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [traderId]);

  if (loading) return <div className="animate-pulse">Loading reviews...</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Star size={24} className="text-yellow-500" />
        Verified Reviews
      </h2>

      {/* Rating Summary */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded mb-6">
        <div className="flex items-center gap-2">
          <div className="text-4xl font-bold text-orange-600">{avgRating.toFixed(1)}</div>
          <div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={20}
                  className={i <= Math.round(avgRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">{reviews.length} reviews</p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border border-gray-200 rounded p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-900">{review.reviewerAnonymousId}</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i <= review.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-700">{review.reviewText}</p>
            {review.verifiedPayout && (
              <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                <CheckCircle size={14} />
                Verified trader
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 5. REPUTATION SCORE - Trust indicator
// ============================================================================

export const ReputationScore: React.FC<{ score: number; components?: any }> = ({
  score,
  components,
}) => {
  const getColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reputation Score</h3>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`text-4xl font-bold ${getColor(score)}`}>{score}</div>
          <div>
            <p className={`text-sm font-semibold ${getColor(score)}`}>{getLabel(score)}</p>
            <p className="text-xs text-gray-500">/100</p>
          </div>
        </div>
        <Award size={40} className={`${getColor(score)}`} />
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-4">
        <div
          className={`h-full ${
            score >= 80
              ? 'bg-green-600'
              : score >= 60
              ? 'bg-blue-600'
              : score >= 40
              ? 'bg-yellow-600'
              : 'bg-red-600'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Components */}
      {components && (
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-gray-700">Score Breakdown</p>
          {Object.entries(components).map(([key, value]: [string, any]) => (
            <div key={key} className="flex justify-between text-gray-600">
              <span>{key}</span>
              <span className="font-semibold">{value.score}/{value.max}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 6. BLOG FEED - Latest articles
// ============================================================================

export const BlogFeed: React.FC<{ limit?: number; category?: string }> = ({
  limit = 10,
  category,
}) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (category) params.append('category', category);

        const res = await fetch(`/api/blog?${params}`);
        const data = await res.json();
        setPosts(data.posts);
      } catch (error) {
        console.error('Failed to fetch blog posts', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [limit, category]);

  if (loading) return <div className="animate-pulse">Loading blog posts...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
        >
          {post.ogImage && (
            <img
              src={post.ogImage}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-6">
            <div className="flex gap-2 mb-2">
              {post.tags?.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
              <a href={`/blog/${post.slug}`} className="text-blue-600 hover:underline font-semibold">
                Read More →
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};
