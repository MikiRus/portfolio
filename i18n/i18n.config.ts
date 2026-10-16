// Русские формы множественного числа: 1 объект, 2 объекта, 5 объектов.
// Словари задают формы как «одна | несколько | много».
function ruPlural(choice: number, choicesLength: number) {
  if (choicesLength < 3) return choice === 1 ? 0 : 1
  const n = Math.abs(choice) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return 2
  if (n1 === 1) return 0
  if (n1 >= 2 && n1 <= 4) return 1
  return 2
}

export default defineI18nConfig(() => ({
  pluralRules: { ru: ruPlural },
}))
