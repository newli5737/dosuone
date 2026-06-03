/** Ảnh nguồn (JPEG ổn định) — seed script tải về rồi upload Cloudinary */
export const SOURCE_IMAGES: Record<string, string> = {
  'cat-apple': 'https://picsum.photos/id/180/800/800',
  'cat-samsung': 'https://picsum.photos/id/96/800/800',
  'cat-xiaomi': 'https://picsum.photos/id/201/800/800',
  'cat-oppo': 'https://picsum.photos/id/2/800/800',
  'cat-google': 'https://picsum.photos/id/160/800/800',
  'iphone-15-pro': 'https://picsum.photos/id/180/900/900',
  'iphone-14': 'https://picsum.photos/id/26/900/900',
  'galaxy-s24': 'https://picsum.photos/id/96/900/900',
  'galaxy-a55': 'https://picsum.photos/id/1/900/900',
  'xiaomi-14': 'https://picsum.photos/id/201/900/900',
  'oppo-find-x7': 'https://picsum.photos/id/2/900/900',
  'pixel-8-pro': 'https://picsum.photos/id/160/900/900',
};

export const BRANDS = [
  { name: 'Apple', slug: 'apple' },
  { name: 'Samsung', slug: 'samsung' },
  { name: 'Xiaomi', slug: 'xiaomi' },
  { name: 'OPPO', slug: 'oppo' },
  { name: 'Google', slug: 'google' },
] as const;

export const CATEGORIES = [
  { name: 'Apple', slug: 'apple', imageKey: 'cat-apple' },
  { name: 'Samsung', slug: 'samsung', imageKey: 'cat-samsung' },
  { name: 'Xiaomi', slug: 'xiaomi', imageKey: 'cat-xiaomi' },
  { name: 'OPPO', slug: 'oppo', imageKey: 'cat-oppo' },
  { name: 'Google', slug: 'google', imageKey: 'cat-google' },
] as const;

export type ProductSeedDef = {
  categorySlug: string;
  brandSlug: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  isFeatured: boolean;
  avgRating?: number;
  reviewCount?: number;
  thumbKey: string;
  imageKeys: string[];
  specs: { key: string; value: string }[];
};

