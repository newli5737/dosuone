class ApiConstants {
  // Production VPS
  static const baseUrl = 'https://api-one.dosutech.site/api/v1';
  // Dev local: http://localhost:3000/api/v1 | Emulator: http://10.0.2.2:3000/api/v1
  // Dev máy thật LAN: http://<IP-máy-dev>:3000/api/v1

  static const authRegister = '/auth/register';
  static const authLogin = '/auth/login';
  static const authRefresh = '/auth/refresh';
  static const authLogout = '/auth/logout';
  static const authMe = '/auth/me';

  static const categories = '/categories';
  static const products = '/products';
  static const productsFeatured = '/products/featured';
  static const cart = '/cart';
  static const orders = '/orders';
  static const wishlist = '/wishlist';
  static const addresses = '/addresses';
  static const notifications = '/notifications';
  static const notificationsUnread = '/notifications/unread-count';
}
