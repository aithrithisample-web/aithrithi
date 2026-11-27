"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  MessageSquare,
  Send,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Headphones,
  User,
  Building2,
  RefreshCw,
  X,
  FileText,
  AlertTriangle,
} from "lucide-react";

interface TicketMessage {
  id: string;
  senderType: "MERCHANT" | "ADMIN";
  senderName: string;
  message: string;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  customerName?: string;
  customerEmail?: string;
  orderNumber?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

const WHATSAPP_BUSINESS_NO = "919496590984";
const WHATSAPP_DISPLAY_NO = "+91 94965 90984";

function buildTicketWhatsAppLink(ticket: SupportTicket, customMsg?: string) {
  const lines = [
    `*AVRO Store Support Ticket*`,
    `*Ticket #:* ${ticket.ticketNumber}`,
    `*Subject:* ${ticket.subject}`,
    `*Category:* ${ticket.category}`,
    `*Priority:* ${ticket.priority}`,
    `*Status:* ${ticket.status}`,
    ticket.orderNumber ? `*Order #:* ${ticket.orderNumber}` : null,
    ticket.customerName ? `*Customer:* ${ticket.customerName} (${ticket.customerEmail || 'No email'})` : null,
    customMsg
      ? `*Update:* ${customMsg}`
      : (ticket.messages && ticket.messages.length > 0 ? `*Latest Note:* "${ticket.messages[ticket.messages.length - 1].message}"` : null),
    `\n_Connected to WhatsApp Business (${WHATSAPP_DISPLAY_NO})_`,
  ].filter(Boolean);

  return `https://wa.me/${WHATSAPP_BUSINESS_NO}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export default function StoreAdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [connectedToCentral, setConnectedToCentral] = useState(true);

  // New ticket form
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("PAYMENTS");
  const [newPriority, setNewPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [newMessage, setNewMessage] = useState("");
  const [sendToWhatsAppOnCreate, setSendToWhatsAppOnCreate] = useState(true);
  const [creating, setCreating] = useState(false);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/support");
      const data = await res.json();
      if (data.success && data.tickets) {
        setTickets(data.tickets);
        setConnectedToCentral(data.connectedToCentral ?? true);
        if (data.tickets.length > 0 && !activeTicket) {
          setActiveTicket(data.tickets[0]);
        } else if (activeTicket) {
          const updated = data.tickets.find((t: any) => t.id === activeTicket.id);
          if (updated) setActiveTicket(updated);
        }
      }
    } catch {
      showToast("Operating in local support queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    setSendingReply(true);
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REPLY",
          ticketId: activeTicket.id,
          message: replyText,
          senderName: "Store Owner",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyText("");
        loadTickets();
        showToast("Reply sent to Technext Central Support engineers.");
      }
    } catch {
      showToast("Failed to transmit reply.");
    } finally {
      setSendingReply(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newSubject,
          category: newCategory,
          priority: newPriority,
          message: newMessage,
          senderName: "Store Owner",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowNewModal(false);
        setNewSubject("");
        setNewMessage("");
        loadTickets();
        showToast("Support ticket dispatched & connected to WhatsApp Business.");
        if (sendToWhatsAppOnCreate && data.ticket) {
          window.open(buildTicketWhatsAppLink(data.ticket), "_blank");
        }
      }
    } catch {
      showToast("Failed to create ticket.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A192F] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/admin" className="hover:text-blue-600">Store Admin</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">Central Support</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <LifeBuoy className="w-7 h-7 text-blue-600" />
            <span>Technext Central Merchant Support</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Direct priority engineering assistance, payment gateway reconciliation, courier troubleshooting, and platform bug resolution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#0A192F] hover:bg-[#1E293B] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Open Support Ticket</span>
          </button>
        </div>
      </div>

      {/* Support & Contact Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Central Connectivity */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Central Node Link
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-sm font-black text-slate-900">Connected to Central</p>
          <span className="text-[11px] text-emerald-600 font-bold">Direct Support Route Active</span>
        </div>

        {/* WhatsApp & Phone Hotline */}
        <a
          href="https://wa.me/919496590984?text=Hi%20Technext%20Support%2C%20I%20need%20assistance%20with%20my%20AVRO%20store."
          target="_blank"
          rel="noreferrer"
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition space-y-1 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Priority Helpline & WhatsApp
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition" />
          </div>
          <p className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition">
            +91 94965 90984
          </p>
          <span className="text-[11px] text-slate-500">10:00 AM – 8:00 PM IST</span>
        </a>

        {/* Email Support */}
        <a
          href="mailto:info.technexttech@gmail.com?subject=AVRO%20Store%20Merchant%20Support%20Request"
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition space-y-1 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Email Desk
            </span>
            <Mail className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" />
          </div>
          <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition">
            info.technexttech@gmail.com
          </p>
          <span className="text-[11px] text-slate-500">Monitored Helpdesk Queue</span>
        </a>
      </div>

      {/* Quick WhatsApp Escalation Strip */}
      <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 flex-wrap">
              <span>Direct WhatsApp Business Escalation:</span>
              <span className="font-mono text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded font-extrabold">{WHATSAPP_DISPLAY_NO}</span>
            </h4>
            <p className="text-[11px] text-emerald-700">Instant connection to Technext engineering and merchant resolution desk.</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <a
            href={`https://wa.me/${WHATSAPP_BUSINESS_NO}?text=${encodeURIComponent("Hi Technext Support! I need priority assistance with Razorpay / Payment Gateways for my store.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/60 text-[11px] font-bold transition shadow-2xs"
          >
            💳 Payment Issue
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_BUSINESS_NO}?text=${encodeURIComponent("Hi Technext Support! I need priority assistance with Courier Pickup / Logistics dispatch for my store.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/60 text-[11px] font-bold transition shadow-2xs"
          >
            🚚 Courier Delay
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_BUSINESS_NO}?text=${encodeURIComponent("Hi Technext Support! I have a question regarding my AVRO Subscription License and Plan.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/60 text-[11px] font-bold transition shadow-2xs"
          >
            🔑 License & Plan
          </a>
        </div>
      </div>

      {/* Main Support Ticket Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs min-h-[550px] overflow-hidden">
        {/* Left Column: Tickets Queue */}
        <div className="lg:col-span-4 border-r border-slate-200/80 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Your Support Tickets ({tickets.length})
            </span>
            <button onClick={loadTickets} className="text-slate-400 hover:text-slate-700">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[260px] lg:max-h-[500px]">
            {loading && tickets.length === 0 ? (
              <div className="p-6 text-xs text-slate-400 text-center">Loading ticket queue...</div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <LifeBuoy className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700">No open tickets</p>
                <p className="text-[11px]">Click &quot;Open Support Ticket&quot; to speak with Technext Central engineers.</p>
              </div>
            ) : (
              tickets.map((t) => {
                const isSelected = activeTicket?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTicket(t)}
                    className={`w-full text-left p-4 transition-all block ${
                      isSelected
                        ? "bg-blue-50/70 border-l-4 border-l-blue-600"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        {t.ticketNumber}
                      </span>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[9px] font-black tracking-wider uppercase ${
                          t.status === "OPEN"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : t.status === "IN_PROGRESS"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.subject}</h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span className="font-semibold text-slate-600">{t.category}</span>
                      <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Ticket Conversation Thread */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          {activeTicket ? (
            <>
              {/* Ticket Top Meta */}
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-400">{activeTicket.ticketNumber}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-bold text-blue-600">{activeTicket.category}</span>
                    <span className="text-slate-300">•</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.2 rounded-full ${
                        activeTicket.priority === "CRITICAL"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : activeTicket.priority === "HIGH"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {activeTicket.priority} Priority
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mt-0.5">{activeTicket.subject}</h3>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <a
                    href={buildTicketWhatsAppLink(activeTicket)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95"
                    title={`Open Ticket on WhatsApp ${WHATSAPP_DISPLAY_NO}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Escalation ({WHATSAPP_DISPLAY_NO})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      activeTicket.status === "RESOLVED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {activeTicket.status}
                  </span>
                </div>
              </div>

              {/* Message Thread */}
              <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[380px] bg-slate-50/50">
                {activeTicket.messages?.map((msg, i) => {
                  const isCentralAdmin = msg.senderType === "ADMIN";
                  return (
                    <div
                      key={msg.id || i}
                      className={`flex gap-3 max-w-xl ${
                        isCentralAdmin ? "ml-auto flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          isCentralAdmin
                            ? "bg-[#0A192F] text-white"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {isCentralAdmin ? "TN" : "SO"}
                      </div>
                      <div
                        className={`rounded-2xl p-4 text-xs space-y-1 shadow-2xs ${
                          isCentralAdmin
                            ? "bg-white border border-slate-200 text-slate-800"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-between gap-4 text-[10px] ${
                            isCentralAdmin ? "text-slate-400" : "text-blue-100"
                          }`}
                        >
                          <span className="font-bold">{msg.senderName}</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200/80 bg-white space-y-3">
                <textarea
                  rows={2}
                  required
                  placeholder="Type your message or follow-up question for Technext Central engineers..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-slate-400">
                    Transmits directly to Central Admin & WhatsApp Business ({WHATSAPP_DISPLAY_NO})
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={buildTicketWhatsAppLink(activeTicket, replyText || "Following up on ticket updates")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs transition flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Send via WhatsApp</span>
                    </a>
                    <button
                      type="submit"
                      disabled={sendingReply || !replyText.trim()}
                      className="px-4 py-2 rounded-xl bg-[#0A192F] hover:bg-[#1E293B] text-white font-bold text-xs transition flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{sendingReply ? "Transmitting..." : "Send Reply"}</span>
                    </button>
                  </div>
                </div>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full p-8 text-center text-slate-400 text-xs">
              Select a ticket on the left to read conversation history or send a reply.
            </div>
          )}
        </div>
      </div>

      {/* Open Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Open Central Support Ticket</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct inquiry to Technext engineering, billing, and logistics experts.
                </p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Inquiry Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Ticket subject / issue summary"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issue Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="PAYMENTS">Payment Gateways / UPI</option>
                    <option value="SHIPPING">Shipping & Couriers</option>
                    <option value="BILLING">Billing & License Renewal</option>
                    <option value="CATALOG">Catalog & Products</option>
                    <option value="TECHNICAL">Technical Bug / Exception</option>
                    <option value="GENERAL">General Platform Question</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="LOW">Low (General Inquiry)</option>
                    <option value="MEDIUM">Medium (Standard Request)</option>
                    <option value="HIGH">High (Urgent Setup Help)</option>
                    <option value="CRITICAL">Critical (Checkout / Store Down)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Explanation</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your issue, steps to reproduce, or order number if applicable..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <input
                  type="checkbox"
                  id="whatsapp-dispatch"
                  checked={sendToWhatsAppOnCreate}
                  onChange={(e) => setSendToWhatsAppOnCreate(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="whatsapp-dispatch" className="text-xs text-emerald-950 font-medium cursor-pointer">
                  Directly dispatch & open ticket in WhatsApp Business (<strong className="text-emerald-700">{WHATSAPP_DISPLAY_NO}</strong>)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-[#0A192F] hover:bg-[#1E293B] text-white font-bold rounded-xl transition shadow-sm"
                >
                  {creating ? "Transmitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
