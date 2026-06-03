import 'package:flutter/material.dart';
import 'package:flutter_carousel_widget/flutter_carousel_widget.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/auth/auth_redirect.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/layout/responsive.dart';
import '../../../core/widgets/app_network_image.dart';
import '../../../core/widgets/async_error_view.dart';
import '../../../core/widgets/loading_shimmer.dart';
import '../../../core/widgets/product_card.dart';
import '../../../core/widgets/section_header.dart';
import '../../auth/providers/auth_provider.dart';
import '../../auth/screens/profile_screen.dart';
import '../../cart/providers/cart_provider.dart';
import '../../order/screens/order_list_screen.dart';
import '../providers/home_provider.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _navIndex = 0;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(cartProvider.notifier).load());
  }

  @override
  Widget build(BuildContext context) {
    if (_navIndex != 0) {
      return _buildAltTab();
    }

    final categories = ref.watch(categoriesProvider);
    final featured = ref.watch(featuredProductsProvider);
    final newest = ref.watch(newestProductsProvider);
    final cart = ref.watch(cartProvider);
    final isLoggedIn = ref.watch(authProvider).isAuthenticated;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async {
          ref.invalidate(categoriesProvider);
          ref.invalidate(featuredProductsProvider);
          ref.invalidate(newestProductsProvider);
        },
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _HomeHeader(
              cartCount: cart.items.length,
              isLoggedIn: isLoggedIn,
            )),
            SliverToBoxAdapter(
              child: Transform.translate(
                offset: const Offset(0, -20),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: GestureDetector(
                    onTap: () => context.push('/search'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.search_rounded, color: AppColors.primary, size: 24),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Tìm iPhone, Samsung...',
                              style: TextStyle(color: AppColors.textMuted, fontSize: 15, fontWeight: FontWeight.w500),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.primaryLight,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.tune_rounded, size: 18, color: AppColors.primary),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            featured.when(
              data: (products) => SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: SizedBox(
                      height: 168,
                      child: products.isEmpty
                          ? const _FallbackBanner()
                          : FlutterCarousel(
                              options: CarouselOptions(
                                height: 168,
                                autoPlay: products.length > 1,
                                autoPlayInterval: const Duration(seconds: 4),
                                viewportFraction: 1,
                                showIndicator: products.length > 1,
                              ),
                              items: products.take(5).map((p) {
                                final sale = p['sale_price'];
                                final price = p['price'];
                                String subtitle = 'Chính hãng · Giao nhanh';
                                if (sale != null && price != null) {
                                  final off = ((price as num) - (sale as num)).toInt();
                                  if (off > 0) subtitle = 'Giảm ${formatVnd(off)} · Trả góp 0%';
                                }
                                return _BannerSlide(
                                  image: p['thumbnail_url']?.toString() ?? '',
                                  title: p['name']?.toString() ?? '',
                                  subtitle: subtitle,
                                  onTap: () => context.push('/product/${p['slug']}'),
                                );
                              }).toList(),
                            ),
                    ),
                  ),
                ),
              ),
              loading: () => const SliverToBoxAdapter(
                child: SizedBox(
                  height: 168,
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: LoadingShimmer(count: 1),
                  ),
                ),
              ),
              error: (_, __) => const SliverToBoxAdapter(child: _FallbackBanner()),
            ),
            SliverToBoxAdapter(
              child: SectionHeader(
                title: 'Danh mục',
                subtitle: 'Thương hiệu nổi bật',
              ),
            ),
            categories.when(
              data: (cats) => SliverToBoxAdapter(
                child: SizedBox(
                  height: 100,
                  child: ListView.separated(
                    padding: screenPadding(context),
                    scrollDirection: Axis.horizontal,
                    itemCount: cats.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 12),
                    itemBuilder: (_, i) {
                      final c = cats[i];
                      return _CategoryChip(
                        name: c['name'] ?? '',
                        imageUrl: c['image_url'],
                        onTap: () => context.push(
                          '/products?category_id=${c['id']}&title=${Uri.encodeComponent(c['name'] ?? '')}',
                        ),
                      );
                    },
                  ),
                ),
              ),
              loading: () => const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: LinearProgressIndicator(color: AppColors.primary),
                ),
              ),
              error: (_, __) => const SliverToBoxAdapter(child: SizedBox()),
            ),
            SliverToBoxAdapter(
              child: SectionHeader(
                title: 'Nổi bật tuần này',
                onSeeAll: () => context.push('/products?title=Sản phẩm nổi bật'),
              ),
            ),
            featured.when(
              data: (products) => _productStripSliver(context, products),
              loading: () => SliverToBoxAdapter(
                child: SizedBox(
                  height: homeProductStripHeight(context),
                  child: const LoadingShimmer(count: 2),
                ),
              ),
              error: (e, _) => SliverToBoxAdapter(
                child: AsyncErrorView(
                  error: e,
                  onRetry: () => ref.invalidate(featuredProductsProvider),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: SectionHeader(
                title: 'Hàng mới về',
                onSeeAll: () => context.push(
                  '/products?title=${Uri.encodeComponent('Hàng mới về')}&sort=newest',
                ),
              ),
            ),
            newest.when(
              data: (products) => _productStripSliver(context, products),
              loading: () => SliverToBoxAdapter(
                child: SizedBox(
                  height: homeProductStripHeight(context),
                  child: const LoadingShimmer(count: 2),
                ),
              ),
              error: (e, _) => SliverToBoxAdapter(
                child: AsyncErrorView(
                  error: e,
                  onRetry: () => ref.invalidate(newestProductsProvider),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: SizedBox(height: 72 + MediaQuery.paddingOf(context).bottom),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _BottomNav(
        index: _navIndex,
        onChanged: (i) => setState(() => _navIndex = i),
        isLoggedIn: isLoggedIn,
      ),
    );
  }

  Widget _buildAltTab() {
    final isLoggedIn = ref.watch(authProvider).isAuthenticated;
    if (_navIndex == 1) {
      if (!isLoggedIn) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          goToLogin(context, returnPath: '/orders');
          setState(() => _navIndex = 0);
        });
        return const Scaffold(body: SizedBox());
      }
      return const OrderListScreen();
    }
    return const ProfileScreen();
  }

  Widget _productStripSliver(BuildContext context, List<Map<String, dynamic>> products) {
    if (products.isEmpty) {
      return const SliverToBoxAdapter(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Center(child: Text('Chưa có sản phẩm')),
        ),
      );
    }
    final stripH = homeProductStripHeight(context);
    final cardW = homeProductCardWidth(context);
    final pad = screenPadding(context);

    return SliverToBoxAdapter(
      child: SizedBox(
        height: stripH,
        child: ListView.separated(
          padding: EdgeInsets.fromLTRB(pad.left, 0, pad.right, 8),
          scrollDirection: Axis.horizontal,
          itemCount: products.length,
          separatorBuilder: (_, __) => const SizedBox(width: 12),
          itemBuilder: (_, i) => SizedBox(
            width: cardW,
            height: stripH,
            child: ProductCard(
              product: products[i],
              onTap: () => context.push('/product/${products[i]['slug']}'),
            ),
          ),
        ),
      ),
    );
  }
}

