export const COIN_CENTS = [5, 10, 20, 50, 100, 200] as const;
export const NOTE_CENTS = [500, 1000, 2000, 5000, 10000] as const;
export const MONEY_CENTS = [...COIN_CENTS, ...NOTE_CENTS] as const;

export function sumCents(values: number[]): number {
  return values.reduce((sum, n) => sum + n, 0);
}

export function moneyLabel(cents: number): string {
  if (cents < 100) return `${cents}c`;
  if (cents % 100 === 0) return `$${cents / 100}`;
  return `$${(cents / 100).toFixed(2)}`;
}

export function moneySpoken(cents: number): string {
  if (cents < 100) return `${cents} cents`;
  const dollars = cents / 100;
  return dollars === 1 ? "1 dollar" : `${dollars} dollars`;
}

export function greedyCoins(cents: number): number[] {
  const out: number[] = [];
  let left = cents;
  for (const value of [200, 100, 50, 20, 10, 5]) {
    while (left >= value) {
      out.push(value);
      left -= value;
    }
  }
  return out;
}
