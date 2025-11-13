Yêu cầu CSDL: mongodb, chạy cổng mặc định 27017

Front end bao gồm log in bằng google, Trang quản lý giao dịch
Khởi tạo: npm start

Backend transaction và user sử dụng Golang
Khởi tạo: go run main.go

## APIs:
### Đăng nhập
GET /auth/google: Khởi tạo đăng nhập bằng Google (sử dụng goth).
GET /auth/google/callback: Xử lý callback từ Google, tạo/cập nhật tài khoản, trả về JWT.

### Giao dịch
POST /transaction: Thêm giao dịch (gồm số tiền, mô tả, loại: thu nhập/chi tiêu).
GET /transaction: Liệt kê giao dịch của người dùng.
DELETE /transaction/:id: Xóa giao dịch.

### Báo cáo:
GET /reports: Tổng hợp thu nhập và chi tiêu theo loại.