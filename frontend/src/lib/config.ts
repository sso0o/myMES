export class AppBootstrapError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AppBootstrapError'
  }
}

export function getRequiredEnv(name: string): string {
  const value = import.meta.env[name]

  if (typeof value === 'string' && value.trim()) {
    return value
  }

  throw new AppBootstrapError(`${name} 환경변수가 설정되지 않았습니다.`)
}
