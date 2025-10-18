const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// ====================== DATABASE ======================
const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'sales_management',
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ MySQL Connected!');
});

const SECRET_KEY = 'sales_management_secret_key';

// ====================== MIDDLEWARE ======================
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

function checkRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    next();
  };
}

// ====================== AUTH ======================
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      officeCode,
      jobTitle,
    } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    const userRole = role || 'Customer';
    const office = officeCode || 'HCM01';
    const job = jobTitle || (userRole === 'Customer' ? 'Customer' : 'Sales Rep');

    db.query(
      'INSERT INTO employees (firstName, lastName, email, password, role, officeCode, jobTitle, extension) VALUES (?,?,?,?,?,?,?,?)',
      [firstName, lastName, email, hashed, userRole, office, job, 'x100'],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        // nếu là khách hàng → thêm record vào customers
        if (userRole === 'Customer') {
          db.query(
            'INSERT INTO customers (customerName, contactFirstName, contactLastName, phone, city, country) VALUES (?,?,?,?,?,?)',
            [`${firstName} ${lastName}`, firstName, lastName, '', '', ''],
            () => {}
          );
        }

        res.json({
          success: true,
          message: 'User registered successfully',
          id: result.insertId,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Sample accounts for demo
  const sampleUsers = [
    { id: 1, email: "admin@example.com", password: "123456", role: "Admin", firstName: "Admin", lastName: "User" },
    { id: 2, email: "sales@example.com", password: "123456", role: "Sales", firstName: "Sales", lastName: "Staff" },
    { id: 3, email: "customer@example.com", password: "123456", role: "Customer", firstName: "Customer", lastName: "Demo" }
  ];

  const sample = sampleUsers.find(u => u.email === email && u.password === password);
  if (sample) {
    const token = jwt.sign(
      { id: sample.id, role: sample.role, email: sample.email },
      SECRET_KEY,
      { expiresIn: '8h' }
    );
    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: sample.id,
        name: `${sample.firstName} ${sample.lastName}`,
        role: sample.role,
        email: sample.email
      }
    });
  }

  db.query('SELECT * FROM employees WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: 'User not found' });

    const user = results[0];
    const valid = await bcrypt.compare(password, user.password || '');
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.employeeNumber, role: user.role, email: user.email },
      SECRET_KEY,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.employeeNumber,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        email: user.email
      }
    });
  });
});

