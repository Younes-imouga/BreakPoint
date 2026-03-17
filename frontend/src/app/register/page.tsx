import RegisterComponent from './RegisterComponent';

export default function RegisterPage() {

  return (
    <>
      <div className="bg-slate-950 text-slate-300 min-h-screen">
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
          <div className="absolute top-25 left-10 text-slate-500 text-xs flicker pointer-events-none">
            &gt; system.initializing...
          </div>
        <div className='flex items-center justify-center relative my-20'>

          <div className="scanline pointer-events-none"></div>

          <div className="absolute inset-0 opacity-5 bg-grid-pattern pointer-events-none"></div>

          <div className="absolute bottom-10 right-10 text-slate-500 text-xs flicker pointer-events-none">
            &gt; new user registration protocol...
          </div>

          <div className="relative z-10 w-full max-w-md">
            <div className="text-center mb-12">
              <div className="cyber-glow text-4xl font-bold tracking-[0.3em] mb-2 flicker">
                BREAK_POINT
              </div>
              <div className="text-slate-500 text-sm tracking-widest uppercase">
                &gt; Create New Operator Account
              </div>
            </div>

            {/* Registration Form */}
            <RegisterComponent />

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="text-xs text-slate-500">[EXISTING_USER?]</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            {/* Login Link */}
            <a
              href="/login"
              className="block w-full text-center bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 font-bold py-3 rounded uppercase tracking-widest text-sm transition-all duration-300"
            >
              &gt; Back_To_Login
            </a>

            {/* Footer Info */}
            <div className="mt-12 pt-8 border-t border-slate-800 text-center">
              <div className="text-xs text-slate-600 space-y-2">
                <div>
                  &gt; System Status: [ <span className="text-emerald-500">OPERATIONAL</span> ]
                </div>
                <div>&gt; Security Level: [ <span className="text-cyan-400">HIGH</span> ]</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
