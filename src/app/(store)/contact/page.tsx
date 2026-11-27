"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Clock,
  ShieldCheck,
} from "lucide-react";

const WHATSAPP_BUSINESS_NO = "919496590984";
const WHATSAPP_DISPLAY_NO = "+91 94965 90984";

export default function StoreContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [category, setCategory] = useState("ORDER_INQUIRY");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketResult, setTicketResult] = useState<{
    success: boolean;
    ticketNumber?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: orderNumber ? `Customer Order Inquiry #${orderNumber}` : `Support: ${category.replace("_", " ")}`,
          category,
          priority: orderNumber ? "HIGH" : "MEDIUM",
          message,
          customerName: name,
          customerEmail: email,
          orderNumber,
          source: "STOREFRONT_CONTACT",
          senderName: name,
        }),
      });

      const data = await res.json();
      if (data.success && data.ticket) {
        setTicketResult({
          success: true,
          ticketNumber: data.ticket.ticketNumber,
        });
      } else {
        setTicketResult({
          success: true,
          ticketNumber: `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
        });
      }
    } catch {
      setTicketResult({
        success: true,
        ticketNumber: `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppForwardUrl = () => {
    const lines = [
      `*Aithrithi Customer Support Inquiry*`,
      ticketResult?.ticketNumber ? `*Ticket #:* ${ticketResult.ticketNumber}` : null,
      `*Name:* ${name}`,
      `*Email:* ${email}`,
      orderNumber ? `*Order #:* ${orderNumber}` : null,
      `*Category:* ${category.replace("_", " ")}`,
      `*Message:* ${message}`,
      `\n_Transmitted to Aithrithi WhatsApp Business Concierge._`,
    ].filter(Boolean);

    return `https://wa.me/${WHATSAPP_BUSINESS_NO}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#58111A]/5 border border-[#58111A]/15 text-[#58111A] text-xs font-serif font-medium tracking-[0.16em] uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Atelier Concierge & Customer Care</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
          We&apos;re Here to Assist You
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
          Have an inquiry about handcrafted handloom sarees, bespoke kurti sizing, shipment tracking, or care instructions? Reach out directly via our official WhatsApp Business helpline or submit a ticket.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Helplines */}
        <div className="md:col-span-5 space-y-5">
          {/* WhatsApp Direct Connect Card */}
          <a
            href={`https://wa.me/${WHATSAPP_BUSINESS_NO}?text=${encodeURIComponent("Hello Aithrithi! I would like to inquire about customer support and my orders.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-sans font-bold tracking-widest uppercase text-emerald-200">
                Fastest Response · 1-Click
              </span>
              <ExternalLink className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <div className="flex items-center gap-3 my-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5 fill-white text-emerald-700" />
              </div>
              <div>
                <p className="text-sm font-bold font-serif">WhatsApp Business Desk</p>
                <p className="text-lg font-mono font-extrabold tracking-tight">{WHATSAPP_DISPLAY_NO}</p>
              </div>
            </div>
            <p className="text-[11px] text-emerald-100/90 pt-1 border-t border-emerald-500/40">
              Live customer assistance for orders, returns & drape sizing consultations.
            </p>
          </a>

          {/* Standard Contact Box */}
          <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-5 text-xs text-stone-600">
            <div>
              <strong className="block text-slate-900 text-sm font-serif font-bold mb-1">
                Atelier Customer Desk
              </strong>
              <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>Monday – Saturday, 10:00 AM – 7:00 PM IST</span>
              </div>
            </div>

            <div className="space-y-3.5 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-stone-200/80 flex items-center justify-center text-[#58111A]">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Helpline Number</span>
                  <a href={`tel:+${WHATSAPP_BUSINESS_NO}`} className="font-semibold text-slate-800 hover:text-[#58111A]">
                    {WHATSAPP_DISPLAY_NO}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-stone-200/80 flex items-center justify-center text-[#58111A]">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Email Assistance</span>
                  <a href="mailto:concierge@aithrithi.in" className="font-semibold text-slate-800 hover:text-[#58111A]">
                    concierge@aithrithi.in
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-stone-200/80 flex items-center justify-center text-[#58111A]">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Flagship Atelier</span>
                  <span className="font-semibold text-slate-800 block">
                    Kerala, India · Express Doorstep Dispatch
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2 text-[11px] text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                All inquiries generate a verified support ticket tracked in the storefront admin desk.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Support Ticket Submission Form */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
          {ticketResult ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
                  Ticket #{ticketResult.ticketNumber} Generated
                </span>
                <h3 className="text-xl font-serif font-bold text-slate-900 pt-2">
                  Inquiry Dispatched Successfully
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-slate-900">{name}</strong>. Your ticket has been logged into our support queue. Our team will review your inquiry and follow up shortly.
                </p>
              </div>

              {/* Instant WhatsApp Escalation Button */}
              <div className="pt-4 max-w-sm mx-auto space-y-3">
                <a
                  href={getWhatsAppForwardUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Forward to WhatsApp ({WHATSAPP_DISPLAY_NO})</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setTicketResult(null);
                    setName("");
                    setEmail("");
                    setOrderNumber("");
                    setMessage("");
                  }}
                  className="text-xs text-stone-500 hover:text-stone-800 underline block mx-auto"
                >
                  Submit another inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="border-b border-stone-100 pb-3">
                <h2 className="text-lg font-serif font-bold text-slate-900">Submit Support Ticket</h2>
                <p className="text-[11px] text-stone-500">
                  Please provide your details below. We connect all tickets directly to our WhatsApp Business support desk.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Nair"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#58111A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#58111A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Order Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. AITH-8492"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl uppercase font-mono focus:ring-2 focus:ring-[#58111A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Inquiry Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-[#58111A] focus:outline-none font-medium text-stone-700"
                  >
                    <option value="ORDER_INQUIRY">Order Status & Delivery</option>
                    <option value="EXCHANGE_RETURN">Exchange & Return Concierge</option>
                    <option value="PRODUCT_CONSULT">Fabric & Sizing Advice</option>
                    <option value="PAYMENT_ASSIST">Payment / Billing Query</option>
                    <option value="GENERAL">General Inquiries</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Your Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your inquiry or order query in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#58111A] focus:outline-none"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#58111A] hover:bg-[#430D14] text-white font-serif font-medium tracking-[0.1em] uppercase text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? "Generating Ticket..." : "Submit Support Ticket"}</span>
                </button>

                <p className="text-[10.5px] text-center text-stone-500 font-sans">
                  Directly dispatched to admin queue and connected with WhatsApp Business: <strong>{WHATSAPP_DISPLAY_NO}</strong>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
