import Link from "next/link";
import { Sparkles, Heart, Zap, Globe, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />

      {/* Nav */}
      <nav className="relative z-10 border-b border-zinc-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Blackspace</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-dark transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-xs font-medium text-accent-light mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Scholarship Matching
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          Opportunities Worth
          <br />
          <span className="text-gradient">Swipe Right</span> For
        </h1>

        <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
          Discover scholarships, jobs, internships, grants, and more — matched to
          your profile. Swipe, match, and apply with AI-generated content in
          seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-accent text-white rounded-xl font-semibold hover:bg-accent-dark transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
          >
            Start Matching Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-zinc-500">
            No credit card required &bull; 2-minute setup
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-16 pt-12 border-t border-zinc-800/50">
          {[
            { value: "50+", label: "Scholarships" },
            { value: "15+", label: "Countries" },
            { value: "30s", label: "Avg. Application" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 border-t border-zinc-800/50">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
          How It <span className="text-gradient">Works</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              icon: <Heart className="w-6 h-6" />,
              title: "Create Your Profile",
              description:
                "Tell us your field, level, goals, and preferred countries. Takes under 2 minutes.",
            },
            {
              step: "02",
              icon: <Zap className="w-6 h-6" />,
              title: "Swipe Through Matches",
              description:
                "See scholarships ranked by how well they match you. Swipe right to apply instantly.",
            },
            {
              step: "03",
              icon: <Sparkles className="w-6 h-6" />,
              title: "AI Writes Your Application",
              description:
                "Every right swipe triggers AI to generate your personal statement and motivation letter. Apply in one click.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent-light mb-4">
                {item.icon}
              </div>
              <div className="text-xs font-bold text-accent-light/50 mb-2">
                STEP {item.step}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 border-t border-zinc-800/50">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
          Why <span className="text-gradient">Blackspace?</span>
        </h2>

        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              title: "Instant AI Applications",
              description:
                "Every swipe right auto-generates a tailored personal statement and motivation letter using DeepSeek AI. No more blank-page anxiety.",
            },
            {
              title: "Real Scholarship Programs",
              description:
                "Chevening, DAAD, Fulbright, Erasmus Mundus, Mastercard Foundation — we track 50+ programs across 15 countries with live deadlines.",
            },
            {
              title: "Smart Matching",
              description:
                "Our algorithm scores scholarships by your field, level, and preferred countries. Higher match = higher chance of acceptance.",
            },
            {
              title: "Document Hub",
              description:
                "Upload your CV, transcript, and passport once. We keep them organized and ready for every application.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/30"
            >
              <CheckCircle2 className="w-5 h-5 text-accent-light flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trusted programs */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 border-t border-zinc-800/50 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Programs on <span className="text-gradient">Blackspace</span>
        </h2>
        <p className="text-zinc-500 mb-10 max-w-md mx-auto">
          We track scholarships from the world&apos;s most prestigious programs
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {[
            "Chevening",
            "DAAD",
            "Fulbright",
            "Erasmus Mundus",
            "Mastercard Foundation",
            "Rhodes",
            "Gates Cambridge",
            "MEXT",
            "KAIST",
          ].map((name) => (
            <span
              key={name}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-sm text-zinc-400"
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-br from-accent/20 via-accent-dark/10 to-blue-500/10 border border-accent/20">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to find your scholarship?
          </h2>
          <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
            Join students from 50+ countries who are swiping their way to
            funded education.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-white rounded-xl font-semibold hover:bg-accent-dark transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-5 h-5" />
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-zinc-500">Blackspace &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/login" className="hover:text-zinc-300 transition-colors">
              Sign In
            </Link>
            <Link href="/login" className="hover:text-zinc-300 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
