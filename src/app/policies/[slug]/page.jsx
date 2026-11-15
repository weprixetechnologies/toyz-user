'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, Clock, Calendar, Printer, Share2, ArrowLeft,
  CheckCircle2, FileText, ChevronRight, HelpCircle, Mail, Phone,
  Sparkles, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

const POLICY_TYPE_LABELS = {
  privacy: 'Privacy & Data Protection',
  refund: 'Returns & Refund Terms',
  terms: 'Terms of Service',
  shipping: 'Shipping & Delivery',
  cookie: 'Cookie & Tracking Policy',
  custom: 'Legal Document'
};

export default function PolicyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const [policy, setPolicy] = useState(null);
  const [allPolicies, setAllPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('');

  // Fetch current policy and all policies for sidebar/footer navigation
  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [policyRes, listRes] = await Promise.all([
          api.get(`/policies/${slug}`),
          api.get('/policies')
        ]);

        if (isMounted) {
          if (policyRes.success && policyRes.data) {
            setPolicy(policyRes.data);
          } else {
            setError('Policy document not found.');
          }

          if (listRes.success && Array.isArray(listRes.data)) {
            setAllPolicies(listRes.data);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading policy:', err);
          setError(err.message || 'Unable to load policy. Please try again later.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Parse Headings from Policy HTML to build dynamic Table of Contents
  const tableOfContents = useMemo(() => {
    if (!policy?.content) return [];
    if (typeof window === 'undefined') return [];

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(policy.content, 'text/html');
      const headings = doc.querySelectorAll('h2, h3');
      const items = [];

      headings.forEach((h, index) => {
        const text = h.textContent?.trim() || `Section ${index + 1}`;
        const id = 'section-' + (index + 1) + '-' + text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').slice(0, 30);
        items.push({
          id,
          text,
          level: h.tagName.toLowerCase() === 'h3' ? 3 : 2
        });
      });

      return items;
    } catch (_) {
      return [];
    }
  }, [policy?.content]);

  // Inject IDs into HTML content for scroll targets
  const processedContent = useMemo(() => {
    if (!policy?.content) return '';
    if (typeof window === 'undefined') return policy.content;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(policy.content, 'text/html');
      const headings = doc.querySelectorAll('h2, h3');

      headings.forEach((h, index) => {
        const text = h.textContent?.trim() || `Section ${index + 1}`;
        const id = 'section-' + (index + 1) + '-' + text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').slice(0, 30);
        h.setAttribute('id', id);
        h.classList.add('scroll-mt-24');
      });

      return doc.body.innerHTML;
    } catch (_) {
      return policy.content;
    }
  }, [policy?.content]);

  // Reading time and word count
  const readingStats = useMemo(() => {
    if (!policy?.content) return { words: 0, time: '1 min read' };
    const text = policy.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return {
      words,
      time: `${minutes} min read`
    };
  }, [policy?.content]);

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  // Handle Share
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // Scroll to section
  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-[#F51F2D] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 mt-4">Loading legal policy...</p>
      </div>
    );
  }

  if (error || !policy) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="inline-flex p-4 bg-rose-50 text-rose-600 rounded-2xl">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Policy Document Not Found</h1>
        <p className="text-sm text-slate-600">
          The legal policy you are looking for may have been updated, moved, or is temporarily unavailable.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F51F2D] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#d91926] transition"
          >
            <ArrowLeft size={14} />
            <span>Return to Store Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition">
              Home
            </Link>
            <ChevronRight size={12} className="text-slate-400" />
            <Link href="/policies" className="hover:text-slate-900 transition">
              Legal Policies
            </Link>
            <ChevronRight size={12} className="text-slate-400" />
            <span className="font-semibold text-slate-900 truncate">
              {policy.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F51F2D]/10 text-[#F51F2D]">
                  <Shield size={13} />
                  <span>{POLICY_TYPE_LABELS[policy.type] || 'Legal Document'}</span>
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Version {policy.version || '1.0'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
                {policy.title}
              </h1>

              {policy.summary && (
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  {policy.summary}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Effective Date: </span>
                  <strong className="text-slate-700">
                    {policy.effective_date ? new Date(policy.effective_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Immediate'}
                  </strong>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  <span>{readingStats.time}</span>
                </div>
              </div>
            </div>

            {/* Print & Share Controls */}
            <div className="flex items-center gap-2 print:hidden self-start md:self-end">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                title="Print this document"
              >
                <Printer size={14} />
                <span>Print Document</span>
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                title="Copy link"
              >
                <Share2 size={14} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Table of Contents Sticky Sidebar */}
          {tableOfContents.length > 0 && (
            <aside className="lg:col-span-4 hidden lg:block sticky top-24 print:hidden">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <FileText size={16} className="text-[#F51F2D]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Table of Contents
                  </h3>
                </div>

                <nav className="space-y-1">
                  {tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs transition leading-snug block ${
                        item.level === 3 ? 'pl-6 text-[11px]' : ''
                      } ${
                        activeSection === item.id
                          ? 'bg-[#F51F2D]/10 text-[#F51F2D] font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      {item.text}
                    </button>
                  ))}
                </nav>

                {/* Other Policies Nav */}
                {allPolicies.length > 1 && (
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Other Store Policies
                    </span>
                    <div className="space-y-1">
                      {allPolicies
                        .filter(p => p.slug !== slug)
                        .map(p => (
                          <Link
                            key={p.id}
                            href={`/policies/${p.slug}`}
                            className="block text-xs text-slate-600 hover:text-[#F51F2D] hover:underline py-1 truncate"
                          >
                            • {p.title}
                          </Link>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* Center Policy Document Body */}
          <main className={`${tableOfContents.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm`}>
            {/* Rich Text Render Canvas */}
            <article
              className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed
                [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-slate-100 [&_h2]:font-heading
                [&_h3]:text-base sm:[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-heading
                [&_p]:mb-4 [&_p]:leading-relaxed
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1
                [&_li]:text-slate-700
                [&_strong]:font-bold [&_strong]:text-slate-900
                [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800
                [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:border [&_table]:border-slate-200
                [&_th]:bg-slate-50 [&_th]:p-3 [&_th]:text-left [&_th]:font-semibold [&_th]:border [&_th]:border-slate-200 [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider
                [&_td]:p-3 [&_td]:border [&_td]:border-slate-200 [&_td]:text-xs sm:[&_td]:text-sm
                [&_.callout]:my-6 [&_.callout]:p-4 [&_.callout]:rounded-xl [&_.callout]:border-l-4
                [&_.callout-info]:bg-sky-50 [&_.callout-info]:border-sky-500
                [&_.callout-warning]:bg-amber-50 [&_.callout-warning]:border-amber-500
                [&_.callout-success]:bg-emerald-50 [&_.callout-success]:border-emerald-500"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            {/* Reassurance & Support Card */}
            <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle size={16} className="text-[#F51F2D]" />
                  <span>Have questions regarding our {policy.title}?</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Our customer support team is available Monday through Saturday to answer any questions or clarify terms.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/contact"
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-sm transition"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
