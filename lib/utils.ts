export function formatAccountNumber(num: string): string {
  return num.replace(/(.{4})/g, '$1 ').trim();
}