// ====================== PRODUCTS ======================
app.get('/api/products', (req, res) => {
  let query = 'SELECT * FROM products';
  const conditions = [];
  const params = [];

  if (req.query.productLine) {
    conditions.push('productLine = ?');
    params.push(req.query.productLine);
  }
  if (req.query.search) {
    conditions.push('(productName LIKE ? OR productCode LIKE ?)');
    params.push(`%${req.query.search}%`, `%${req.query.search}%`);
  }
  if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY productCode';

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/products/:id', (req, res) => {
  db.query('SELECT * FROM products WHERE productCode=?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

app.post('/api/products', verifyToken, checkRole('Admin', 'Sales'), (req, res) => {
  const { productCode, productName, productLine, productScale, productVendor, productDescription, quantityInStock, buyPrice, MSRP } = req.body;
  db.query('INSERT INTO products VALUES (?,?,?,?,?,?,?,?,?)',
    [productCode, productName, productLine, productScale || '', productVendor, productDescription, quantityInStock, buyPrice, MSRP],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Product created' });
    });
});

app.put('/api/products/:id', verifyToken, checkRole('Admin', 'Sales'), (req, res) => {
  const { productName, productLine, productScale, productVendor, productDescription, quantityInStock, buyPrice, MSRP } = req.body;
  db.query('UPDATE products SET productName=?, productLine=?, productScale=?, productVendor=?, productDescription=?, quantityInStock=?, buyPrice=?, MSRP=? WHERE productCode=?',
    [productName, productLine, productScale, productVendor, productDescription, quantityInStock, buyPrice, MSRP, req.params.id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Product updated' });
    });
});

app.delete('/api/products/:id', verifyToken, checkRole('Admin'), (req, res) => {
  db.query('DELETE FROM products WHERE productCode=?', [req.params.id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Product deleted' });
  });
});

// ====================== CUSTOMERS ======================
app.get('/api/customers', verifyToken, checkRole('Admin', 'Sales'), (req, res) => {
  db.query('SELECT * FROM customers ORDER BY customerNumber', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/customers/:id', verifyToken, (req, res) => {
  db.query('SELECT * FROM customers WHERE customerNumber=?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

app.post('/api/customers', verifyToken, checkRole('Admin', 'Sales'), (req, res) => {
  const { customerName, contactFirstName, contactLastName, phone, addressLine1, city, country } = req.body;
  db.query('INSERT INTO customers (customerName, contactFirstName, contactLastName, phone, addressLine1, city, country) VALUES (?,?,?,?,?,?,?)',
    [customerName, contactFirstName, contactLastName, phone, addressLine1, city, country],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Customer created', id: result.insertId });
    });
});

app.put('/api/customers/:id', verifyToken, (req, res) => {
  const { customerName, contactLastName, contactFirstName, phone, addressLine1, city, country } = req.body;
  db.query('UPDATE customers SET customerName=?, contactLastName=?, contactFirstName=?, phone=?, addressLine1=?, city=?, country=? WHERE customerNumber=?',
    [customerName, contactLastName, contactFirstName, phone, addressLine1, city, country, req.params.id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Customer updated' });
    });
});

// ====================== ORDERS ======================
app.get('/api/orders', verifyToken, checkRole('Admin', 'Sales'), (req, res) => {
  const query = `SELECT o.*, c.customerName,
                (SELECT SUM(quantityOrdered * priceEach) FROM orderdetails WHERE orderNumber=o.orderNumber) as totalAmount
                FROM orders o LEFT JOIN customers c ON o.customerNumber=c.customerNumber
                ORDER BY o.orderNumber DESC`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/orders', verifyToken, (req, res) => {
  const { orderDate, requiredDate, shippedDate, status, comments, customerNumber, items } = req.body;
  db.beginTransaction(err => {
    if (err) return res.status(500).json({ error: err.message });

    db.query('INSERT INTO orders (orderDate, requiredDate, shippedDate, status, comments, customerNumber) VALUES (?,?,?,?,?,?)',
      [orderDate, requiredDate, shippedDate, status, comments, customerNumber],
      (err, result) => {
        if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
        const orderNumber = result.insertId;

        if (!items || items.length === 0) return db.commit(() => res.json({ success: true, orderNumber }));

        const values = items.map((item, i) => [
          orderNumber,
          item.productCode,
          item.quantity,
          item.price,
          i + 1
        ]);

        db.query('INSERT INTO orderdetails (orderNumber, productCode, quantityOrdered, priceEach, orderLineNumber) VALUES ?',
          [values], err => {
            if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
            db.commit(() => res.json({ success: true, message: 'Order created', orderNumber }));
          });
      });
  });
});

// cập nhật trạng thái đơn hàng riêng
app.put('/api/orders/:id', verifyToken, checkRole('Admin', 'Sales'), (req, res) => {
  const { status } = req.body;
  db.query('UPDATE orders SET status=? WHERE orderNumber=?', [status, req.params.id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Order status updated' });
  });
});

// ====================== PAYMENTS ======================
app.get('/api/payments', verifyToken, checkRole('Admin', 'Sales'), (req, res) => {
  const query = `SELECT p.*, c.customerName FROM payments p
                 LEFT JOIN customers c ON p.customerNumber=c.customerNumber
                 ORDER BY p.paymentDate DESC`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/payments/customer/:id', verifyToken, (req, res) => {
  db.query('SELECT * FROM payments WHERE customerNumber=? ORDER BY paymentDate DESC',
    [req.params.id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
});

app.post('/api/payments', verifyToken, checkRole('Admin', 'Sales'), (req, res) => {
  const { customerNumber, checkNumber, paymentDate, amount } = req.body;
  db.query('INSERT INTO payments VALUES (?,?,?,?)',
    [customerNumber, checkNumber, paymentDate, amount],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Payment recorded' });
    });
});

// ====================== EMPLOYEES ======================
app.get('/api/employees', verifyToken, checkRole('Admin', 'Sales'), (req, res) => {
  db.query('SELECT * FROM employees', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/employees/:id', verifyToken, checkRole('Admin'), (req, res) => {
  db.query('SELECT * FROM employees WHERE employeeNumber=?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

app.put('/api/employees/:id', verifyToken, checkRole('Admin'), (req, res) => {
  const { firstName, lastName, email, jobTitle, officeCode, role } = req.body;
  db.query('UPDATE employees SET firstName=?, lastName=?, email=?, jobTitle=?, officeCode=?, role=? WHERE employeeNumber=?',
    [firstName, lastName, email, jobTitle, officeCode, role, req.params.id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Employee updated' });
    });
});

app.delete('/api/employees/:id', verifyToken, checkRole('Admin'), (req, res) => {
  db.query('DELETE FROM employees WHERE employeeNumber=?', [req.params.id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Employee deleted' });
  });
});

// ====================== OFFICES ======================
app.get('/api/offices', verifyToken, checkRole('Admin', 'Sales'), (req, res) => {
  db.query('SELECT * FROM offices ORDER BY officeCode', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/offices', verifyToken, checkRole('Admin'), (req, res) => {
  const { officeCode, city, phone, addressLine1, addressLine2, state, country, postalCode, territory } = req.body;
  db.query('INSERT INTO offices VALUES (?,?,?,?,?,?,?,?,?)',
    [officeCode, city, phone, addressLine1, addressLine2 || '', state || '', country, postalCode || '', territory || ''],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Office created' });
    });
});

// ✅ thêm PUT /offices/:id cho FE
app.put('/api/offices/:id', verifyToken, checkRole('Admin'), (req, res) => {
  const { city, phone, addressLine1, addressLine2, state, country, postalCode, territory } = req.body;
  db.query('UPDATE offices SET city=?, phone=?, addressLine1=?, addressLine2=?, state=?, country=?, postalCode=?, territory=? WHERE officeCode=?',
    [city, phone, addressLine1, addressLine2 || '', state || '', country, postalCode || '', territory || '', req.params.id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Office updated' });
    });
});

// ====================== REPORTS / DASHBOARD ======================
app.get('/api/dashboard/stats', verifyToken, checkRole('Admin', 'Sales'), (req, res) => {
  const queries = {
    totalOrders: 'SELECT COUNT(*) as totalOrders FROM orders',
    totalRevenue: 'SELECT SUM(quantityOrdered * priceEach) as totalRevenue FROM orderdetails od JOIN orders o ON od.orderNumber=o.orderNumber WHERE o.status="Shipped"',
    totalCustomers: 'SELECT COUNT(*) as totalCustomers FROM customers',
    totalStock: 'SELECT SUM(quantityInStock) as totalStock FROM products'
  };

  const results = {};
  let completed = 0;
  Object.keys(queries).forEach(key => {
    db.query(queries[key], (err, result) => {
      if (!err) results[key] = result[0][key] || result[0].totalRevenue || 0;
      completed++;
      if (completed === Object.keys(queries).length) res.json(results);
    });
  });
});

app.get('/api/reports/top-products', verifyToken, checkRole('Admin', 'Sales'), (req, res) => {
  const query = `SELECT p.productName, SUM(od.quantityOrdered) as totalQuantity, SUM(od.quantityOrdered * od.priceEach) as totalRevenue
                 FROM orderdetails od JOIN products p ON od.productCode=p.productCode
                 GROUP BY p.productCode, p.productName
                 ORDER BY totalQuantity DESC LIMIT 10`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ====================== START SERVER ======================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
