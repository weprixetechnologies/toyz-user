'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';

export default function AffiliateRefRedirectPage() {
  const { code } = useParams();
  const router = useRouter();

  useEffect(() => {
    async function trackAndRedirect() {
      if (code) {
        await api.get(`/affiliate/track`, { code }).catch(() => {});
      }
      router.push('/');
    }
    trackAndRedirect();
  }, [code, router]);

  return (
    <div className="max-w-md mx-auto my-24 p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-lg space-y-4">
      <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto" />
      <p className="text-sm font-semibold text-gray-700">Redirecting to WePrixe Store...</p>
    </div>
  );
}
