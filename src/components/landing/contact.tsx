export function Contact() {
  return (
    <section id="contact" className="px-6 py-20">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">
            Contact
          </p>
          <h2 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-slate-950">
            Ready to launch your tour brand?
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Use the signup page to onboard users right now, or log in with the seeded
            super admin account to test permissions and internal views.
          </p>
        </div>
        <div className="rounded-[2rem] bg-gradient-to-br from-amber-400 via-orange-500 to-cyan-500 p-[1px] shadow-2xl shadow-orange-200">
          <div className="h-full rounded-[calc(2rem-1px)] bg-white p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-2 font-medium text-slate-950">hello@tourvibe.demo</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Phone</p>
                <p className="mt-2 font-medium text-slate-950">+880 1700 000000</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Support</p>
                <p className="mt-2 font-medium text-slate-950">24/7 trip assistance</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Launch path</p>
                <p className="mt-2 font-medium text-slate-950">
                  Landing page, auth, dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
