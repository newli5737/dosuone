import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.join(__dirname, '../.env') });

import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import {
  Brand,
  Category,
  Product,
  ProductImage,
  ProductSpec,
  User,
  UserRole,
} from './entities';
import { resolveAllMedia, type CloudinaryAsset } from './seed/cloudinary-media';
import { BRANDS, CATEGORIES, LEGACY_CATEGORY_SLUGS, PRODUCTS } from './seed/definitions';

async function seed() {
  const forceMedia = process.argv.includes('--force-media');
  console.log('\n📷 Upload ảnh seed lên Cloudinary…');
  const media = await resolveAllMedia(forceMedia);

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const usersRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const brandsRepo = app.get<Repository<Brand>>(getRepositoryToken(Brand));
  const categoriesRepo = app.get<Repository<Category>>(getRepositoryToken(Category));
  const productsRepo = app.get<Repository<Product>>(getRepositoryToken(Product));
  const imagesRepo = app.get<Repository<ProductImage>>(getRepositoryToken(ProductImage));
  const specsRepo = app.get<Repository<ProductSpec>>(getRepositoryToken(ProductSpec));

  const img = (key: string): CloudinaryAsset => {
    const asset = media[key];
    if (!asset) throw new Error(`Thiếu ảnh Cloudinary: ${key}`);
    return asset;
  };

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
      console.log(`  + User ${email}`);
    }
    return user;
  };

  await upsertUser('admin@dosuone.com', 'admin123', 'Admin Dosuone', UserRole.ADMIN);
  await upsertUser('customer@dosuone.com', 'customer123', 'Nguyễn Văn Khách', UserRole.CUSTOMER);

  console.log('\n🏷️  Thương hiệu & danh mục…');
  const brandMap = new Map<string, string>();
  for (const b of BRANDS) {
    let row = await brandsRepo.findOne({ where: { slug: b.slug } });
    if (!row) row = await brandsRepo.save(brandsRepo.create({ name: b.name, slug: b.slug }));
    else {
      row.name = b.name;
      row.isActive = true;
      await brandsRepo.save(row);
    }
    brandMap.set(b.slug, row.id);
  }

  const categoryMap = new Map<string, string>();
  for (const c of CATEGORIES) {
    const asset = img(c.imageKey);
    let cat = await categoriesRepo.findOne({ where: { slug: c.slug } });
    if (!cat) {
      cat = await categoriesRepo.save(
        categoriesRepo.create({
          name: c.name,
          slug: c.slug,
          imageUrl: asset.url,
          imagePublicId: asset.public_id,
        }),
      );
    } else {
      cat.name = c.name;
      cat.imageUrl = asset.url;
      cat.imagePublicId = asset.public_id;
      cat.isActive = true;
      await categoriesRepo.save(cat);
    }
    categoryMap.set(c.slug, cat.id);
  }

  for (const legacySlug of LEGACY_CATEGORY_SLUGS) {
    const old = await categoriesRepo.findOne({ where: { slug: legacySlug } });
    if (!old) continue;
    const linked = await productsRepo.count({ where: { categoryId: old.id } });
    if (linked === 0) {
      await categoriesRepo.remove(old);
      console.log(`  − Xóa danh mục cũ (không còn SP): ${legacySlug}`);
    } else if (old.isActive) {
      old.isActive = false;
      await categoriesRepo.save(old);
      console.log(`  − Ẩn danh mục cũ: ${legacySlug} (${linked} SP cần chuyển danh mục)`);
    }
  }

  console.log('\n📱 Sản phẩm…');
  for (const p of PRODUCTS) {
    const categoryId = categoryMap.get(p.categorySlug);
    const brandId = brandMap.get(p.brandSlug);
    if (!categoryId || !brandId) continue;

    const thumb = img(p.thumbKey);
    const gallery = p.imageKeys.map((k) => img(k));

    let product = await productsRepo.findOne({ where: { slug: p.slug } });
    const payload = {
      categoryId,
      brandId,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      salePrice: p.salePrice,
      stock: p.stock,
      thumbnailUrl: thumb.url,
      thumbnailPublicId: thumb.public_id,
      isFeatured: p.isFeatured,
      isActive: true,
      avgRating: p.avgRating ?? 0,
      reviewCount: p.reviewCount ?? 0,
    };

    if (!product) {
      product = await productsRepo.save(productsRepo.create(payload));
      console.log(`  + ${p.name}`);
    } else {
      Object.assign(product, payload);
      await productsRepo.save(product);
      await imagesRepo.delete({ productId: product.id });
      await specsRepo.delete({ productId: product.id });
      console.log(`  ↻ ${p.name}`);
    }

    await imagesRepo.save(
      gallery.map((asset, i) =>
        imagesRepo.create({
          productId: product!.id,
          imageUrl: asset.url,
          cloudinaryPublicId: asset.public_id,
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

  console.log('\n✓ Seed xong (ảnh trên Cloudinary)');
  console.log('  Admin:    admin@dosuone.com / admin123');
  console.log('  Customer: customer@dosuone.com / customer123');
  console.log('  Gợi ý: npm run seed -- --force-media để upload lại toàn bộ ảnh\n');
  await app.close();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
