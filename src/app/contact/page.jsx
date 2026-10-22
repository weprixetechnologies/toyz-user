import LeadCaptureForm from '../../components/LeadCaptureForm';
import { Phone, Mail, MapPin, Clock, ShieldCheck, Truck, Headphones, MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Contact Us | Customer Care & Bulk Inquiries',
  description: 'Get in touch with our team for product inquiries, wholesale orders, and customer support.'
};

export default function ContactPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="px-3 py-1 bg-sky-50 text-sky-700 border border-sky-100 rounded-full text-xs font-bold uppercase tracking-wider">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-serif">
            We'd Love to Hear From You
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Have a question about our toys, bulk orders, shipping, or need assistance? Fill out the inquiry form below or reach us via direct channels.
          </p>
        </div>

        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Phone */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4 hover:shadow transition">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Phone size={20} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Call Us</h2>
              <a href="tel:+919876543210" className="text-sm font-bold text-slate-900 hover:text-sky-600 transition block mt-0.5">
                +91 98765 43210
              </a>
              <p className="text-[11px] text-slate-500 mt-0.5">Mon–Sat, 9am to 7pm</p>
            </div>
          </div>

          {/* Email */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4 hover:shadow transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Us</h2>
              <a href="mailto:support@toyworld.com" className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition block mt-0.5">
                support@toyworld.com
              </a>
              <p className="text-[11px] text-slate-500 mt-0.5">Replies within 2 hours</p>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4 hover:shadow transition">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Headquarters</h2>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                Bandra West, Mumbai
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Maharashtra 400050</p>
            </div>
          </div>

          {/* Support Hours */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4 hover:shadow transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Working Hours</h2>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                9:30 AM – 6:30 PM
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Sunday Closed</p>
            </div>
          </div>
        </div>

        {/* Form & FAQ Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Info & FAQ (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 font-serif">
                Why Inquire With Us?
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Whether you are a parent looking for the perfect educational toy, or a retailer needing MOQ price breaks on wholesale cases, our support desk handles your inquiries with priority.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 mt-0.5">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">100% Genuine Toys</h3>
                    <p className="text-[11px] text-slate-500">Certified safe materials with manufacturer warranties.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 mt-0.5">
                    <Truck size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Fast Pan-India Delivery</h3>
                    <p className="text-[11px] text-slate-500">Express dispatch within 24-48 business hours.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 mt-0.5">
                    <Headphones size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Dedicated Support</h3>
                    <p className="text-[11px] text-slate-500">Call, WhatsApp, or instant chatbot assistance anytime.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Note */}
            <div className="bg-gradient-to-r from-sky-600 to-indigo-600 p-6 rounded-3xl text-white space-y-2 shadow-md">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-200">
                Wholesale Buyers
              </span>
              <h2 className="text-base font-bold">
                Looking for Wholesale Pricing?
              </h2>
              <p className="text-xs text-white/90 leading-relaxed">
                Mention your GSTIN and target quantities in the inquiry form to receive our B2B catalog and bulk rate sheet.
              </p>
            </div>
          </div>

          {/* Right: Same Lead Capture Form Component (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                Send Us a Message
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please provide your contact details and message. We will respond promptly.
              </p>
            </div>

            <LeadCaptureForm
              source="contact_page"
              compact={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
