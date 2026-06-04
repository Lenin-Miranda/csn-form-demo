interface Props {
  total: number
  current: number
  done: boolean
}

export default function ProgressDots({ total, current, done }: Props) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-300 ease-out ${
            done || i < current
              ? 'w-5 bg-csn-gold'
              : i === current
              ? 'w-8 bg-csn-gold'
              : 'w-5 bg-slate-200'
          }`}
        />
      ))}
      <span className="ml-2 text-xs tabular-nums text-slate-400" style={{ color: '#94a3b8' }}>
        {done ? total : current + 1} / {total}
      </span>
    </div>
  )
}
