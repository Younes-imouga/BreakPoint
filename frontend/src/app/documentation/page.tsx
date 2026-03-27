'use client';

import UserSidebar from '@/components/UserSidebar';

export default function DocumentationPage() {
  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen flex">
      <UserSidebar />

      <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-0.5 bg-cyan-400/10"></div>

        <header className="p-8 border-b border-slate-800 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-white">Documentation.sys</h2>
          <p className="text-sm text-slate-500 italic">
            How to use BreakPoint from the website interface.
          </p>
        </header>

        <div className="p-8 space-y-8">
          <section className="rounded border border-slate-800 bg-slate-900/40 p-5">
            <h3 className="text-cyan-300 font-bold uppercase text-sm mb-3">1. Getting Started</h3>
            <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
              <li>Create an account from the Register page, then log in.</li>
              <li>After login, open your Dashboard to see progress and active attempts.</li>
              <li>Use the sidebar to move between Labs, Attempts, Profile, Leaderboard, and this guide.</li>
            </ul>
          </section>

          <section className="rounded border border-slate-800 bg-slate-900/40 p-5">
            <h3 className="text-cyan-300 font-bold uppercase text-sm mb-3">2. Solving Labs</h3>
            <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
              <li>Go to All Labs and choose a lab that is not locked.</li>
              <li>Locked labs require more EXP before you can start them.</li>
              <li>Completed labs are marked and cannot be replayed for extra score.</li>
              <li>Open a lab and press Start Attempt to begin.</li>
              <li>Each attempt has up to 3 token submissions.</li>
            </ul>
          </section>

          <section className="rounded border border-slate-800 bg-slate-900/40 p-5">
            <h3 className="text-cyan-300 font-bold uppercase text-sm mb-3">3. Token Submission Rules</h3>
            <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
              <li>Submit tokens in the lab page or use Quick Submit from Dashboard.</li>
              <li>Correct token: lab is completed and score is awarded.</li>
              <li>Incorrect token: attempts remaining decreases.</li>
              <li>After 3 failed submissions, the attempt is locked as failed.</li>
              <li>Hints are limited and may reduce final scoring depending on the lab rules.</li>
            </ul>
          </section>

          <section className="rounded border border-slate-800 bg-slate-900/40 p-5">
            <h3 className="text-cyan-300 font-bold uppercase text-sm mb-3">4. Tracking Progress</h3>
            <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
              <li>Dashboard shows completion rate, score, success rate, and badge progress.</li>
              <li>Attempts page shows all attempts and per-lab attempt history.</li>
              <li>Profile shows your user details and role.</li>
              <li>Leaderboard ranks participants by score and progress.</li>
            </ul>
          </section>

          <section className="rounded border border-slate-800 bg-slate-900/40 p-5">
            <h3 className="text-cyan-300 font-bold uppercase text-sm mb-3">5. Admin Workflow (Admins Only)</h3>
            <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
              <li>Open Admin Dashboard to manage users, labs, submissions, and activity.</li>
              <li>Create or edit labs from Admin Labs.</li>
              <li>Edit mode auto-fills current lab data in the form.</li>
              <li>Monitor user progress and platform activity from dedicated admin pages.</li>
            </ul>
          </section>

          <section className="rounded border border-amber-800 bg-amber-950/20 p-5">
            <h3 className="text-amber-300 font-bold uppercase text-sm mb-3">Tips</h3>
            <ul className="space-y-2 text-sm text-amber-100/90 list-disc list-inside">
              <li>Start with Easy labs to build EXP quickly.</li>
              <li>Read lab descriptions carefully before requesting hints.</li>
              <li>Track failed attempts on the Attempts page to avoid repeating mistakes.</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
