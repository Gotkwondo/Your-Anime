'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FadeIn } from '@/components/ui/FadeIn';
import { StaggerChildren, staggerItem } from '@/components/ui/StaggerChildren';

/* ── Navbar ───────────────────────────────────────────────── */
function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(4,5,14,0.85)', backdropFilter: 'blur(20px)' }}
      />
      <div className="relative max-w-[1146px] mx-auto px-6 h-16 flex items-center justify-between">
        <span className="text-lg font-bold text-white">AnimeSommelier</span>
        <nav className="hidden md:flex items-center gap-8 text-sm text-[#cecfd1]">
          <Link href="/discover" className="hover:text-white transition-colors">Discover</Link>
          <Link href="/chat/select" className="hover:text-white transition-colors">Chat</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-[#cecfd1] hover:text-white transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold px-4 py-2 rounded-[5px] transition-all"
            style={{
              background: '#03f7b5',
              color: '#04050e',
              boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
            }}
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

/* ── Hero ─────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background orbs */}
      <div
        className="bg-orb w-[600px] h-[600px] top-[-100px] left-1/2 -translate-x-1/2"
        style={{ background: 'rgba(3,247,181,0.06)' }}
      />
      <div
        className="bg-orb w-[400px] h-[400px] bottom-[-50px] right-[10%]"
        style={{ background: 'rgba(0,125,252,0.07)' }}
      />

      <div className="relative z-10 max-w-[860px] mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{
            background: 'rgba(3,247,181,0.1)',
            border: '1px solid rgba(3,247,181,0.25)',
            color: '#03f7b5',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#03f7b5]" />
          We are launching our new form now
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
        >
          Build Your AI Anime
          <br />
          <span className="gradient-text">Discovery Agent</span>
          <br />
          Without Code
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-lg text-[#85868b] max-w-xl mx-auto mb-10"
        >
          Build AI anime companions in minutes to automate discovery, save time, and grow your
          personal watchlist.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-[5px] text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{
              background: '#03f7b5',
              color: '#04050e',
              boxShadow: '0 10px 30px rgba(3,247,181,0.25)',
            }}
          >
            Start Your Free Trial
          </Link>
          <Link
            href="/chat/select"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-[5px] text-sm font-semibold transition-all hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#cecfd1' }}
          >
            Book a Demo
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Dashboard Preview ────────────────────────────────────── */
function DashboardPreviewSection() {
  const items = [
    { title: 'Billing Issue', sub: 'Source: Website', dot: 'bg-red-500' },
    { title: 'Sales Agent', sub: 'High priority question...', dot: 'bg-yellow-500' },
    { title: 'Persona Agent', sub: 'Needs further analysis', dot: 'bg-blue-400' },
    { title: 'Subscription plan', sub: 'Can you explain...', dot: 'bg-[#03f7b5]' },
    { title: 'Customer Billing', sub: 'Recent billing issue...', dot: 'bg-purple-400' },
    { title: 'Working Issues', sub: 'High-priority task...', dot: 'bg-red-400' },
    { title: 'Maintenance', sub: 'It may be a good idea to...', dot: 'bg-gray-400' },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      <div
        className="bg-orb w-[500px] h-[500px] top-[50%] left-[-100px]"
        style={{ background: 'rgba(3,247,181,0.04)' }}
      />

      <FadeIn className="max-w-[1146px] mx-auto px-6">
        <p className="text-center text-sm text-[#85868b] mb-16 tracking-wider uppercase">
          We working with more than 100+ Companies
        </p>

        {/* Mock Dashboard UI */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Top bar */}
          <div
            className="flex items-center px-5 py-3 gap-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
          >
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-3 text-xs text-[#85868b]">Dashboard — AnimeSommelier</span>
          </div>

          {/* Content */}
          <div className="flex" style={{ background: '#060710', minHeight: 380 }}>
            {/* Sidebar */}
            <div
              className="w-48 flex-shrink-0 p-4 flex flex-col gap-1"
              style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}
            >
              {['Dashboard', 'Chat Logs', 'Leads', 'Topics', 'Sentiments'].map((item, i) => (
                <div
                  key={item}
                  className={`px-3 py-2 rounded-[6px] text-xs cursor-pointer transition-colors ${
                    i === 0
                      ? 'text-white'
                      : 'text-[#85868b] hover:text-white'
                  }`}
                  style={i === 0 ? { background: 'rgba(255,255,255,0.06)' } : {}}
                >
                  {item}
                </div>
              ))}
              {/* Upgrade banner */}
              <div
                className="mt-auto p-3 rounded-[8px] text-[10px] text-[#85868b]"
                style={{ background: 'rgba(3,247,181,0.07)', border: '1px solid rgba(3,247,181,0.15)' }}
              >
                Upgrade to premium for Advanced AI features
              </div>
            </div>

            {/* Main list */}
            <div
              className="flex-1 p-4"
              style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-white">Chat Logs</span>
                <span className="text-xs text-[#85868b]">Source: Website</span>
              </div>
              <div className="space-y-1">
                {items.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 * i, duration: 0.4 }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[6px] cursor-pointer ${
                      i === 3 ? 'text-white' : 'text-[#85868b] hover:text-white'
                    }`}
                    style={i === 3 ? { background: 'rgba(3,247,181,0.08)' } : {}}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.dot}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{item.title}</div>
                      <div className="text-[10px] text-[#85868b] truncate">{item.sub}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Chat preview */}
            <div className="flex-1 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-white">AI Anime Chat</span>
                <div className="flex gap-2 text-[10px] text-[#85868b]">
                  <span>Refresh</span>
                  <span>Rewatch</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex justify-end">
                  <div
                    className="px-3 py-2 rounded-[8px] text-xs max-w-[70%] text-white"
                    style={{ background: 'rgba(3,247,181,0.15)' }}
                  >
                    Can you recommend a mecha anime?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div
                    className="px-3 py-2 rounded-[8px] text-xs max-w-[75%] text-[#cecfd1]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    According to our records & episodes, I would like to find that you entered this
                    weekend successfully and more.
                  </div>
                </div>
                <div className="flex justify-end">
                  <div
                    className="px-3 py-2 rounded-[8px] text-xs max-w-[70%] text-white"
                    style={{ background: 'rgba(3,247,181,0.15)' }}
                  >
                    What about slice of life?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div
                    className="px-3 py-2 rounded-[8px] text-xs max-w-[75%] text-[#cecfd1]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    I'm sorry for being late to respond! I have flagged this to our anime sommelier
                    team.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

/* ── Partners / Logos ─────────────────────────────────────── */
function PartnersSection() {
  const partners = ['Crunchyroll', 'Netflix', 'Funimation', 'AnimeLab', 'HIDIVE', 'Animepahe'];

  return (
    <FadeIn>
      <section className="py-16" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-[1146px] mx-auto px-6">
          <p className="text-center text-xs text-[#85868b] mb-10 tracking-widest uppercase">
            Trusted by anime fans worldwide
          </p>
          <StaggerChildren className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {partners.map((name) => (
              <motion.div
                key={name}
                variants={staggerItem}
                className="text-[#85868b] text-sm font-semibold hover:text-[#cecfd1] transition-colors cursor-default"
              >
                {name}
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>
    </FadeIn>
  );
}

/* ── Features ─────────────────────────────────────────────── */
function FeaturesSection() {
  const features = [
    {
      icon: '🤖',
      label: 'Support Agent',
      title: 'AI Sommelier',
      desc: 'Chat with specialized AI personas to find anime that matches your mood and preferences perfectly.',
    },
    {
      icon: '✨',
      label: 'Sales Agent',
      title: 'Smart Recommendations',
      desc: 'Get personalized suggestions based on your taste, viewing history, and genre preferences.',
    },
    {
      icon: '💬',
      label: 'Customer Support',
      title: 'Natural Conversation',
      desc: 'Describe what you\'re looking for in plain language and let our AI do the rest.',
    },
    {
      icon: '📊',
      label: 'Customer Success',
      title: 'Track Your Journey',
      desc: 'Keep a history of your conversations and watchlist to revisit recommendations anytime.',
    },
    {
      icon: '🔍',
      label: 'AI Chatbot',
      title: 'Deep Discovery',
      desc: 'Explore beyond the mainstream with niche genre detection and hidden gem suggestions.',
    },
  ];

  return (
    <section className="py-28" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="max-w-[1146px] mx-auto px-6">
        <FadeIn className="text-center mb-20">
          <p className="text-[#03f7b5] text-sm font-semibold mb-4 tracking-wider uppercase">About Us</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight max-w-2xl mx-auto">
            Founded by a team of engineers, anime fans, and AI researchers
          </h2>
          <p className="text-[#85868b] mt-6 max-w-xl mx-auto">
            We saw the growing gap between what fans expect and what discovery tools can deliver.
            We created AnimeSommelier to bridge that gap — fast, scalable, and deeply human in experience.
          </p>
          <Link
            href="/discover"
            className="inline-flex items-center justify-center mt-8 px-6 py-3 rounded-[5px] text-sm font-semibold transition-all hover:opacity-90"
            style={{
              background: 'rgba(3,247,181,0.12)',
              border: '1px solid rgba(3,247,181,0.3)',
              color: '#03f7b5',
            }}
          >
            Know More About Us
          </Link>
        </FadeIn>

        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={staggerItem}
              className="card-dark p-7 transition-all duration-300 cursor-default"
            >
              <div
                className="w-11 h-11 rounded-[8px] flex items-center justify-center text-xl mb-5"
                style={{ background: 'rgba(3,247,181,0.08)', border: '1px solid rgba(3,247,181,0.15)' }}
              >
                {f.icon}
              </div>
              <span
                className="text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded"
                style={{ background: 'rgba(3,247,181,0.08)', color: '#03f7b5' }}
              >
                {f.label}
              </span>
              <h3 className="text-white font-bold text-lg mt-3 mb-2">{f.title}</h3>
              <p className="text-sm text-[#85868b] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
          {/* CTA card */}
          <motion.div
            variants={staggerItem}
            className="card-dark p-7 flex flex-col justify-center items-center text-center"
            style={{ background: 'rgba(3,247,181,0.04)', borderColor: 'rgba(3,247,181,0.15)' }}
          >
            <p className="text-sm text-[#85868b] mb-4">Ready to discover your next favourite anime?</p>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-[5px] text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: '#03f7b5', color: '#04050e' }}
            >
              Get Started Free
            </Link>
          </motion.div>
        </StaggerChildren>

        {/* Tag pills */}
        <FadeIn delay={0.2} className="flex flex-wrap gap-4 justify-center mt-14">
          {['Support Agent', 'Sales Agent', 'Customer Support', 'Customer Success', 'AI Chatbot'].map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs text-[#85868b]"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#03f7b5]" />
              {tag}
            </span>
          ))}
        </FadeIn>
      </div>
    </section>
  );
}

/* ── CTA Banner ───────────────────────────────────────────── */
function CTASection() {
  return (
    <FadeIn>
      <section className="py-28" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-[860px] mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Start discovering anime
            <br />
            <span className="gradient-text">powered by AI</span>
          </h2>
          <p className="text-[#85868b] mb-10 max-w-lg mx-auto">
            Join thousands of anime fans using AnimeSommelier to find their next obsession.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 rounded-[5px] text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: '#03f7b5', color: '#04050e', boxShadow: '0 10px 30px rgba(3,247,181,0.2)' }}
            >
              Start Free Trial
            </Link>
            <Link
              href="/chat/select"
              className="inline-flex items-center justify-center px-8 py-4 rounded-[5px] text-sm font-semibold transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#cecfd1' }}
            >
              Try the Chat
            </Link>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

/* ── Footer ───────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="max-w-[1146px] mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-sm font-bold text-white">AnimeSommelier</span>
        <p className="text-xs text-[#85868b]">© 2025 AnimeSommelier. All rights reserved.</p>
        <div className="flex gap-6 text-xs text-[#85868b]">
          <Link href="/login" className="hover:text-white transition-colors">Login</Link>
          <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          <Link href="/discover" className="hover:text-white transition-colors">Discover</Link>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#04050e' }}>
      <Navbar />
      <HeroSection />
      <DashboardPreviewSection />
      <PartnersSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
