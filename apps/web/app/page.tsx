import IntakeForm from './components/intake/IntakeForm'
import LanguageSwitcher from './components/LanguageSwitcher'
import { LanguageProvider } from './context/language'
import { SubmissionProvider } from './context/submission'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl rounded-[36px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
        <LanguageProvider>
          <div className="mb-8">
            <LanguageSwitcher />
          </div>

          <SubmissionProvider>
            <IntakeForm />
          </SubmissionProvider>
        </LanguageProvider>
      </div>
    </div>
  )
}
