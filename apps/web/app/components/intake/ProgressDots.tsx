import { useLanguage } from '@/app/context/language'

interface Props {
  total: number
  current: number
  done: boolean
}

export default function ProgressDots({ total, current, done }: Props) {
  const { t } = useLanguage()
  const percent = done ? 100 : ((current + 1) / total) * 100

  return (
    <div className="space-y-3">
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            backgroundImage: 'linear-gradient(90deg, var(--accent-start), var(--accent-end))',
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-300">
        <span>{t('progress')}</span>
        <span>{done ? total : current + 1} / {total}</span>
      </div>
    </div>
  )
}

