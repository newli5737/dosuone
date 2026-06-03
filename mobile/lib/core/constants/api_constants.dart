class ApiConstants {
  // Máy thật (cùng WiFi): IP máy dev | Emulator: 10.0.2.2 | Desktop: localhost
  static const baseUrl = 'http://192.168.1.52:3000/api/v1';

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
