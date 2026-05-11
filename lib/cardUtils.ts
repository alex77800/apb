// lib/cardUtils.ts

// BIN-ы для разных платёжных систем (первые 6 цифр)
const BINS: Record<string, string[]> = {
  Mir: ["220138", "220139"],   // примерные BIN для ПМР
  Visa: ["440567", "440568"],
  Mastercard: ["550987", "550988"],
  Klever: ["910401", "910402"],   // <-- вот эта строка
};

// Алгоритм Луна для проверки/генерации последней цифры
function luhnChecksum(num: string): number {
  let sum = 0;
  const parity = num.length % 2;
  for (let i = 0; i < num.length; i++) {
    let digit = parseInt(num[i]);
    if (i % 2 === parity) digit *= 2;
    if (digit > 9) digit -= 9;
    sum += digit;
  }
  return (10 - (sum % 10)) % 10;
}

// Генерация виртуальной карты
export function generateCardNumber(paymentSystem: string): {
  cardNumber: string;
  cvv: string;
  expiryMonth: number;
  expiryYear: number;
} {
  const binList = BINS[paymentSystem];
  if (!binList) throw new Error('Unsupported payment system');
  const bin = binList[Math.floor(Math.random() * binList.length)];

  // Генерация 9 случайных цифр между BIN и контрольной цифрой
  let partial = bin;
  for (let i = 0; i < 9; i++) {
    partial += Math.floor(Math.random() * 10).toString();
  }
  const checkDigit = luhnChecksum(partial);
  const cardNumber = partial + checkDigit.toString();

  // Срок действия: 3 года от текущей даты
  const now = new Date();
  const expiryMonth = now.getMonth() + 1; // 1-12
  const expiryYear = now.getFullYear() + 3;

  // CVV: 3 случайные цифры
  const cvv = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  return { cardNumber, cvv, expiryMonth, expiryYear };
}

// Форматирование номера карты для отображения (XXXX XXXX XXXX 1234)
export function maskCardNumber(cardNumber: string): string {
  return cardNumber.slice(-4).padStart(cardNumber.length, '*');
}

export function formatCardNumber(cardNumber: string): string {
  return cardNumber.replace(/(.{4})/g, '$1 ').trim();
}