'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { Star, MessageSquare } from 'lucide-react';

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      setLoading(true);
      const res = await api.get('/user/reviews');
      if (res.success) {
        setReviews(res.data?.reviews || res.data || []);
      }
      setLoading(false);
    }
    loadReviews();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Reviews</h1>
          <p className="text-sm text-gray-500">View and manage all the reviews you have written</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white p-5 rounded-2xl border border-gray-200 hover:shadow-sm transition">
              <div className="flex gap-4">
                <Link href={`/products/${review.product_slug}`} className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                  {review.product_image ? (
                    <img src={review.product_image} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">No Img</div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <Link href={`/products/${review.product_slug}`} className="font-bold text-gray-900 hover:text-indigo-600 line-clamp-1">
                      {review.product_name}
                    </Link>
                    <div className="flex items-center gap-2 flex-shrink-0 text-xs">
                      <span className={`px-2 py-1 rounded-md font-bold uppercase ${
                        review.status === 'approved' ? 'bg-green-100 text-green-700' :
                        review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {review.status || 'pending'}
                      </span>
                      <span className="text-gray-400">
                        {new Date(review.created_at || Date.now()).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-2 text-amber-500">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} size={14} className={star <= review.rating ? 'fill-amber-500' : 'text-gray-300'} />
                    ))}
                  </div>
                  {review.title && <div className="font-bold text-gray-800 text-sm mb-1">{review.title}</div>}
                  {review.body && <p className="text-gray-600 text-sm whitespace-pre-wrap">{review.body}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Reviews Yet</h3>
          <p className="text-gray-500 mt-2 max-w-sm">You haven't reviewed any products yet. Share your experience with other shoppers!</p>
        </div>
      )}
    </div>
  );
}
