export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  timestamp: string
  message: string
  data?: any
  stack?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 500
  private minLevel: LogLevel = 'debug'
  private levelOrder: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('orca_logs')
      if (saved) {
        this.logs = JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Failed to load logs from storage')
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('orca_logs', JSON.stringify(this.logs.slice(-this.maxLogs)))
    } catch (e) {
      console.warn('Failed to save logs to storage')
    }
  }

  private formatLog(entry: LogEntry): string {
    const { level, timestamp, message, data } = entry
    const dataStr = data ? ` ${JSON.stringify(data)}` : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${dataStr}`
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (this.levelOrder[level] < this.levelOrder[this.minLevel]) {
      return
    }

    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      data,
    }

    this.logs.push(entry)

    // Keep only maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    this.saveToStorage()

    // Also log to console
    const formatted = this.formatLog(entry)
    const consoleMethod = level === 'warn' ? 'warn' : level === 'error' ? 'error' : 'log'
    console[consoleMethod as 'log' | 'warn' | 'error'](`%c${formatted}`, `color: ${this.getColor(level)}`)
  }

  private getColor(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return '#7c4dff'
      case 'info':
        return '#4A9EFF'
      case 'warn':
        return '#FF9F43'
      case 'error':
        return '#FF6D5A'
      default:
        return '#999'
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data)
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, data?: any) {
    this.log('error', message, data)
  }

  setMinLevel(level: LogLevel) {
    this.minLevel = level
  }

  getLogs(level?: LogLevel, limit = 100): LogEntry[] {
    let filtered = this.logs

    if (level) {
      filtered = filtered.filter((log) => log.level === level)
    }

    return filtered.slice(-limit)
  }

  clear() {
    this.logs = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem('orca_logs')
    }
  }

  export(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  download() {
    const data = this.export()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orca-logs-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}

export const logger = new Logger()
