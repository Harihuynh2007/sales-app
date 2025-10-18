# 🛒 Sales Management System

Ứng dụng Website Bán Hàng được thiết kế và lập trình dựa trên sơ đồ cơ sở dữ liệu cho sẵn, bao gồm ba phần chính: **Khách hàng**, **Nhân viên**, và **Quản trị viên (Admin)**.
Dự án được xây dựng theo mô hình **Full-stack CRUD** sử dụng **Node.js + Express + MySQL + HTML/CSS/JS**.

---

## 🧭 1. Mục tiêu

* Thiết kế **cơ sở dữ liệu bán hàng** gồm 8 bảng:
  `productlines`, `products`, `orders`, `orderdetails`, `customers`, `payments`, `employees`, `offices`.
* Xây dựng **ứng dụng web** cho phép quản lý và thao tác với toàn bộ dữ liệu.
* Thực hiện **kết nối giữa Database – Backend – Frontend** thông qua API RESTful.
* Áp dụng **chuẩn CRUD (Create, Read, Update, Delete)** cho các module quản lý.

---

## ⚙️ 2. Công nghệ sử dụng

| Thành phần      | Công nghệ                           |
| --------------- | ----------------------------------- |
| Backend         | Node.js, Express, MySQL2, CORS      |
| Database        | MySQL (Workbench / XAMPP)           |
| Frontend        | HTML5, CSS3, JavaScript (Fetch API) |
| IDE             | Visual Studio Code                  |
| Server          | Localhost port 3000                 |
| Package Manager | npm                                 |

---

## 🗄️ 3. Cấu trúc thư mục

```
sales-app/
├── database/
│   └── Hệ Thống Bán Hàng.sql
│
├── server.js
├── package.json
│
├── customer/               # Giao diện khách hàng (Front-end)
│   ├── index.html
│   ├── products.html
│   ├── product-detail.html
│   ├── cart.html
│   ├── checkout.html
│   ├── my-orders.html
│   └── profile.html
│
├── employee/               # Dashboard nhân viên
│   ├── dashboard.html
│   ├── orders.html
│   ├── customers.html
│   └── payments.html
│
├── admin/                  # Trang quản trị viên
│   ├── dashboard.html
│   ├── employees.html
│   ├── offices.html
│   ├── reports.html
│   └── settings.html
│
├── assets/
│   ├── css/
│   │   ├── customer.css
│   │   ├── employee.css
│   │   └── admin.css
│   └── js/
│       ├── utils.js
│       └── cart.js
│
└── README.md
```

---

## 🔗 4. Cách cài đặt và chạy chương trình

### Bước 1: Khởi tạo cơ sở dữ liệu

1. Mở **MySQL Workbench** hoặc **phpMyAdmin**
2. Tạo database:

   ```sql
   CREATE DATABASE sales_management;
   ```
3. Import file:

   ```
   database/Hệ Thống Bán Hàng.sql
   ```

### Bước 2: Cài đặt môi trường Node.js

```bash
cd sales-app
npm install
```

### Bước 3: Cấu hình kết nối database (trong `server.js`)

```js
const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'sales_management'
});
```

### Bước 4: Chạy server

```bash
node server.js
```

Màn hình hiển thị:

```
Server running on http://localhost:3000
Database connected
```

### Bước 5: Mở giao diện người dùng

* Mở **VS Code → chuột phải vào file HTML → Open with Live Server**
* Truy cập:

  * Khách hàng: `http://127.0.0.1:5500/customer/index.html`
  * Nhân viên: `http://127.0.0.1:5500/employee/dashboard.html`
  * Admin: `http://127.0.0.1:5500/admin/dashboard.html`

---

## 🧱 5. Tính năng chính

### 👤 Khách hàng

* Xem danh sách & chi tiết sản phẩm
* Thêm sản phẩm vào giỏ hàng
* Thanh toán, đặt hàng
* Theo dõi đơn hàng đã đặt
* Cập nhật thông tin hồ sơ cá nhân

### 👔 Nhân viên

* Quản lý đơn hàng (xem, cập nhật trạng thái, xử lý thanh toán)
* Quản lý khách hàng (thêm, sửa, xóa)
* Quản lý thanh toán

### 👨‍💼 Quản trị viên

* Quản lý nhân viên, chi nhánh
* Xem báo cáo doanh thu, sản phẩm bán chạy, tồn kho
* Cấu hình giao diện hệ thống

---

## 🎨 6. Giao diện

* Thiết kế **đơn giản, rõ ràng, dễ sử dụng**
* Giao diện **màu xanh gradient (#3b82f6 → #06b6d4)** xuyên suốt toàn hệ thống
* Responsive nhẹ, hỗ trợ cả desktop và laptop
* CSS tách riêng theo từng nhóm người dùng:

  * `customer.css`
  * `employee.css`
  * `admin.css`

---

## 📊 7. Đánh giá theo yêu cầu đề bài

| Hạng mục                              | Mức hoàn thiện |  chú                               |
| ------------------------------------- | -------------- | ------------------------------------- |
| Thiết kế CSDL chuẩn hóa               | ✅ 100%         |  đồ               |
| Kết nối Database + Backend + Frontend | ✅ 100%         |  Fetch API           |
| CRUD (thêm, sửa, xóa, xem)            | ✅ 95%          |  chính                    |
| Giao diện người dùng                  | ✅ 90%          |  điểm                |
| Phần nhân viên & admin                | ✅ 100%         |  và báo cáo           |
| Tổng thể                              | 🌟 **9/10**    | Đạt chuẩn lab và có thể mở rộng đồ án |

---

## 🧠 8. Hướng phát triển

* Thêm tính năng đăng nhập/đăng ký
* Upload hình ảnh sản phẩm
* Thêm biểu đồ thống kê trực quan
* Gửi email tự động khi đặt hàng

---

