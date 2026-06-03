import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import {
  Category,
  Product,
  ProductImage,
  ProductSpec,
  User,
  UserRole,
} from './entities';

type ProductSeed = {
  categorySlug: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  brand: string;
  thumbnailUrl: string;
  isFeatured: boolean;
  avgRating?: number;
  reviewCount?: number;
  images: string[];
  specs: { key: string; value: string }[];
};

// Picsum: JPEG ổn định trên Android, không cần decode WebP/redirect Unsplash
const IMG = {
  iphone15: 'https://picsum.photos/id/180/900/900',
  iphone14: 'https://picsum.photos/id/26/900/900',
  s24: 'https://picsum.photos/id/96/900/900',
  a55: 'https://picsum.photos/id/1/900/900',
  xiaomi14: 'https://picsum.photos/id/201/900/900',
  oppo: 'https://picsum.photos/id/2/900/900',
  pixel: 'https://picsum.photos/id/160/900/900',
  catApple: 'https://picsum.photos/id/180/400/400',
  catSamsung: 'https://picsum.photos/id/96/400/400',
  catXiaomi: 'https://picsum.photos/id/201/400/400',
  catOppo: 'https://picsum.photos/id/2/400/400',
};

const PRODUCTS: ProductSeed[] = [
  {
    categorySlug: 'apple',
    name: 'iPhone 15 Pro Max 256GB',
    slug: 'iphone-15-pro-max',
    description:
      'Titan sang trọng, chip A17 Pro mạnh mẽ, camera 48MP zoom quang học 5x. Pin cả ngày, USB-C, Action Button tiện lợi. Hàng chính hãng VN/A, bảo hành 12 tháng.',
    price: 34990000,
    salePrice: 31990000,
    stock: 42,
    brand: 'Apple',
    thumbnailUrl: IMG.iphone15,
    isFeatured: true,
    avgRating: 4.9,
    reviewCount: 128,
    images: [IMG.iphone15, IMG.iphone14],
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
    name: 'iPhone 14 128GB',
    slug: 'iphone-14',
    description:
      'Thiết kế quen thuộc, hiệu năng ổn định với A15 Bionic. Camera kép sắc nét, hỗ trợ eSIM. Lựa chọn tốt trong phân khúc tầm trung cao.',
    price: 18990000,
    salePrice: 16990000,
    stock: 55,
    brand: 'Apple',
    thumbnailUrl: IMG.iphone14,
    isFeatured: true,
    avgRating: 4.7,
    reviewCount: 86,
    images: [IMG.iphone14],
    specs: [
      { key: 'Màn hình', value: '6.1" OLED' },
      { key: 'Chip', value: 'A15 Bionic' },
      { key: 'Bộ nhớ', value: '128GB' },
      { key: 'Pin', value: '3279 mAh' },
    ],
  },
  {
    categorySlug: 'samsung',
    name: 'Galaxy S24 Ultra 512GB',
    slug: 'samsung-galaxy-s24-ultra',
    description:
      'Flagship Samsung với Galaxy AI, bút S Pen, camera 200MP. Màn hình Dynamic AMOLED 2X 120Hz, kháng nước IP68. Ưu đãi trả góp 0%.',
    price: 33990000,
    salePrice: 30990000,
    stock: 38,
    brand: 'Samsung',
    thumbnailUrl: IMG.s24,
    isFeatured: true,
    avgRating: 4.8,
    reviewCount: 94,
    images: [IMG.s24, IMG.a55],
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
    name: 'Galaxy A55 5G 8/256GB',
    slug: 'galaxy-a55',
    description:
      'Smartphone tầm trung nổi bật: thiết kế cực đẹp, camera OIS, sạc nhanh 25W. 5G sẵn sàng, One UI mượt mà.',
    price: 9990000,
    salePrice: 8990000,
    stock: 70,
    brand: 'Samsung',
    thumbnailUrl: IMG.a55,
    isFeatured: true,
    avgRating: 4.5,
    reviewCount: 61,
    images: [IMG.a55],
    specs: [
      { key: 'Màn hình', value: '6.6" FHD+ 120Hz' },
      { key: 'RAM', value: '8GB' },
      { key: 'Bộ nhớ', value: '256GB' },
      { key: 'Pin', value: '5000 mAh' },
    ],
  },
  {
    categorySlug: 'xiaomi',
    name: 'Xiaomi 14 12/512GB',
    slug: 'xiaomi-14',
    description:
      'Leica optics, Snapdragon 8 Gen 3, sạc nhanh 90W. Màn hình CrystalRes AMOLED 120Hz — flagship giá hấp dẫn.',
    price: 22990000,
    salePrice: 20990000,
    stock: 45,
    brand: 'Xiaomi',
    thumbnailUrl: IMG.xiaomi14,
    isFeatured: true,
    avgRating: 4.6,
    reviewCount: 72,
    images: [IMG.xiaomi14],
    specs: [
      { key: 'Màn hình', value: '6.36" AMOLED 120Hz' },
      { key: 'RAM', value: '12GB' },
      { key: 'Bộ nhớ', value: '512GB' },
      { key: 'Pin', value: '4610 mAh · sạc 90W' },
    ],
  },
  {
    categorySlug: 'oppo',
    name: 'OPPO Find X7 Ultra',
    slug: 'oppo-find-x7-ultra',
    description:
      'Camera Hasselblad, zoom periscope kép, thiết kế cao cấp. Hiệu năng đỉnh cho game và chỉnh ảnh chuyên nghiệp.',
    price: 28990000,
    stock: 22,
    brand: 'OPPO',
    thumbnailUrl: IMG.oppo,
    isFeatured: false,
    avgRating: 4.7,
    reviewCount: 33,
    images: [IMG.oppo],
    specs: [
      { key: 'Màn hình', value: '6.82" AMOLED 120Hz' },
      { key: 'RAM', value: '16GB' },
      { key: 'Bộ nhớ', value: '512GB' },
      { key: 'Pin', value: '5000 mAh · sạc 100W' },
    ],
  },
  {
    categorySlug: 'google',
    name: 'Google Pixel 8 Pro',
    slug: 'google-pixel-8-pro',
    description:
      'Trải nghiệm Android thuần, camera AI Magic Editor, cập nhật phần mềm 7 năm. Lý tưởng cho người thích chụp ảnh.',
    price: 24990000,
    salePrice: 22990000,
    stock: 28,
    brand: 'Google',
    thumbnailUrl: IMG.pixel,
    isFeatured: true,
    avgRating: 4.8,
    reviewCount: 41,
    images: [IMG.pixel],
    specs: [
      { key: 'Màn hình', value: '6.7" LTPO OLED 120Hz' },
      { key: 'Chip', value: 'Tensor G3' },
      { key: 'RAM', value: '12GB' },
      { key: 'Bộ nhớ', value: '256GB' },
    ],
  },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const categoriesRepo = app.get<Repository<Category>>(getRepositoryToken(Category));
  const productsRepo = app.get<Repository<Product>>(getRepositoryToken(Product));
  const imagesRepo = app.get<Repository<ProductImage>>(getRepositoryToken(ProductImage));
  const specsRepo = app.get<Repository<ProductSpec>>(getRepositoryToken(ProductSpec));

  const upsertUser = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
  ) => {
    let user = await usersRepo.findOne({ where: { email } });
    if (!user) {
      user = await usersRepo.save(
        usersRepo.create({
          email,
          password: await bcrypt.hash(password, 10),
          fullName,
          role,
        }),
      );
      console.log(`Created user: ${email} / ${password}`);
    }
    return user;
  };

  await upsertUser('admin@dosuone.com', 'admin123', 'Admin Dosuone', UserRole.ADMIN);
  await upsertUser('customer@dosuone.com', 'customer123', 'Nguyễn Văn Khách', UserRole.CUSTOMER);

  const categories = [
    { name: 'Apple', slug: 'apple', imageUrl: IMG.catApple },
    { name: 'Samsung', slug: 'samsung', imageUrl: IMG.catSamsung },
    { name: 'Xiaomi', slug: 'xiaomi', imageUrl: IMG.catXiaomi },
    { name: 'OPPO', slug: 'oppo', imageUrl: IMG.catOppo },
    { name: 'Google', slug: 'google', imageUrl: IMG.pixel },
  ];

  const categoryMap = new Map<string, string>();
  for (const c of categories) {
    let cat = await categoriesRepo.findOne({ where: { slug: c.slug } });
    if (!cat) cat = await categoriesRepo.save(categoriesRepo.create(c));
    else {
      cat.name = c.name;
      cat.imageUrl = c.imageUrl;
      cat.isActive = true;
      await categoriesRepo.save(cat);
    }
    categoryMap.set(c.slug, cat.id);
  }

  for (const p of PRODUCTS) {
    const categoryId = categoryMap.get(p.categorySlug);
    if (!categoryId) continue;

    let product = await productsRepo.findOne({ where: { slug: p.slug } });
    const payload = {
      categoryId,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      salePrice: p.salePrice,
      stock: p.stock,
      brand: p.brand,
      thumbnailUrl: p.thumbnailUrl,
      isFeatured: p.isFeatured,
      isActive: true,
      avgRating: p.avgRating ?? 0,
      reviewCount: p.reviewCount ?? 0,
    };

    if (!product) {
      product = await productsRepo.save(productsRepo.create(payload));
      console.log(`+ Product: ${p.name}`);
    } else {
      Object.assign(product, payload);
      await productsRepo.save(product);
      await imagesRepo.delete({ productId: product.id });
      await specsRepo.delete({ productId: product.id });
      console.log(`↻ Product: ${p.name}`);
    }

    await imagesRepo.save(
      p.images.map((url, i) =>
        imagesRepo.create({
          productId: product!.id,
          imageUrl: url,
          sortOrder: i,
          isPrimary: i === 0,
        }),
      ),
    );

    await specsRepo.save(
      p.specs.map((s, i) =>
        specsRepo.create({
          productId: product!.id,
          specKey: s.key,
          specValue: s.value,
          sortOrder: i,
        }),
      ),
    );
  }

  console.log('\n✓ Seed completed');
  console.log('  Admin:    admin@dosuone.com / admin123');
  console.log('  Customer: customer@dosuone.com / customer123');
  await app.close();
}
seed();
