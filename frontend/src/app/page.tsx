export default function Home() {
  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen relative overflow-hidden">

      <div className="scanline"></div>
      <div className="absolute inset-0 opacity-5 bg-grid-pattern"></div>
      <nav className="flex justify-between items-center px-10 py-6 border-b border-slate-900 relative z-10">
        <div className="text-cyan-400 font-bold tracking-widest">
          <a href="/">
            BREAK_POINT
          </a>
        </div>

        <div className="flex gap-6 text-sm text-slate-400">
          <a href="/register" className="hover:text-cyan-400 transition">Register</a>
          <a href="/login" className="hover:text-cyan-400 transition">Login</a>
        </div>
      </nav>

      <div className="absolute top-20 left-20 text-slate-800 text-xs font-mono">
        &gt; system.boot.sequence...
      </div>

      <div className="absolute bottom-20 right-20 text-slate-800 text-xs font-mono">
        &gt; security.protocols.active...
      </div>

      <section className="max-w-5xl mx-auto px-8 pt-32 text-center relative z-10">

        <h1 className="cyber-glow text-6xl font-bold tracking-[0.3em] mb-6 flicker">
          BREAK_POINT
        </h1>

        <p className="text-slate-400 text-xl tracking-widest uppercase mb-8">
          &gt; Security Testing Lab Platform
        </p>

        <p className="text-slate-400 text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
          Practice exploiting real web vulnerabilities in a safe sandboxed
          environment. Discover hidden Tokens, solve security challenges,
          and develop real offensive security skills.
        </p>

        <div className="flex gap-6 justify-center mb-20">
          <a
            href="/login"
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-4 px-8 rounded uppercase tracking-widest text-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50"
          >
            &gt; Access_Terminal
          </a>

          <a
            href="/register"
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 font-bold py-4 px-8 rounded uppercase tracking-widest text-sm transition-all duration-300"
          >
            &gt; Create_Account
          </a>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-8 py-24 text-center">

        <h2 className="text-cyan-400 text-2xl font-bold tracking-widest mb-6">
          &gt; WHAT_IS_BREAKPOINT
        </h2>

        <p className="text-slate-400 max-w-3xl mx-auto leading-relaxed">
          BreakPoint is an interactive cybersecurity training platform where
          users analyze intentionally vulnerable applications to discover
          hidden Tokens. Each lab simulates real-world security flaws such as
          XSS, CSRF, authentication bypass, and logic vulnerabilities in a
          fully sandboxed environment.
        </p>

      </section>

      <section className="max-w-6xl mx-auto px-8 py-20">

        <h2 className="text-cyan-400 text-2xl font-bold tracking-widest text-center mb-16">
          &gt; HOW_IT_WORKS
        </h2>

        <div className="grid md:grid-cols-4 gap-8 text-center">

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg">
            <div className="text-cyan-400 text-xl mb-3">1</div>
            <p className="text-sm text-slate-400">
              Enter a sandboxed vulnerable lab environment.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg">
            <div className="text-cyan-400 text-xl mb-3">2</div>
            <p className="text-sm text-slate-400">
              Analyze inputs, requests, and application logic.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg">
            <div className="text-cyan-400 text-xl mb-3">3</div>
            <p className="text-sm text-slate-400">
              Exploit the vulnerability to discover a hidden Token.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg">
            <div className="text-cyan-400 text-xl mb-3">4</div>
            <p className="text-sm text-slate-400">
              Submit the Token and earn points for completion.
            </p>
          </div>

        </div>
      </section>

      <section className="max-w-6xl mx-auto px-8 py-24">

        <h2 className="text-cyan-400 text-2xl font-bold tracking-widest text-center mb-16">
          &gt; LAB_CATEGORIES
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg hover:border-cyan-400 transition">
            <h3 className="text-white font-bold mb-2">Cross-Site Scripting</h3>
            <p className="text-slate-500 text-sm">
              Inject malicious scripts and exploit unsafe input handling.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg hover:border-cyan-400 transition">
            <h3 className="text-white font-bold mb-2">CSRF Attacks</h3>
            <p className="text-slate-500 text-sm">
              Exploit authenticated sessions through forged requests.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg hover:border-cyan-400 transition">
            <h3 className="text-white font-bold mb-2">Logic Flaws</h3>
            <p className="text-slate-500 text-sm">
              Discover unexpected weaknesses in application logic.
            </p>
          </div>

        </div>
      </section>

      <section className="max-w-5xl mx-auto px-8 py-24 text-center">

        <h2 className="text-cyan-400 text-2xl font-bold tracking-widest mb-6">
          &gt; TRACK_PROGRESS
        </h2>

        <p className="text-slate-400 max-w-2xl mx-auto mb-12">
          Earn points, unlock achievements, and compete with other security
          enthusiasts on the leaderboard as you progress through increasingly
          challenging labs.
        </p>

        <div className="flex justify-center gap-12 text-sm text-slate-500">

          <div>XP Rewards</div>
          <div>Achievements</div>
          <div>Leaderboards</div>
          <div>Lab History</div>

        </div>

      </section>

      <section className="text-center py-24">

        <h2 className="text-white text-2xl font-bold mb-6">
          Ready to test your security skills?
        </h2>

        <a
          href="/register"
          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-4 px-10 rounded uppercase tracking-widest text-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50"
        >
          &gt; Start_Hacking
        </a>

      </section>

      <footer className="border-t border-slate-800 py-10 text-center text-xs text-slate-600">

        <div className="mb-2">
          BreakPoint © {new Date().getFullYear()}
        </div>

        <div>
          Security Testing Lab Platform
        </div>

      </footer>

    </div>
  );
}