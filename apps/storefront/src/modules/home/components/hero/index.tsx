import { Github } from "@medusajs/icons"
import { Button, Heading } from "@modules/common/components/ui"

const Hero = () => {
  return (
    <div className="relative w-full overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top,_#f5fef8,_#ffffff_45%,_#f8fafc_100%)]">
      <div className="mx-auto flex min-h-[68vh] max-w-7xl items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Fresh everyday essentials
          </span>
          <Heading
            level="h1"
            className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
          >
            Smart shopping for your daily routine
          </Heading>
          <Heading
            level="h2"
            className="mt-4 text-lg font-medium text-slate-600 sm:text-xl"
          >
            Groceries, home essentials, and curated favorites delivered with ease.
          </Heading>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/store"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Shop now
            </a>
            <a
              href="https://github.com/medusajs/dtc-starter"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
            >
              View on GitHub <Github />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
