export type SepayQrParams = {
  acc: string;
  bank: string;
  amount: number;
  des: string;
  template?: 'compact' | 'qronly' | '';
  download?: boolean;
};

/** https://qr.sepay.vn/img?acc=&bank=&amount=&des=&template=&download= */
export function buildSepayQrUrl(params: SepayQrParams): string {
  const q = new URLSearchParams({
    acc: params.acc.trim(),
    bank: params.bank.trim().toUpperCase(),
    amount: String(Math.max(0, Math.round(params.amount))),
    des: params.des.trim(),
    template: params.template ?? 'compact',
    download: String(params.download ?? false),
  });
  return `https://qr.sepay.vn/img?${q.toString()}`;
}

export function buildTransferDescription(orderCode: string): string {
  return orderCode.replace(/\s+/g, '').toUpperCase();
}
