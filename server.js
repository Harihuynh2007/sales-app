const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'sales_management'
});

db.connect(err => {
    if(err) throw err;
    console.log('MySQL Connected!');
});

// ============ PRODUCTS API ============
app.get('/api/products', (req, res) => {
    let query = 'SELECT * FROM products';
    const conditions = [];
    const params = [];

    if(req.query.productLine) {
        conditions.push('productLine = ?');
        params.push(req.query.productLine);
    }
    if(req.query.minPrice) {
        conditions.push('MSRP >= ?');
        params.push(req.query.minPrice);
    }
    if(req.query.maxPrice) {
        conditions.push('MSRP <= ?');
        params.push(req.query.maxPrice);
    }
    if(req.query.inStock) {
        conditions.push('quantityInStock > 0');
    }
    if(req.query.search) {
        conditions.push('(productName LIKE ? OR productCode LIKE ?)');
        params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }

    if(conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY productCode';

    db.query(query, params, (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

app.get('/api/products/:id', (req, res) => {
    db.query('SELECT * FROM products WHERE productCode = ?', [req.params.id], (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results[0]);
    });
});

app.post('/api/products', (req, res) => {
    const {productCode, productName, productLine, productScale, productVendor, 
           productDescription, quantityInStock, buyPrice, MSRP} = req.body;
    db.query('INSERT INTO products VALUES (?,?,?,?,?,?,?,?,?)', 
        [productCode, productName, productLine, productScale, productVendor, 
         productDescription, quantityInStock, buyPrice, MSRP], 
        (err, result) => {
            if(err) return res.status(500).json({error: err.message});
            res.json({success: true, message: 'Product created'});
        }
    );
});

app.put('/api/products/:id', (req, res) => {
    const {productName, productLine, productScale, productVendor, 
           productDescription, quantityInStock, buyPrice, MSRP} = req.body;
    db.query('UPDATE products SET productName=?, productLine=?, productScale=?, productVendor=?, productDescription=?, quantityInStock=?, buyPrice=?, MSRP=? WHERE productCode=?',
        [productName, productLine, productScale, productVendor, productDescription, 
         quantityInStock, buyPrice, MSRP, req.params.id],
        (err, result) => {
            if(err) return res.status(500).json({error: err.message});
            res.json({success: true, message: 'Product updated'});
        }
    );
});

app.delete('/api/products/:id', (req, res) => {
    db.query('DELETE FROM products WHERE productCode = ?', [req.params.id], (err, result) => {
        if(err) return res.status(500).json({error: err.message});
        res.json({success: true, message: 'Product deleted'});
    });
});

// ============ CUSTOMERS API ============
app.get('/api/customers', (req, res) => {
    db.query('SELECT * FROM customers ORDER BY customerNumber', (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

app.get('/api/customers/:id', (req, res) => {
    db.query('SELECT * FROM customers WHERE customerNumber = ?', [req.params.id], (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results[0]);
    });
});

app.get('/api/customers/:id/orders', (req, res) => {
    db.query(`SELECT o.*, 
              (SELECT SUM(quantityOrdered * priceEach) FROM orderdetails WHERE orderNumber = o.orderNumber) as totalAmount
              FROM orders o WHERE customerNumber = ? ORDER BY orderDate DESC`, 
        [req.params.id], (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

app.post('/api/customers', (req, res) => {
    const {customerName, contactLastName, contactFirstName, phone, addressLine1, 
           addressLine2, city, state, postalCode, country, salesRepEmployeeNumber, creditLimit} = req.body;
    db.query('INSERT INTO customers (customerName, contactLastName, contactFirstName, phone, addressLine1, addressLine2, city, state, postalCode, country, salesRepEmployeeNumber, creditLimit) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        [customerName, contactLastName, contactFirstName, phone, addressLine1, 
         addressLine2, city, state, postalCode, country, salesRepEmployeeNumber, creditLimit],
        (err, result) => {
            if(err) return res.status(500).json({error: err.message});
            res.json({success: true, message: 'Customer created', id: result.insertId});
        }
    );
});

app.put('/api/customers/:id', (req, res) => {
    const {customerName, contactLastName, contactFirstName, phone, addressLine1, 
           addressLine2, city, state, postalCode, country, salesRepEmployeeNumber, creditLimit} = req.body;
    db.query('UPDATE customers SET customerName=?, contactLastName=?, contactFirstName=?, phone=?, addressLine1=?, addressLine2=?, city=?, state=?, postalCode=?, country=?, salesRepEmployeeNumber=?, creditLimit=? WHERE customerNumber=?',
        [customerName, contactLastName, contactFirstName, phone, addressLine1, 
         addressLine2, city, state, postalCode, country, salesRepEmployeeNumber, creditLimit, req.params.id],
        (err, result) => {
            if(err) return res.status(500).json({error: err.message});
            res.json({success: true, message: 'Customer updated'});
        }
    );
});

app.delete('/api/customers/:id', (req, res) => {
    db.query('DELETE FROM customers WHERE customerNumber = ?', [req.params.id], (err, result) => {
        if(err) return res.status(500).json({error: err.message});
        res.json({success: true, message: 'Customer deleted'});
    });
});

// ============ ORDERS API ============
app.get('/api/orders', (req, res) => {
    let query = `SELECT o.*, c.customerName,
                 (SELECT SUM(quantityOrdered * priceEach) FROM orderdetails WHERE orderNumber = o.orderNumber) as totalAmount
                 FROM orders o 
                 LEFT JOIN customers c ON o.customerNumber = c.customerNumber`;
    
    if(req.query.status) {
        query += ' WHERE o.status = ?';
        db.query(query + ' ORDER BY o.orderNumber DESC', [req.query.status], (err, results) => {
            if(err) return res.status(500).json({error: err.message});
            res.json(results);
        });
    } else {
        db.query(query + ' ORDER BY o.orderNumber DESC', (err, results) => {
            if(err) return res.status(500).json({error: err.message});
            res.json(results);
        });
    }
});

app.get('/api/orders/:id', (req, res) => {
    db.query(`SELECT o.*, c.customerName, c.phone, c.addressLine1, c.city
              FROM orders o 
              LEFT JOIN customers c ON o.customerNumber = c.customerNumber 
              WHERE o.orderNumber = ?`, [req.params.id], (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results[0]);
    });
});

app.get('/api/orders/:id/details', (req, res) => {
    db.query(`SELECT od.*, p.productName 
              FROM orderdetails od 
              LEFT JOIN products p ON od.productCode = p.productCode 
              WHERE od.orderNumber = ?`, [req.params.id], (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

app.post('/api/orders', (req, res) => {
    const {orderDate, requiredDate, shippedDate, status, comments, customerNumber, items} = req.body;
    
    db.beginTransaction(err => {
        if(err) return res.status(500).json({error: err.message});
        
        db.query('INSERT INTO orders (orderDate, requiredDate, shippedDate, status, comments, customerNumber) VALUES (?,?,?,?,?,?)',
            [orderDate, requiredDate, shippedDate, status, comments, customerNumber],
            (err, result) => {
                if(err) {
                    return db.rollback(() => res.status(500).json({error: err.message}));
                }
                
                const orderNumber = result.insertId;
                
                if(items && items.length > 0) {
                    const values = items.map((item, index) => [
                        orderNumber, 
                        item.productCode, 
                        item.quantity, 
                        item.price, 
                        index + 1
                    ]);
                    
                    db.query('INSERT INTO orderdetails (orderNumber, productCode, quantityOrdered, priceEach, orderLineNumber) VALUES ?',
                        [values], (err) => {
                            if(err) {
                                return db.rollback(() => res.status(500).json({error: err.message}));
                            }
                            
                            db.commit(err => {
                                if(err) {
                                    return db.rollback(() => res.status(500).json({error: err.message}));
                                }
                                res.json({success: true, message: 'Order created', orderNumber: orderNumber});
                            });
                        }
                    );
                } else {
                    db.commit(err => {
                        if(err) {
                            return db.rollback(() => res.status(500).json({error: err.message}));
                        }
                        res.json({success: true, message: 'Order created', orderNumber: orderNumber});
                    });
                }
            }
        );
    });
});

app.put('/api/orders/:id', (req, res) => {
    const {orderDate, requiredDate, shippedDate, status, comments, customerNumber} = req.body;
    db.query('UPDATE orders SET orderDate=?, requiredDate=?, shippedDate=?, status=?, comments=?, customerNumber=? WHERE orderNumber=?',
        [orderDate, requiredDate, shippedDate, status, comments, customerNumber, req.params.id],
        (err, result) => {
            if(err) return res.status(500).json({error: err.message});
            res.json({success: true, message: 'Order updated'});
        }
    );
});

app.delete('/api/orders/:id', (req, res) => {
    db.query('DELETE FROM orders WHERE orderNumber = ?', [req.params.id], (err, result) => {
        if(err) return res.status(500).json({error: err.message});
        res.json({success: true, message: 'Order deleted'});
    });
});

// ============ PAYMENTS API ============
app.get('/api/payments', (req, res) => {
    db.query(`SELECT p.*, c.customerName 
              FROM payments p 
              LEFT JOIN customers c ON p.customerNumber = c.customerNumber 
              ORDER BY p.paymentDate DESC`, (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

app.get('/api/payments/customer/:id', (req, res) => {
    db.query('SELECT * FROM payments WHERE customerNumber = ? ORDER BY paymentDate DESC', 
        [req.params.id], (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

app.post('/api/payments', (req, res) => {
    const {customerNumber, checkNumber, paymentDate, amount} = req.body;
    db.query('INSERT INTO payments VALUES (?,?,?,?)',
        [customerNumber, checkNumber, paymentDate, amount],
        (err, result) => {
            if(err) return res.status(500).json({error: err.message});
            res.json({success: true, message: 'Payment recorded'});
        }
    );
});

// ============ PRODUCTLINES API ============
app.get('/api/productlines', (req, res) => {
    db.query('SELECT * FROM productLines', (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

// ============ EMPLOYEES API ============
app.get('/api/employees', (req, res) => {
    db.query(`SELECT e.*, o.city as officeName 
              FROM employees e 
              LEFT JOIN offices o ON e.officeCode = o.officeCode 
              ORDER BY e.employeeNumber`, (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

app.get('/api/employees/:id', (req, res) => {
    db.query('SELECT * FROM employees WHERE employeeNumber = ?', [req.params.id], (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results[0]);
    });
});

app.post('/api/employees', (req, res) => {
    const {lastName, firstName, extension, email, officeCode, reportsTo, jobTitle} = req.body;
    db.query('INSERT INTO employees (lastName, firstName, extension, email, officeCode, reportsTo, jobTitle) VALUES (?,?,?,?,?,?,?)',
        [lastName, firstName, extension, email, officeCode, reportsTo, jobTitle],
        (err, result) => {
            if(err) return res.status(500).json({error: err.message});
            res.json({success: true, message: 'Employee created', id: result.insertId});
        }
    );
});

app.put('/api/employees/:id', (req, res) => {
    const {lastName, firstName, extension, email, officeCode, reportsTo, jobTitle} = req.body;
    db.query('UPDATE employees SET lastName=?, firstName=?, extension=?, email=?, officeCode=?, reportsTo=?, jobTitle=? WHERE employeeNumber=?',
        [lastName, firstName, extension, email, officeCode, reportsTo, jobTitle, req.params.id],
        (err, result) => {
            if(err) return res.status(500).json({error: err.message});
            res.json({success: true, message: 'Employee updated'});
        }
    );
});

app.delete('/api/employees/:id', (req, res) => {
    db.query('DELETE FROM employees WHERE employeeNumber = ?', [req.params.id], (err, result) => {
        if(err) return res.status(500).json({error: err.message});
        res.json({success: true, message: 'Employee deleted'});
    });
});

// ============ OFFICES API ============
app.get('/api/offices', (req, res) => {
    db.query('SELECT * FROM offices ORDER BY officeCode', (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

app.post('/api/offices', (req, res) => {
    const {officeCode, city, phone, addressLine1, addressLine2, state, country, postalCode, territory} = req.body;
    db.query('INSERT INTO offices VALUES (?,?,?,?,?,?,?,?,?)',
        [officeCode, city, phone, addressLine1, addressLine2, state, country, postalCode, territory],
        (err, result) => {
            if(err) return res.status(500).json({error: err.message});
            res.json({success: true, message: 'Office created'});
        }
    );
});

// ============ REPORTS & STATISTICS API ============
app.get('/api/reports/revenue', (req, res) => {
    const query = `SELECT DATE_FORMAT(o.orderDate, '%Y-%m') as month,
                   COUNT(DISTINCT o.orderNumber) as totalOrders,
                   SUM(od.quantityOrdered * od.priceEach) as revenue
                   FROM orders o
                   JOIN orderdetails od ON o.orderNumber = od.orderNumber
                   WHERE o.status = 'Shipped'
                   GROUP BY DATE_FORMAT(o.orderDate, '%Y-%m')
                   ORDER BY month DESC
                   LIMIT 12`;
    db.query(query, (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

app.get('/api/reports/top-products', (req, res) => {
    const query = `SELECT p.productCode, p.productName, 
                   SUM(od.quantityOrdered) as totalSold,
                   SUM(od.quantityOrdered * od.priceEach) as revenue
                   FROM orderdetails od
                   JOIN products p ON od.productCode = p.productCode
                   GROUP BY p.productCode, p.productName
                   ORDER BY totalSold DESC
                   LIMIT 10`;
    db.query(query, (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

app.get('/api/reports/employee-performance', (req, res) => {
    const query = `SELECT e.employeeNumber, 
                   CONCAT(e.firstName, ' ', e.lastName) as employeeName,
                   COUNT(DISTINCT o.orderNumber) as totalOrders,
                   SUM(od.quantityOrdered * od.priceEach) as totalSales
                   FROM employees e
                   LEFT JOIN customers c ON e.employeeNumber = c.salesRepEmployeeNumber
                   LEFT JOIN orders o ON c.customerNumber = o.customerNumber
                   LEFT JOIN orderdetails od ON o.orderNumber = od.orderNumber
                   WHERE e.jobTitle LIKE '%Sales%'
                   GROUP BY e.employeeNumber, employeeName
                   ORDER BY totalSales DESC`;
    db.query(query, (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

app.get('/api/reports/inventory', (req, res) => {
    const query = `SELECT p.productCode, p.productName, p.productLine,
                   p.quantityInStock,
                   COALESCE(SUM(CASE WHEN o.status IN ('In Process', 'On Hold') THEN od.quantityOrdered ELSE 0 END), 0) as reserved,
                   p.quantityInStock - COALESCE(SUM(CASE WHEN o.status IN ('In Process', 'On Hold') THEN od.quantityOrdered ELSE 0 END), 0) as available
                   FROM products p
                   LEFT JOIN orderdetails od ON p.productCode = od.productCode
                   LEFT JOIN orders o ON od.orderNumber = o.orderNumber
                   GROUP BY p.productCode, p.productName, p.productLine, p.quantityInStock
                   ORDER BY available ASC`;
    db.query(query, (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

app.get('/api/dashboard/stats', (req, res) => {
    const queries = {
        totalOrders: 'SELECT COUNT(*) as count FROM orders',
        totalRevenue: 'SELECT SUM(quantityOrdered * priceEach) as total FROM orderdetails od JOIN orders o ON od.orderNumber = o.orderNumber WHERE o.status = "Shipped"',
        totalCustomers: 'SELECT COUNT(*) as count FROM customers',
        lowStock: 'SELECT COUNT(*) as count FROM products WHERE quantityInStock < 10'
    };
    
    const results = {};
    let completed = 0;
    
    Object.keys(queries).forEach(key => {
        db.query(queries[key], (err, result) => {
            if(!err) {
                results[key] = result[0];
            }
            completed++;
            if(completed === Object.keys(queries).length) {
                res.json(results);
            }
        });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});