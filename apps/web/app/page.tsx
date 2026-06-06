import IntakeForm from './components/intake/IntakeForm'
import { SubmissionProvider } from './context/submission'

export default function Home() {
  return (
    <div className="min-h-screen bg-csn-navy flex flex-col items-center justify-center px-6 py-16">
      <header className="mb-12 text-center">
        <p className="text-csn-gold text-xs font-bold tracking-[0.22em] uppercase mb-2">
          College of Southern Nevada
        </p>
        <h1 className="text-white text-3xl font-bold tracking-tight">
          English Language Intake
        </h1>
        <p className="mt-2 text-white/40 text-sm">
          Let&apos;s learn about your English study goals
        </p>
      </header>

      <div className="w-full max-w-md">
        {/* text-csn-navy resets the inherited dark-mode foreground color inside the white card */}
        <div className="bg-white text-csn-navy rounded-2xl px-10 py-12 shadow-2xl ring-1 ring-black/5">
          <SubmissionProvider>
            <IntakeForm />
          </SubmissionProvider>
        </div>
      </div>

      <footer className="mt-12">
        <p className="text-white/20 text-xs">© 2026 College of Southern Nevada</p>
      </footer>
    </div>
  )
}