class _HomeHeader extends StatelessWidget {
  const _HomeHeader({required this.cartCount, required this.isLoggedIn});
  final int cartCount;
  final bool isLoggedIn;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: AppColors.gradientPrimary,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(32),
          bottomRight: Radius.circular(32),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 16, 16, 32),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isLoggedIn ? 'Xin chào 👋' : 'Chào mừng đến',
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 13, fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'DOSUONE',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ],
                ),
              ),
              _HeaderIcon(
                icon: Icons.notifications_outlined,
                onTap: () {
                  if (isLoggedIn) {
                    context.push('/notifications');
                  } else {
                    goToLogin(context, returnPath: '/notifications');
                  }
                },
              ),
              const SizedBox(width: 12),
              _HeaderIcon(
                icon: Icons.shopping_bag_outlined,
                badge: cartCount > 0 ? cartCount : null,
                onTap: () => context.push('/cart'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _HeaderIcon extends StatelessWidget {
  const _HeaderIcon({required this.icon, required this.onTap, this.badge});
  final IconData icon;
  final VoidCallback onTap;
  final int? badge;

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Material(
          color: Colors.white.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(12),
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(12),
            child: SizedBox(
              width: 44,
              height: 44,
              child: Icon(icon, color: Colors.white),
            ),
          ),
        ),
        if (badge != null)
          Positioned(
            right: -2,
            top: -2,
            child: Container(
              padding: const EdgeInsets.all(4),
              constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
              decoration: const BoxDecoration(
                color: AppColors.sale,
                shape: BoxShape.circle,
              ),
              child: Text(
                '$badge',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
              ),
            ),
          ),
      ],
    );
  }
}

