-- ============================================
-- HỆ THỐNG QUẢN LÝ BÁN HÀNG - SALES MANAGEMENT SYSTEM
-- Tạo bởi: Claude AI Assistant
-- Ngày: 18/10/2025
-- Mô tả: Database hoàn chỉnh cho ứng dụng bán hàng
-- ============================================

-- Xóa database cũ nếu tồn tại
DROP DATABASE IF EXISTS sales_management;

-- Tạo database mới
CREATE DATABASE sales_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sử dụng database
USE sales_management;

-- ============================================
-- 1. BẢNG OFFICES (VĂN PHÒNG)
-- ============================================
CREATE TABLE offices (
    officeCode VARCHAR(10) NOT NULL PRIMARY KEY,
    city VARCHAR(50) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    addressLine1 VARCHAR(50) NOT NULL,
    addressLine2 VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50) NOT NULL,
    postalCode VARCHAR(15) NOT NULL,
    territory VARCHAR(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. BẢNG EMPLOYEES (NHÂN VIÊN)
-- ============================================
CREATE TABLE employees (
    employeeNumber INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    lastName VARCHAR(50) NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    extension VARCHAR(10) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    officeCode VARCHAR(10) NOT NULL,
    reportsTo INT,
    jobTitle VARCHAR(50) NOT NULL,
    
    -- Khóa ngoại
    CONSTRAINT fk_employees_offices 
        FOREIGN KEY (officeCode) REFERENCES offices(officeCode)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    
    CONSTRAINT fk_employees_reportsTo 
        FOREIGN KEY (reportsTo) REFERENCES employees(employeeNumber)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. BẢNG CUSTOMERS (KHÁCH HÀNG)
-- ============================================
CREATE TABLE customers (
    customerNumber INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    customerName VARCHAR(50) NOT NULL,
    contactLastName VARCHAR(50) NOT NULL,
    contactFirstName VARCHAR(50) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    addressLine1 VARCHAR(50) NOT NULL,
    addressLine2 VARCHAR(50),
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50),
    postalCode VARCHAR(15),
    country VARCHAR(50) NOT NULL,
    salesRepEmployeeNumber INT,
    creditLimit DECIMAL(10,2),
    
    -- Khóa ngoại
    CONSTRAINT fk_customers_employees 
        FOREIGN KEY (salesRepEmployeeNumber) REFERENCES employees(employeeNumber)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 4. BẢNG PRODUCTLINES (DÒNG SẢN PHẨM)
-- ============================================
CREATE TABLE productLines (
    productLine VARCHAR(50) NOT NULL PRIMARY KEY,
    textDescription VARCHAR(4000),
    htmlDescription TEXT,
    image MEDIUMBLOB
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 5. BẢNG PRODUCTS (SẢN PHẨM)
-- ============================================
CREATE TABLE products (
    productCode VARCHAR(15) NOT NULL PRIMARY KEY,
    productName VARCHAR(70) NOT NULL,
    productLine VARCHAR(50) NOT NULL,
    productScale VARCHAR(10) NOT NULL,
    productVendor VARCHAR(50) NOT NULL,
    productDescription TEXT NOT NULL,
    quantityInStock SMALLINT NOT NULL,
    buyPrice DECIMAL(10,2) NOT NULL,
    MSRP DECIMAL(10,2) NOT NULL,
    
    -- Khóa ngoại
    CONSTRAINT fk_products_productLines 
        FOREIGN KEY (productLine) REFERENCES productLines(productLine)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    
    -- Ràng buộc
    CONSTRAINT chk_quantityInStock CHECK (quantityInStock >= 0),
    CONSTRAINT chk_buyPrice CHECK (buyPrice >= 0),
    CONSTRAINT chk_MSRP CHECK (MSRP >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 6. BẢNG ORDERS (ĐơN HÀNG)
-- ============================================
CREATE TABLE orders (
    orderNumber INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    orderDate DATE NOT NULL,
    requiredDate DATE NOT NULL,
    shippedDate DATE,
    status VARCHAR(15) NOT NULL,
    comments TEXT,
    customerNumber INT NOT NULL,
    
    -- Khóa ngoại
    CONSTRAINT fk_orders_customers 
        FOREIGN KEY (customerNumber) REFERENCES customers(customerNumber)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    
    -- Ràng buộc
    CONSTRAINT chk_status CHECK (status IN ('In Process', 'Shipped', 'Cancelled', 'Resolved', 'On Hold', 'Disputed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 7. BẢNG ORDERDETAILS (CHI TIẾT ĐƠN HÀNG)
-- ============================================
CREATE TABLE orderdetails (
    orderNumber INT NOT NULL,
    productCode VARCHAR(15) NOT NULL,
    quantityOrdered INT NOT NULL,
    priceEach DECIMAL(10,2) NOT NULL,
    orderLineNumber SMALLINT NOT NULL,
    
    -- Khóa chính kết hợp
    PRIMARY KEY (orderNumber, productCode),
    
    -- Khóa ngoại
    CONSTRAINT fk_orderdetails_orders 
        FOREIGN KEY (orderNumber) REFERENCES orders(orderNumber)
        ON UPDATE CASCADE ON DELETE CASCADE,
    
    CONSTRAINT fk_orderdetails_products 
        FOREIGN KEY (productCode) REFERENCES products(productCode)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    
    -- Ràng buộc
    CONSTRAINT chk_quantityOrdered CHECK (quantityOrdered > 0),
    CONSTRAINT chk_priceEach CHECK (priceEach >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 8. BẢNG PAYMENTS (THANH TOÁN)
-- ============================================
CREATE TABLE payments (
    customerNumber INT NOT NULL,
    checkNumber VARCHAR(50) NOT NULL,
    paymentDate DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    
    -- Khóa chính kết hợp
    PRIMARY KEY (customerNumber, checkNumber),
    
    -- Khóa ngoại
    CONSTRAINT fk_payments_customers 
        FOREIGN KEY (customerNumber) REFERENCES customers(customerNumber)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    
    -- Ràng buộc
    CONSTRAINT chk_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TẠO INDEX ĐỂ TỐI ƯU HIỆU SUẤT
-- ============================================

-- Index cho bảng employees
CREATE INDEX idx_employees_officeCode ON employees(officeCode);
CREATE INDEX idx_employees_reportsTo ON employees(reportsTo);

-- Index cho bảng customers
CREATE INDEX idx_customers_salesRep ON customers(salesRepEmployeeNumber);
CREATE INDEX idx_customers_name ON customers(customerName);

-- Index cho bảng products
CREATE INDEX idx_products_productLine ON products(productLine);
CREATE INDEX idx_products_name ON products(productName);

-- Index cho bảng orders
CREATE INDEX idx_orders_customerNumber ON orders(customerNumber);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_orderDate ON orders(orderDate);

-- Index cho bảng orderdetails
CREATE INDEX idx_orderdetails_productCode ON orderdetails(productCode);

-- Index cho bảng payments
CREATE INDEX idx_payments_paymentDate ON payments(paymentDate);

-- ============================================
-- DỮ LIỆU MẪU - SAMPLE DATA
-- ============================================

-- 1. Thêm văn phòng
INSERT INTO offices VALUES 
('HN01', 'Hà Nội', '+84 24 3974 1234', '123 Đường Láng', 'Tầng 5', 'Hà Nội', 'Việt Nam', '100000', 'APAC'),
('HCM01', 'TP.HCM', '+84 28 3822 5678', '456 Nguyễn Huệ', 'Quận 1', 'TP.HCM', 'Việt Nam', '700000', 'APAC'),
('DN01', 'Đà Nẵng', '+84 236 3555 999', '789 Trần Phú', NULL, 'Đà Nẵng', 'Việt Nam', '550000', 'APAC');

-- 2. Thêm nhân viên
INSERT INTO employees (employeeNumber, lastName, firstName, extension, email, officeCode, reportsTo, jobTitle) VALUES
(1001, 'Nguyễn', 'Văn An', 'x101', 'vanan@company.vn', 'HN01', NULL, 'President'),
(1002, 'Trần', 'Thị Bình', 'x102', 'thibinh@company.vn', 'HCM01', 1001, 'VP Sales'),
(1003, 'Lê', 'Văn Cường', 'x103', 'vancuong@company.vn', 'HN01', 1002, 'Sales Rep'),
(1004, 'Phạm', 'Thị Dung', 'x104', 'thidung@company.vn', 'HCM01', 1002, 'Sales Rep'),
(1005, 'Hoàng', 'Văn Em', 'x105', 'vanem@company.vn', 'DN01', 1002, 'Sales Rep');

-- 3. Thêm khách hàng
INSERT INTO customers (customerNumber, customerName, contactLastName, contactFirstName, phone, addressLine1, addressLine2, city, state, postalCode, country, salesRepEmployeeNumber, creditLimit) VALUES
(101, 'Công ty ABC', 'Nguyễn', 'Minh', '0901234567', '12 Lý Thường Kiệt', NULL, 'Hà Nội', 'Hà Nội', '100000', 'Việt Nam', 1003, 50000.00),
(102, 'Công ty XYZ', 'Trần', 'Lan', '0912345678', '34 Lê Lợi', 'Quận 1', 'TP.HCM', 'TP.HCM', '700000', 'Việt Nam', 1004, 75000.00),
(103, 'Doanh nghiệp 123', 'Phạm', 'Hùng', '0923456789', '56 Trần Hưng Đạo', NULL, 'Đà Nẵng', 'Đà Nẵng', '550000', 'Việt Nam', 1005, 60000.00);

-- 4. Thêm dòng sản phẩm
INSERT INTO productLines VALUES
('Electronics', 'Các sản phẩm điện tử tiêu dùng', '<p>Điện thoại, laptop, tablet</p>', NULL),
('Clothing', 'Thời trang nam nữ', '<p>Quần áo, phụ kiện thời trang</p>', NULL),
('Home Appliances', 'Đồ gia dụng', '<p>Tủ lạnh, máy giặt, điều hòa</p>', NULL);

-- 5. Thêm sản phẩm
INSERT INTO products VALUES
('P001', 'iPhone 15 Pro Max', 'Electronics', '1:1', 'Apple Inc.', 'Điện thoại cao cấp', 50, 25000000, 30000000),
('P002', 'Samsung Galaxy S24', 'Electronics', '1:1', 'Samsung', 'Smartphone Android', 40, 20000000, 24000000),
('P003', 'MacBook Pro M3', 'Electronics', '1:1', 'Apple Inc.', 'Laptop chuyên nghiệp', 30, 35000000, 42000000),
('P004', 'Áo Polo Nam', 'Clothing', '1:1', 'Local Brand', 'Áo thời trang cao cấp', 100, 200000, 350000),
('P005', 'Tủ lạnh Inverter', 'Home Appliances', '1:10', 'LG', 'Tủ lạnh tiết kiệm điện', 20, 8000000, 10000000);

-- 6. Thêm đơn hàng
INSERT INTO orders (orderNumber, orderDate, requiredDate, shippedDate, status, comments, customerNumber) VALUES
(1001, '2025-10-01', '2025-10-10', '2025-10-08', 'Shipped', 'Giao hàng thành công', 101),
(1002, '2025-10-05', '2025-10-15', NULL, 'In Process', 'Đang xử lý', 102),
(1003, '2025-10-10', '2025-10-20', NULL, 'In Process', NULL, 103);

-- 7. Thêm chi tiết đơn hàng
INSERT INTO orderdetails VALUES
(1001, 'P001', 2, 30000000, 1),
(1001, 'P004', 5, 350000, 2),
(1002, 'P003', 1, 42000000, 1),
(1002, 'P002', 3, 24000000, 2),
(1003, 'P005', 2, 10000000, 1);

-- 8. Thêm thanh toán
INSERT INTO payments VALUES
(101, 'CHK001', '2025-10-08', 61750000),
(102, 'CHK002', '2025-10-12', 50000000);

-- ============================================
-- TẠO VIEW HỖ TRỢ (Optional)
-- ============================================

-- View: Doanh số theo nhân viên
CREATE VIEW sales_by_employee AS
SELECT 
    e.employeeNumber,
    CONCAT(e.firstName, ' ', e.lastName) AS employeeName,
    COUNT(DISTINCT o.orderNumber) AS totalOrders,
    SUM(od.quantityOrdered * od.priceEach) AS totalSales
FROM employees e
LEFT JOIN customers c ON e.employeeNumber = c.salesRepEmployeeNumber
LEFT JOIN orders o ON c.customerNumber = o.customerNumber
LEFT JOIN orderdetails od ON o.orderNumber = od.orderNumber
GROUP BY e.employeeNumber, employeeName;

-- View: Tồn kho sản phẩm
CREATE VIEW inventory_status AS
SELECT 
    p.productCode,
    p.productName,
    p.productLine,
    p.quantityInStock,
    COALESCE(SUM(od.quantityOrdered), 0) AS totalOrdered,
    p.quantityInStock - COALESCE(SUM(od.quantityOrdered), 0) AS availableStock
FROM products p
LEFT JOIN orderdetails od ON p.productCode = od.productCode
LEFT JOIN orders o ON od.orderNumber = o.orderNumber AND o.status IN ('In Process', 'On Hold')
GROUP BY p.productCode, p.productName, p.productLine, p.quantityInStock;

-- View: Tổng doanh thu theo tháng
CREATE VIEW monthly_revenue AS
SELECT 
    DATE_FORMAT(o.orderDate, '%Y-%m') AS month,
    COUNT(DISTINCT o.orderNumber) AS totalOrders,
    SUM(od.quantityOrdered * od.priceEach) AS revenue
FROM orders o
JOIN orderdetails od ON o.orderNumber = od.orderNumber
WHERE o.status = 'Shipped'
GROUP BY DATE_FORMAT(o.orderDate, '%Y-%m')
ORDER BY month DESC;

-- ============================================
-- STORED PROCEDURES (Optional - Nâng cao)
-- ============================================

DELIMITER //

-- Procedure: Tạo đơn hàng mới
CREATE PROCEDURE CreateNewOrder(
    IN p_customerNumber INT,
    IN p_orderDate DATE,
    IN p_requiredDate DATE,
    OUT p_orderNumber INT
)
BEGIN
    INSERT INTO orders (orderDate, requiredDate, status, customerNumber)
    VALUES (p_orderDate, p_requiredDate, 'In Process', p_customerNumber);
    
    SET p_orderNumber = LAST_INSERT_ID();
END //

-- Procedure: Thêm sản phẩm vào đơn hàng
CREATE PROCEDURE AddOrderDetail(
    IN p_orderNumber INT,
    IN p_productCode VARCHAR(15),
    IN p_quantity INT
)
BEGIN
    DECLARE v_price DECIMAL(10,2);
    DECLARE v_lineNumber SMALLINT;

    SELECT MSRP INTO v_price FROM products WHERE productCode = p_productCode;

    SELECT COALESCE(MAX(orderLineNumber), 0) + 1 INTO v_lineNumber
    FROM orderdetails WHERE orderNumber = p_orderNumber;

    INSERT INTO orderdetails VALUES (p_orderNumber, p_productCode, p_quantity, v_price, v_lineNumber);

    UPDATE products 
    SET quantityInStock = quantityInStock - p_quantity 
    WHERE productCode = p_productCode;
END;


DELIMITER ;

-- ============================================
-- HOÀN TẤT
-- ============================================
SELECT 'Database sales_management đã được tạo thành công!' AS Message;


