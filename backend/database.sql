CREATE DATABASE IF NOT EXISTS tienda_variedades
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tienda_variedades;

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_points (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  address VARCHAR(255) NOT NULL,
  reference VARCHAR(255) NULL,
  schedule VARCHAR(150) NULL,
  isActive TINYINT(1) NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_rates (
  municipality VARCHAR(120) PRIMARY KEY,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  isActive TINYINT(1) NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_delivery_rates_price CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
  isActive TINYINT(1) NOT NULL DEFAULT 1,
  canDashboard TINYINT(1) NOT NULL DEFAULT 0,
  canOrders TINYINT(1) NOT NULL DEFAULT 0,
  canUsers TINYINT(1) NOT NULL DEFAULT 0,
  canProducts TINYINT(1) NOT NULL DEFAULT 0,
  canDeliveryPoints TINYINT(1) NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  imageUrl TEXT NULL,
  isActive TINYINT(1) NOT NULL DEFAULT 1,
  reservedUntil DATETIME NULL,
  categoryId VARCHAR(36) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category
    FOREIGN KEY (categoryId) REFERENCES categories(id)
    ON DELETE SET NULL,
  CONSTRAINT chk_products_price CHECK (price >= 0),
  CONSTRAINT chk_products_stock CHECK (stock >= 0)
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  customerName VARCHAR(150) NOT NULL,
  customerPhone VARCHAR(30) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING_WHATSAPP', 'CONFIRMED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'PENDING_WHATSAPP',
  deliveryMethod ENUM('DELIVERY', 'PICKUP_POINT') NOT NULL,
  paymentMethod ENUM('CASH', 'PAYMENT_LINK') NOT NULL,
  deliveryAddress VARCHAR(255) NULL,
  deliveryNotes TEXT NULL,
  deliveryPointId VARCHAR(36) NULL,
  reservedUntil DATETIME NULL,
  whatsappMessage TEXT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_delivery_point
    FOREIGN KEY (deliveryPointId) REFERENCES delivery_points(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(36) PRIMARY KEY,
  orderId VARCHAR(36) NOT NULL,
  productId VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  name VARCHAR(150) NOT NULL,
  imageUrl TEXT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (orderId) REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (productId) REFERENCES products(id)
    ON DELETE RESTRICT,
  CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
  CONSTRAINT chk_order_items_price CHECK (price >= 0)
);

INSERT IGNORE INTO categories (id, name) VALUES
  ('sin-categoria', 'Sin categoría'),
  ('celulares', 'Accesorios para celulares'),
  ('tecnologia', 'Tecnologia'),
  ('mascotas', 'Mascotas'),
  ('cabello', 'Cabello'),
  ('hogar-cocina', 'Hogar y cocina'),
  ('cuidado-personal', 'Cuidado personal'),
  ('ninos-juguetes', 'Ninos y juguetes');

INSERT IGNORE INTO users
  (id, name, email, passwordHash, role, isActive, canDashboard, canOrders, canUsers, canProducts, canDeliveryPoints)
VALUES
  ('admin-variedades', 'Administrador', 'admin@tienda.com', '$2b$10$/k6TBlWTunxCwCV/EyhK2OkntXStb3q1ROtfBXNMwvvmNpwVieZnC', 'ADMIN', 1, 1, 1, 1, 1, 1);

INSERT INTO users
  (id, name, email, passwordHash, role, isActive, canDashboard, canOrders, canUsers, canProducts, canDeliveryPoints)
VALUES
  ('admin-variedades-produccion', 'Administrador Variedades', 'admin.variedades@tienda.com', '$2b$10$ireESDc/QtV9YZkdDCH4i.FQfnBwQtx.C77b9vJEtTxOZTIMmIA1i', 'ADMIN', 1, 1, 1, 1, 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  passwordHash = VALUES(passwordHash),
  role = VALUES(role),
  isActive = VALUES(isActive),
  canDashboard = VALUES(canDashboard),
  canOrders = VALUES(canOrders),
  canUsers = VALUES(canUsers),
  canProducts = VALUES(canProducts),
  canDeliveryPoints = VALUES(canDeliveryPoints);

DELETE FROM products
WHERE id NOT IN (
  'teclado-mouse-imice-an300',
  'plancha-cabello-gwb',
  'secadora-cabello-superker',
  'peine-electrico-gwb-gw6595',
  'ice-cube-maker-genie',
  'magic-suction-cup-celular',
  'masajeador-cuello-kh960',
  'juguete-musical-bebe',
  'cable-tipo-c-mtmax',
  'mochila-transportadora-gato'
)
AND id NOT IN (SELECT DISTINCT productId FROM order_items);

UPDATE products
SET isActive = 0
WHERE id NOT IN (
  'teclado-mouse-imice-an300',
  'plancha-cabello-gwb',
  'secadora-cabello-superker',
  'peine-electrico-gwb-gw6595',
  'ice-cube-maker-genie',
  'magic-suction-cup-celular',
  'masajeador-cuello-kh960',
  'juguete-musical-bebe',
  'cable-tipo-c-mtmax',
  'mochila-transportadora-gato'
);

INSERT INTO products (id, name, description, price, stock, imageUrl, categoryId) VALUES
  ('teclado-mouse-imice-an300', 'Teclado y mouse iMICE AN-300', 'Combo de teclado y mouse iMICE para oficina, estudio o uso diario.', 18.99, 8, '/product-images/teclado-mouse-imice-an300.jpg', 'tecnologia'),
  ('plancha-cabello-gwb', 'Plancha de cabello GWB', 'Plancha GWB compacta para alisar y retocar el cabello en casa.', 12.99, 10, '/product-images/plancha-cabello-gwb.png', 'cabello'),
  ('secadora-cabello-superker', 'Secadora de cabello Superker', 'Secadora Superker practica para secado rapido y peinados diarios.', 15.99, 7, '/product-images/secadora-superker.webp', 'cabello'),
  ('peine-electrico-gwb-gw6595', 'Peine electrico GWB GW-6595', 'Peine electrico GWB GW-6595 para estilizar el cabello con facilidad.', 8.99, 9, '/product-images/peine-gwb-gw6595.jpg', 'cabello'),
  ('ice-cube-maker-genie', 'Ice Cube Maker Genie', 'Molde practico para hacer y servir cubos de hielo en casa.', 6.99, 12, '/product-images/ice-cube-maker-genie.webp', 'hogar-cocina'),
  ('magic-suction-cup-celular', 'Magic Suction Cup para celular', 'Soporte con ventosas para sujetar el celular de forma comoda.', 4.99, 18, '/product-images/magic-suction-cup-phone.jpg', 'celulares'),
  ('masajeador-cuello-kh960', 'Masajeador de cuello KH-960', 'Masajeador cervical electrico para relajacion y uso personal.', 14.99, 6, '/product-images/masajeador-cuello-kh960.png', 'cuidado-personal'),
  ('juguete-musical-bebe', 'Juguete musical educativo para bebe', 'Juguete colorido con actividad musical para estimulacion temprana.', 9.99, 10, '/product-images/juguete-musical-bebe.jpg', 'ninos-juguetes'),
  ('cable-tipo-c-mtmax', 'Cable Tipo C MTMAX', 'Cable Tipo C para carga rapida y uso diario con dispositivos compatibles.', 3.99, 20, '/product-images/cable-tipo-c-mtmax.webp', 'celulares'),
  ('mochila-transportadora-gato', 'Mochila transportadora para gato', 'Mochila ventilada para transportar gatos pequenos con mayor comodidad.', 28.50, 4, '/product-images/mochila-para-gato.jpeg', 'mascotas')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price = VALUES(price),
  stock = VALUES(stock),
  imageUrl = VALUES(imageUrl),
  categoryId = VALUES(categoryId),
  isActive = 1;

INSERT IGNORE INTO delivery_rates (municipality, price) VALUES
  ('Acajutla', 4.00),
  ('Armenia', 4.00),
  ('Caluco', 3.00),
  ('Cuisnahuat', 5.00),
  ('Izalco', 3.00),
  ('Juayua', 5.00),
  ('Nahuizalco', 3.50),
  ('Nahulingo', 2.50),
  ('Salcoatitan', 5.00),
  ('San Antonio del Monte', 2.50),
  ('San Julian', 4.00),
  ('Santa Catarina Masahuat', 5.00),
  ('Santa Isabel Ishuatan', 6.00),
  ('Santo Domingo de Guzman', 6.00),
  ('Sonsonate', 2.00),
  ('Sonzacate', 2.00);