class _BannerSlide extends StatelessWidget {
  const _BannerSlide({
    required this.image,
    required this.title,
    required this.subtitle,
    this.onTap,
  });
  final String image;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Stack(
        fit: StackFit.expand,
        children: [
          AppNetworkImage(url: image, fit: BoxFit.cover, width: double.infinity, height: double.infinity),
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  Colors.black.withValues(alpha: 0.75),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(subtitle, style: const TextStyle(color: Colors.white70, fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FallbackBanner extends StatelessWidget {
  const _FallbackBanner();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 168,
      margin: const EdgeInsets.symmetric(horizontal: 24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 15,
            offset: const Offset(0, 10),
          ),
        ],
        image: const DecorationImage(
          image: AssetImage('assets/images/banner_fallback.png'),
          fit: BoxFit.cover,
        ),
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  const _CategoryChip({required this.name, this.imageUrl, required this.onTap});
  final String name;
  final String? imageUrl;
  final VoidCallback onTap;

  IconData _getIcon() {
    final n = name.toLowerCase();
    if (n.contains('apple') || n.contains('iphone')) return FontAwesomeIcons.apple;
    if (n.contains('samsung') || n.contains('android') || n.contains('xiaomi')) return FontAwesomeIcons.android;
    if (n.contains('laptop') || n.contains('macbook')) return FontAwesomeIcons.laptop;
    if (n.contains('watch')) return FontAwesomeIcons.clock;
    if (n.contains('tai nghe') || n.contains('airpod')) return FontAwesomeIcons.headphones;
    return FontAwesomeIcons.mobileScreen;
  }

  @override
  Widget build(BuildContext context) {
    final icon = _getIcon();

    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 76,
        child: Column(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: AppColors.surface,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.08),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
                border: Border.all(color: AppColors.cardBorder, width: 1),
              ),
              alignment: Alignment.center,
              child: FaIcon(
                icon,
                size: 28,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
            ),
          ],
        ),
      ),
    );
  }
}

class _BottomNav extends StatelessWidget {
  const _BottomNav({
    required this.index,
    required this.onChanged,
    required this.isLoggedIn,
  });
  final int index;
  final ValueChanged<int> onChanged;
  final bool isLoggedIn;

  @override
  Widget build(BuildContext context) {
    return NavigationBar(
      selectedIndex: index,
      onDestinationSelected: onChanged,
      destinations: const [
        NavigationDestination(
          icon: Icon(Icons.home_outlined),
          selectedIcon: Icon(Icons.home_rounded),
          label: 'Trang chủ',
        ),
        NavigationDestination(
          icon: Icon(Icons.receipt_long_outlined),
          selectedIcon: Icon(Icons.receipt_long_rounded),
          label: 'Đơn hàng',
        ),
        NavigationDestination(
          icon: Icon(Icons.person_outline_rounded),
          selectedIcon: Icon(Icons.person_rounded),
          label: 'Tài khoản',
        ),
      ],
    );
  }
}
