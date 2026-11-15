import Link from 'next/link';
import {
  ShieldCheck, FileText, ArrowRight,
  Lock, RotateCcw, Truck, Cookie
} from 'lucide-react';

export const revalidate = 86400;

export const metadata = {
  title: 'Trust & Legal Center | Provoke Playtech',
  description: 'Read the official customer policies, privacy commitments, refund terms, and shipping guidelines at Provoke Playtech.'
};

const ICONS = {
  privacy: Lock,
  refund: RotateCcw,
  terms: ShieldCheck,
  shipping: Truck,
  cookie: Cookie,
  custom: FileText
};

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://backend.provokeplaytech.com/api/v1';

async function getPolicies() {
  try {
    const res = await fetch(`${API_BASE}/policies`, {
      next: {
        revalidate: 86400,
        tags: ['policies']
      }
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (err) {
    console.error('[Policies Hub Static Fetch Error]:', err.message);
    return [];
  }
}

export default async function PoliciesDirectoryPage() {
  const policies = await getPolicies();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-center space-y-4">
          <div className="inline-flex p-3 bg-[#F51F2D]/10 text-[#F51F2D] rounded-2xl">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
            Trust & Legal Center
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Transparent, customer-first terms and policies. Learn how we safeguard your personal data, handle returns, process refunds, and deliver your orders.
          </p>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {policies.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-sm text-slate-500">No legal policies currently published.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {policies.map((p) => {
              const IconComponent = ICONS[p.type] || FileText;

              return (
                <Link
                  key={p.id}
                  href={`/policies/${p.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-[#F51F2D]/30 transition flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="p-3 bg-slate-50 text-[#F51F2D] group-hover:bg-[#F51F2D]/10 rounded-xl transition">
                        <IconComponent size={22} />
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {p.type}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#F51F2D] transition font-heading">
                        {p.title}
                      </h2>
                      {p.summary && (
                        <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {p.summary}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#F51F2D]">
                    <span>Read Policy Document</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
