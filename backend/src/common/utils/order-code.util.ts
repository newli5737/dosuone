import dayjs from 'dayjs';

export function generateOrderCode(): string {
  const date = dayjs().format('YYYYMMDD');
  const random = Math.floor(1000 + Math.random() * 9000).toString();
  return `DH${date}${random}`;
}

export function calcShippingFee(subtotal: number): number {
  return subtotal >= 500000 ? 0 : 30000;
}
