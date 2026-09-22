'use client';

import { useEffect, useState } from 'react';
import { getReviews, getMediaUrl } from '@/utils/api';

export default function CustomerReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchReviews = async () => {
      try {
        const data = await getReviews({ status: 'approved', limit: 10 });
        if (mounted && data?.length) {
          setReviews(data);
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReviews();
    return () => { mounted = false; };
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return ''; }
  };

  const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const getInitialColor = (name) => {
    const colors = ['#e67e22', '#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#1abc9c'];
    const idx = (name || '').charCodeAt(0) % colors.length;
    return colors[idx];
  };

  // Calculate rating distribution for the bar chart
  const ratingDist = [0, 0, 0, 0, 0]; // index 0 = 1 star, index 4 = 5 stars
  let totalRating = 0;
  reviews.forEach(r => {
    const rating = Math.round(Number(r.rating) || 5);
    const clamped = Math.max(1, Math.min(5, rating));
    ratingDist[clamped - 1]++;
    totalRating += clamped;
  });
  const avgRating = reviews.length ? (totalRating / reviews.length).toFixed(1) : '4.6';
  const maxCount = Math.max(...ratingDist, 1);

  if (!loading && reviews.length === 0) return null;

  return (
    <section style={{
      padding: '60px 0',
      background: 'transparent',
    }}>
      <div className="container" style={{ maxWidth: '1200px' }}>

        {loading ? (
          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 340px', height: 250, background: '#f5f5f5', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />
            <div style={{ flex: '1 1 500px', height: 250, background: '#f5f5f5', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

            {/* Left Side - Heading, Description, Google Rating & Bar Chart */}
            <div style={{ flex: '1 1 340px', minWidth: '280px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                marginBottom: '16px',
                fontFamily: '"Italiana", sans-serif',
              }}>
                Customer Reviews
              </h2>
              <p style={{
                fontSize: '14px',
                lineHeight: 1.7,
                color: '#666',
                marginBottom: '28px',
              }}>
                Hear directly from fellow travelers! These honest reviews and shared experiences can help you feel confident and excited about your next adventure.
              </p>

              {/* Google Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <svg width="28" height="28" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{avgRating}</span>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} style={{ color: star <= Math.round(avgRating) ? '#f5a623' : '#ddd', fontSize: '20px' }}>★</span>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#888', marginTop: '-16px', marginBottom: '24px' }}>
                From {reviews.length > 100 ? `${Math.round(reviews.length / 100) * 100}+` : reviews.length} reviews
              </p>

              {/* Rating Bar Chart */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = ratingDist[star - 1];
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#555', width: '14px' }}>{star}</span>
                      <div style={{
                        flex: 1,
                        height: '8px',
                        background: '#eee',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: star >= 4 ? '#2ecc71' : star === 3 ? '#f5a623' : '#e74c3c',
                          borderRadius: '4px',
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Review Cards */}
            <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '24px', maxHeight: '460px', overflowY: 'auto', paddingRight: '8px' }}>
              {reviews.slice(0, 8).map((review, idx) => {
                const name = review.user_name || review.reviewer_name || review.user_handle || 'Traveler';
                const date = formatDate(review.reviewed_on || review.created_at || review.createdAt);
                const rating = Math.round(Number(review.rating) || 5);
                const text = review.comment || review.description || review.title || '';
                const avatar = review.user_avatar ? getMediaUrl(review.user_avatar) : null;

                return (
                  <div key={review.id || idx} style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                    border: '1px solid #f0f0f0',
                  }}>
                    {/* Header: Avatar + Name + Date + Stars */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={name}
                          style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #f0f0f0' }}
                        />
                      ) : (
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%',
                          background: getInitialColor(name),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '18px', fontWeight: 700,
                        }}>
                          {getInitial(name)}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-primary)' }}>{name}</div>
                        {date && <div style={{ fontSize: '12px', color: '#999' }}>Reviewed on: {date}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <span key={s} style={{ color: s <= rating ? '#f5a623' : '#ddd', fontSize: '16px' }}>★</span>
                        ))}
                      </div>
                    </div>

                    {/* Review Text */}
                    {text && (
                      <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#555', margin: 0 }}>
                        {text.length > 180 ? (
                          <>
                            {text.slice(0, 180)}...{' '}
                            <span style={{ color: 'var(--color-text-primary)', fontWeight: 700, cursor: 'pointer' }}>Read more</span>
                          </>
                        ) : text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>
    </section>
  );
}
