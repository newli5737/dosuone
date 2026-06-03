/// Routes công khai — khách không cần đăng nhập.
const publicRoutes = {
  '/',
  '/onboarding',
  '/login',
  '/register',
  '/home',
  '/products',
  '/search',
  '/cart',
};

/// Routes bắt buộc đăng nhập (mua hàng, tài khoản...).
const authRequiredPrefixes = [
  '/checkout',
  '/orders',
  '/order/',
  '/address',
  '/wishlist',
  '/notifications',
];

bool isPublicRoute(String path) {
  if (publicRoutes.contains(path)) return true;
  if (path.startsWith('/product/')) return true;
  return false;
}

bool requiresAuth(String path) {
  if (isPublicRoute(path)) return false;
  return authRequiredPrefixes.any((p) => path == p || path.startsWith(p));
}
