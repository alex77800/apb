// lib/accountNumber.ts

/**
 * Генерирует 20-значный номер расчетного счета в формате:
 * 1-3: балансовый счет первого порядка (например, 408 — физлица)
 * 4-5: балансовый счет второго порядка (например, 02)
 * 6-8: код валюты (810 — RUR, 840 — USD, 978 — EUR)
 * 9: контрольный ключ (заглушка 8)
 * 10-13: код подразделения (например, 2320)
 * 14-20: уникальный номер лицевого счета (случайные 7 цифр)
 */
export function generateAccountNumber(currency = "RUB") {
  const firstOrder = "408"; // Физлица/ИП
  const secondOrder = "02"; // Специфика
  const currencyCodes: Record<string, string> = {
    RUB: "810",
    USD: "840",
    EUR: "978",
    MDL: "498", // лей
    UAH: "980",
    PMR: "900", // Приднестровский рубль (условный код)
  };
  const currencyCode = currencyCodes[currency] || "810";
  const controlKey = "8"; // Заглушка, в реальном банке вычисляется
  const branch = "2320"; // Код подразделения (можно вынести в конфиг)
  
  // Генерируем 7 случайных цифр
  const random = Math.floor(Math.random() * 10_000_000)
    .toString()
    .padStart(7, "0");

  const accountNumber = `${firstOrder}${secondOrder}${currencyCode}${controlKey}${branch}${random}`;

  return accountNumber;
}