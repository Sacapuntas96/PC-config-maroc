-- Migration number: 0001 	 2026-11-04T11:48:04.636Z
CREATE TABLE products(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NON NULL,
    name TEXT NON NULL,
    price REAL NON NULL,
    specs TEXT NON NULL
);
CREATE INDEX indx_product_category on products(category);