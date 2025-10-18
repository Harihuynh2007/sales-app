# 🛍️ HỆ THỐNG QUẢN LÝ BÁN HÀNG

Ứng dụng Full-stack CRUD sử dụng Node.js + Express + MySQL + HTML/JavaScript

## 📋 YÊU CẦU HỆ THỐNG

- Node.js (v14 trở lên)
- MySQL Server (hoặc XAMPP/WAMP)
- Trình duyệt web hiện đại

## 🚀 HƯỚNG DẪN CÀI ĐẶT

### Bước 1: Tạo Database

```bash
# Mở MySQL Command Line hoặc phpMyAdmin
mysql -u root -p

# Import file SQL
source database/sales_management.sql
```

**Hoặc dùng phpMyAdmin:**
1. Mở http://localhost/phpmyadmin
2. Click "Import"
3. Chọn file `database/sales_management.sql`
4. Click "Go"

### Bước 2: Cài đặt Dependencies

```bash
npm install
```

### Bước 3: Cấu hình Database (nếu cần)

Mở file `server.js` và sửa thông tin kết nối MySQL (dòng 7-10):

```javascript
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',           // Đổi username
    password: '',           // Thêm password nếu có
    database: 'sales_management'
});
```

### Bước 4: Chạy Back-End Server

```bash
node server.js
```

Hoặc dùng nodemon (tự động restart khi code thay đổi):

```bash
npm run dev
```

**Kết quả:** Server chạy tại `http://localhost:3000`

### Bước 5: Mở Front-End

- Double click vào file `products.html` để mở trình duyệt
- Hoặc dùng Live Server trong VS Code
- Hoặc mở trực tiếp: `file:///path/to/products.html`

## 📂 CẤU TRÚC PROJECT

```
sales-app/
├── database/
│   └── sales_management.sql    # SQL Script
├── server.js                   # Back-End API
├── package.json               # Dependencies
├── products.html              # Quản lý Sản phẩm
├── customers.html             # Quản lý Khách hàng
├── orders.html                # Quản lý Đơn hàng
└── README.md                  # File này
```

## 🎯 CHỨC NĂNG

### 1. Quản Lý Sản Phẩm (products.html)
- Thêm sản phẩm mới
- Sửa thông tin sản phẩm
- Xóa sản phẩm
- Hiển thị danh sách sản phẩm

### 2. Quản Lý Khách Hàng (customers.html)
- Thêm khách hàng mới
- Cập nhật thông tin khách hàng
- Xóa khách hàng
- Hiển thị danh sách khách hàng

### 3. Quản Lý Đơn Hàng (orders.html)
- Tạo đơn hàng mới
- Cập nhật trạng thái đơn hàng
- Hủy đơn hàng
- Hiển thị danh sách đơn hàng

## 🔌 API ENDPOINTS

### Products
- `GET /api/products` - Lấy tất cả sản phẩm
- `GET /api/products/:id` - Lấy 1 sản phẩm
- `POST /api/products` - Thêm sản phẩm mới
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

### Customers
- `GET /api/customers` - Lấy tất cả khách hàng
- `POST /api/customers` - Thêm khách hàng mới
- `PUT /api/customers/:id` - Cập nhật khách hàng
- `DELETE /api/customers/:id` - Xóa khách hàng

### Orders
- `GET /api/orders` - Lấy tất cả đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `PUT /api/orders/:id` - Cập nhật đơn hàng
- `DELETE /api/orders/:id` - Xóa đơn hàng

## 🐛 XỬ LÝ LỖI

### Lỗi: "MySQL Connection Failed"
- Kiểm tra MySQL đang chạy
- Kiểm tra username/password trong `server.js`
- Kiểm tra database đã import chưa

### Lỗi: "Port 3000 already in use"
Đổi PORT trong `server.js`:
```javascript
const PORT = 3001; // Đổi sang port khác
```

### Lỗi: "Cannot GET /api/products"
- Kiểm tra server đã chạy chưa: `node server.js`
- Kiểm tra URL trong file HTML: `http://localhost:3000`

### Lỗi: CORS
- Đã xử lý sẵn trong code
- Nếu vẫn lỗi, cài extension "Allow CORS" trên Chrome

## 📊 DỮ LIỆU MẪU

Database đã có sẵn dữ liệu mẫu:
- 3 văn phòng (Hà Nội, TP.HCM, Đà Nẵng)
- 5 nhân viên
- 3 khách hàng
- 5 sản phẩm
- 3 đơn hàng

## 🛠️ CÔNG NGHỆ SỬ DỤNG

- **Back-End:** Node.js + Express.js
- **Database:** MySQL
- **Front-End:** HTML5 + CSS3 + JavaScript (Vanilla)
- **API:** RESTful API

## 📝 GHI CHÚ

- Ứng dụng chạy ở môi trường development
- Chưa có authentication/authorization
- Phù hợp cho mục đích học tập và demo

## 👨‍💻 TÁC GIẢ

[Tên của bạn]
[Email/Contact]

## 📄 LICENSE

MIT License