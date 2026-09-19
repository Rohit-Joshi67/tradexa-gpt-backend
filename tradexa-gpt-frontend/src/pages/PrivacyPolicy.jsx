import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 p-8 pt-32">
      <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
        <Link to="/" className="font-bold text-xl text-white">T Tradexa GPT</Link>
      </nav>
      <div className="max-w-3xl mx-auto bg-neutral-900/50 p-8 rounded-3xl border border-white/10">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-sm leading-relaxed">
          <p>Last updated: September 2026</p>
          <h2 className="text-xl text-white font-semibold">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create or modify your account, request services, contact customer support, or otherwise communicate with us. This includes your name, email, and trading journal CSV files.</p>
          
          <h2 className="text-xl text-white font-semibold">2. Use of Information</h2>
          <p>We may use the information we collect to provide, maintain, and improve our services, including calculating your PNL and generating risk analysis via Tradexa-GPT.</p>
          
          <h2 className="text-xl text-white font-semibold">3. Data Security</h2>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access. All CSV files are processed securely.</p>
        </div>
      </div>
    </div>
  );
}

