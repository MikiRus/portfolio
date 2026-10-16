export type Locale = 'ru' | 'en'
export type Localized = Record<Locale, string>

export type FolderId = 'ecommerce' | 'sites' | 'crm' | 'demo'
export type ProjectKind = 'front' | 'back' | 'full'

export interface ContainerSpec {
  name: string
  image: string
  port?: string
  // Строки лога, которые «печатает» контейнер при старте.
  logs: string[]
}

export interface Project {
  id: string
  folder: FolderId
  name: string
  short: string
  colors: [from: string, to: string]
  kind: ProjectKind
  // Что показывать в адресной строке Safari.
  url: string
  // Публичный репозиторий owner/name — для звёзд и последнего коммита из GitHub API.
  repo?: string
  // Шаблон сервиса песочниц: проект запускается по-настоящему и открывается в iframe.
  sandbox?: string
  period: Localized
  role: Localized
  tagline: Localized
  task: Localized
  done: Localized[]
  architecture: Localized[]
  stack: string[]
  stats: { value: string; label: Localized }[]
  containers: ContainerSpec[]
}
