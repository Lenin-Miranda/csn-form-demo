type LogLevel = 'log' | 'warn' | 'error' | 'debug'

const LEVEL_CONFIG: Record<
  LogLevel,
  {
    label: string
    method: 'log' | 'warn' | 'error' | 'debug'
    badgeStyle: string
    scopeStyle: string
  }
> = {
  log: {
    label: 'LOG',
    method: 'log',
    badgeStyle: 'background:#0f766e;color:#ffffff;padding:2px 6px;border-radius:4px;font-weight:700',
    scopeStyle: 'color:#0f766e;font-weight:700',
  },
  warn: {
    label: 'WARN',
    method: 'warn',
    badgeStyle: 'background:#b45309;color:#ffffff;padding:2px 6px;border-radius:4px;font-weight:700',
    scopeStyle: 'color:#b45309;font-weight:700',
  },
  error: {
    label: 'ERROR',
    method: 'error',
    badgeStyle: 'background:#b91c1c;color:#ffffff;padding:2px 6px;border-radius:4px;font-weight:700',
    scopeStyle: 'color:#b91c1c;font-weight:700',
  },
  debug: {
    label: 'DEBUG',
    method: 'debug',
    badgeStyle: 'background:#475569;color:#ffffff;padding:2px 6px;border-radius:4px;font-weight:700',
    scopeStyle: 'color:#475569;font-weight:700',
  },
}

function timestamp() {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function shouldLog(level: LogLevel) {
  if (process.env.NODE_ENV !== 'production') {
    return true
  }

  return level === 'warn' || level === 'error'
}

function write(level: LogLevel, scope: string, message: string, meta: unknown[]) {
  if (!shouldLog(level)) {
    return
  }

  const config = LEVEL_CONFIG[level]
  const method = console[config.method]

  method(
    `%c${config.label}%c ${timestamp()} %c[${scope}]%c ${message}`,
    config.badgeStyle,
    'color:#64748b',
    config.scopeStyle,
    'color:inherit',
    ...meta,
  )
}

export function createLogger(scope: string) {
  return {
    log(message: string, ...meta: unknown[]) {
      write('log', scope, message, meta)
    },
    warn(message: string, ...meta: unknown[]) {
      write('warn', scope, message, meta)
    },
    error(message: string, ...meta: unknown[]) {
      write('error', scope, message, meta)
    },
    debug(message: string, ...meta: unknown[]) {
      write('debug', scope, message, meta)
    },
  }
}
