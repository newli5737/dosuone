class Validators {
  static String? email(String? v) {
    if (v == null || v.isEmpty) return 'Vui lòng nhập email';
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(v)) {
      return 'Email không hợp lệ';
    }
    return null;
  }

  static String? password(String? v) {
    if (v == null || v.length < 6) return 'Mật khẩu tối thiểu 6 ký tự';
    return null;
  }

  static String? required(String? v, [String label = 'Trường này']) {
    if (v == null || v.trim().isEmpty) return '$label không được để trống';
    return null;
  }
}
