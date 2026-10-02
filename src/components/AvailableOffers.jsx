'use client';

import { useState } from 'react';
import { Check, Lock, Tag, X } from 'lucide-react';

export default function AvailableOffers({ offers = [], selectedIds = [], onToggle, isRetailer = false }) {
  const [open, setOpen] = useState(false);
  if (!offers.length) return null;
  const appliedCount = offers.filter(offer => selectedIds.includes(String(offer.id)) && offer.applied !== false).length;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="w-full bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 rounded-2xl p-4 flex items-center justify-between text-left hover:border-pink-300 transition">
        <span className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center"><Tag size={20} /></span>
          <span><span className="block font-black text-gray-900">AVAILABLE OFFERS</span><span className="block text-xs text-gray-500">View eligible offers and apply one</span></span>
        </span>
        <span className="text-xs font-black text-pink-600">{appliedCount ? `${appliedCount} APPLIED` : 'VIEW ALL'}</span>
      </button>

      {open && <div className="fixed inset-0 z-[100] bg-slate-950/50 p-4 flex items-center justify-center" onClick={() => setOpen(false)}>
        <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-5 space-y-4" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div><h3 className="font-black text-gray-900 text-lg">AVAILABLE OFFERS</h3><p className="text-xs text-gray-500">Choose an offer to apply to this order.</p></div>
            <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="Close offers"><X size={18} /></button>
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
        </div>
      </div>}
    </>
  );
}