export const PRODUCTS: ProductSeedDef[] = [
  {
    categorySlug: 'apple',
    brandSlug: 'apple',
    name: 'iPhone 15 Pro Max 256GB',
    slug: 'iphone-15-pro-max',
    description:
      'Titan sang trọng, chip A17 Pro, camera 48MP zoom quang 5x. Pin cả ngày, USB-C. Hàng chính hãng VN/A, bảo hành 12 tháng tại DOSUONE.',
    price: 34990000,
    salePrice: 31990000,
    stock: 42,
    isFeatured: true,
    avgRating: 4.9,
    reviewCount: 128,
    thumbKey: 'iphone-15-pro',
    imageKeys: ['iphone-15-pro', 'iphone-14'],
    specs: [
      { key: 'Màn hình', value: '6.7" Super Retina XDR' },
      { key: 'Chip', value: 'A17 Pro' },
      { key: 'RAM', value: '8GB' },
      { key: 'Bộ nhớ', value: '256GB' },
      { key: 'Pin', value: '4422 mAh' },
    ],
  },
  {
    categorySlug: 'apple',
    brandSlug: 'apple',
    name: 'iPhone 14 128GB',
    slug: 'iphone-14',
    description:
      'A15 Bionic ổn định, camera kép sắc nét, hỗ trợ eSIM. Lựa chọn tốt phân khúc tầm trung cao, nhiều màu sắc.',
    price: 18990000,
    salePrice: 16990000,
    stock: 55,
    isFeatured: true,
    avgRating: 4.7,
    reviewCount: 86,
    thumbKey: 'iphone-14',
    imageKeys: ['iphone-14'],
    specs: [
      { key: 'Màn hình', value: '6.1" OLED' },
      { key: 'Chip', value: 'A15 Bionic' },
      { key: 'Bộ nhớ', value: '128GB' },
      { key: 'Pin', value: '3279 mAh' },
    ],
  },
  {
    categorySlug: 'samsung',
    brandSlug: 'samsung',
    name: 'Galaxy S24 Ultra 512GB',
    slug: 'samsung-galaxy-s24-ultra',
    description:
      'Galaxy AI, bút S Pen, camera 200MP. Màn hình Dynamic AMOLED 2X 120Hz, IP68. Trả góp 0% tại cửa hàng.',
    price: 33990000,
    salePrice: 30990000,
    stock: 38,
    isFeatured: true,
    avgRating: 4.8,
    reviewCount: 94,
    thumbKey: 'galaxy-s24',
    imageKeys: ['galaxy-s24', 'galaxy-a55'],
    specs: [
      { key: 'Màn hình', value: '6.8" QHD+ 120Hz' },
      { key: 'Chip', value: 'Snapdragon 8 Gen 3' },
      { key: 'RAM', value: '12GB' },
      { key: 'Bộ nhớ', value: '512GB' },
      { key: 'Pin', value: '5000 mAh' },
    ],
  },
  {
    categorySlug: 'samsung',
    brandSlug: 'samsung',
    name: 'Galaxy A55 5G 8/256GB',
    slug: 'galaxy-a55',
    description:
      'Tầm trung nổi bật: thiết kế đẹp, camera OIS, sạc nhanh 25W. 5G, One UI mượt.',
    price: 9990000,
    salePrice: 8990000,
    stock: 70,
    isFeatured: true,
    avgRating: 4.5,
    reviewCount: 61,
    thumbKey: 'galaxy-a55',
    imageKeys: ['galaxy-a55'],
    specs: [
      { key: 'Màn hình', value: '6.6" FHD+ 120Hz' },
      { key: 'RAM', value: '8GB' },
      { key: 'Bộ nhớ', value: '256GB' },
      { key: 'Pin', value: '5000 mAh' },
    ],
  },
  {
    categorySlug: 'xiaomi',
    brandSlug: 'xiaomi',
    name: 'Xiaomi 14 12/512GB',
    slug: 'xiaomi-14',
    description:
      'Leica optics, Snapdragon 8 Gen 3, sạc 90W. CrystalRes AMOLED 120Hz — flagship giá tốt.',
    price: 22990000,
    salePrice: 20990000,
    stock: 45,
    isFeatured: true,
    avgRating: 4.6,
    reviewCount: 72,
    thumbKey: 'xiaomi-14',
    imageKeys: ['xiaomi-14'],
    specs: [
      { key: 'Màn hình', value: '6.36" AMOLED 120Hz' },
      { key: 'RAM', value: '12GB' },
      { key: 'Bộ nhớ', value: '512GB' },
      { key: 'Pin', value: '4610 mAh · sạc 90W' },
    ],
  },
  {
    categorySlug: 'oppo',
    brandSlug: 'oppo',
    name: 'OPPO Find X7 Ultra',
    slug: 'oppo-find-x7-ultra',
    description:
      'Camera Hasselblad, zoom periscope kép. Hiệu năng đỉnh cho game và chỉnh ảnh.',
    price: 28990000,
    stock: 22,
    isFeatured: false,
    avgRating: 4.7,
    reviewCount: 33,
    thumbKey: 'oppo-find-x7',
    imageKeys: ['oppo-find-x7'],
    specs: [
      { key: 'Màn hình', value: '6.82" AMOLED 120Hz' },
      { key: 'RAM', value: '16GB' },
      { key: 'Bộ nhớ', value: '512GB' },
      { key: 'Pin', value: '5000 mAh · sạc 100W' },
    ],
  },
  {
    categorySlug: 'google',
    brandSlug: 'google',
    name: 'Google Pixel 8 Pro',
    slug: 'google-pixel-8-pro',
    description:
      'Android thuần, camera AI Magic Editor, cập nhật 7 năm. Dành cho người thích chụp ảnh.',
    price: 24990000,
    salePrice: 22990000,
    stock: 28,
    isFeatured: true,
    avgRating: 4.8,
    reviewCount: 41,
    thumbKey: 'pixel-8-pro',
    imageKeys: ['pixel-8-pro'],
    specs: [
      { key: 'Màn hình', value: '6.7" LTPO OLED 120Hz' },
      { key: 'Chip', value: 'Tensor G3' },
      { key: 'RAM', value: '12GB' },
      { key: 'Bộ nhớ', value: '256GB' },
    ],
  },
];
