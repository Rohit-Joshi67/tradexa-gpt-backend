import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  function onSubmit(event) {
    event.preventDefault();
    const subject = encodeURIComponent(`Tradexa GPT contact — ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:support@tradexagpt.com?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 p-8 pt-32">
      <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
        <Link to="/" className="font-bold text-xl text-white">T Tradexa GPT</Link>
      </nav>
      <div className="max-w-2xl mx-auto bg-neutral-900/50 p-8 rounded-3xl border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-8 h-8 text-indigo-400" />
          <h1 className="text-4xl font-bold text-white">Contact Us</h1>
        </div>
        <p className="text-sm mb-8">Questions about billing, your journal, or the copilot? Send us a message — we usually reply within 2 business days.</p>
        {sent ? (
          <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm">
            Your email client should have opened with your message addressed to support@tradexagpt.com. We&apos;ll get back to you shortly.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="text"
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 rounded-xl bg-neutral-950 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-indigo-500"
            />
            <input
              type="email"
              required
              placeholder="Your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-3 rounded-xl bg-neutral-950 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-indigo-500"
            />
            <textarea
              required
              rows={6}
              placeholder="How can we help?"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full p-3 rounded-xl bg-neutral-950 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-600 transition-colors"
            >
              <Send className="w-4 h-4" /> Send message
            </button>
          </form>
        )}
        <p className="text-xs text-neutral-500 mt-8">
          Prefer email directly? Write to <span className="text-neutral-300">support@tradexagpt.com</span>. Please don&apos;t share passwords or payment details over email.
        </p>
      </div>
    </div>
  );
}
