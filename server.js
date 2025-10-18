const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sales_management'
});

db.connect(err => {
    if(err) throw err;
    console.log('MySQL Connected!');
});

// ============ PRODUCTS API ============
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products ORDER BY productCode', (err, results) => {
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
    db.query(`SELECT o.*, c.customerName 
              FROM orders o 
              LEFT JOIN customers c ON o.customerNumber = c.customerNumber 
              ORDER BY o.orderNumber DESC`, (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

app.get('/api/orders/:id', (req, res) => {
    db.query(`SELECT o.*, c.customerName 
              FROM orders o 
              LEFT JOIN customers c ON o.customerNumber = c.customerNumber 
              WHERE o.orderNumber = ?`, [req.params.id], (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results[0]);
    });
});

app.post('/api/orders', (req, res) => {
    const {orderDate, requiredDate, shippedDate, status, comments, customerNumber} = req.body;
    db.query('INSERT INTO orders (orderDate, requiredDate, shippedDate, status, comments, customerNumber) VALUES (?,?,?,?,?,?)',
        [orderDate, requiredDate, shippedDate, status, comments, customerNumber],
        (err, result) => {
            if(err) return res.status(500).json({error: err.message});
            res.json({success: true, message: 'Order created', id: result.insertId});
        }
    );
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

// ============ PRODUCTLINES API ============
app.get('/api/productlines', (req, res) => {
    db.query('SELECT * FROM productLines', (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});