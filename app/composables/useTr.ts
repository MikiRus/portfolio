import type { Locale, Localized } from '~/data/types'

// Перевод для контента из data/: тексты кейсов лежат рядом с данными, а не в словарях.
export function useTr() {
  const { locale } = useI18n()
  return (text: Localized) => text[locale.value as Locale] ?? text.ru
}
