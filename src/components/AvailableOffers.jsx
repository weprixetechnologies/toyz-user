'use client';

import { Check, Lock, Tag } from 'lucide-react';

export default function AvailableOffers({ offers = [], selectedIds = [], onToggle, isRetailer = false }) {
  if (!offers.length) return null;

  return (
    <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="text-sky-600" size={20} />
        <h3 className="font-bold text-gray-900 text-lg">AVAILABLE OFFERS</h3>
      </div>
      <div className="space-y-2">
        {offers.map((offer) => {
          const selected = selectedIds.includes(String(offer.id)) && offer.applied !== false;
          const blocked = isRetailer || !offer.eligible;
          const reason = isRetailer ? 'RETAILER' : offer.blocked_reason;
          return (
            <div
              key={offer.id}
              className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
                blocked ? 'border-gray-200 bg-gray-50 text-gray-400' : selected ? 'border-sky-500 bg-sky-50' : 'border-gray-200'
              }`}
            >
              <div className="min-w-0">
                <div className={`font-bold text-sm ${blocked ? 'text-gray-500' : 'text-gray-900'}`}>{offer.name}</div>
                <div className="text-xs mt-0.5">{offer.description || `${offer.discount_value || 0}${offer.discount_type === 'percent' ? '% off' : ' off'}`}</div>
                {reason && <div className="text-[10px] font-black uppercase mt-1">{reason}</div>}
              </div>
              <button
                type="button"
                disabled={blocked}
                onClick={() => onToggle?.(String(offer.id))}
                className={`shrink-0 rounded-lg px-3 py-2 text-[10px] font-black uppercase flex items-center gap-1 ${
                  blocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : selected ? 'bg-sky-600 text-white' : 'bg-slate-900 text-white hover:bg-sky-600'
                }`}
                title={blocked ? reason || 'Not eligible' : selected ? 'Remove offer' : 'Apply offer'}
              >
                {blocked ? <Lock size={13} /> : selected ? <Check size={13} /> : <Tag size={13} />}
                {blocked ? reason || 'Unavailable' : selected ? 'Applied' : 'Apply'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
