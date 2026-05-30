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
  ('ninos-juguetes', 'Ninos y juguetes'),
  ('maquillaje', 'Maquillaje'),
  ('variedades', 'Variedades');

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
  'mochila-transportadora-gato',
  'producto-rosado-por-confirmar',
  'slice-picker-rs168',
  'dispensador-agua-mclassic-md02',
  'labiales-infantiles-florales',
  'labial-liquido-annasa-moisture',
  'cover-silicon-space-iphone'
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
  'mochila-transportadora-gato',
  'producto-rosado-por-confirmar',
  'slice-picker-rs168',
  'dispensador-agua-mclassic-md02',
  'labiales-infantiles-florales',
  'labial-liquido-annasa-moisture',
  'cover-silicon-space-iphone'
);

INSERT INTO products (id, name, description, price, stock, imageUrl, categoryId) VALUES
  ('teclado-mouse-imice-an300', 'Teclado y mouse iMICE AN-300', 'Combo de teclado y mouse iMICE para oficina, estudio o uso diario.\nColores: Negro con iluminacion multicolor segun modelo.\nIncluye: Teclado, mouse y empaque.', 18.99, 2, '/product-images/teclado-mouse-imice-an300.jpg', 'tecnologia'),
  ('plancha-cabello-gwb', 'Plancha de cabello GWB', 'Plancha GWB compacta para alisar y retocar el cabello en casa.\nColores: Segun disponibilidad.\nUso: Cabello seco, retoques rapidos y peinados diarios.', 12.99, 2, '/product-images/plancha-cabello-gwb.png', 'cabello'),
  ('secadora-cabello-superker', 'Secadora de cabello Superker', 'Secadora Superker practica para secado rapido y peinados diarios.\nColores: Segun disponibilidad.\nUso: Secado de cabello en casa.', 15.99, 2, '/product-images/secadora-superker.webp', 'cabello'),
  ('peine-electrico-gwb-gw6595', 'Peine electrico GWB GW-6595', 'Peine electrico GWB GW-6595 para estilizar el cabello con facilidad.\nColores: Segun disponibilidad.\nUso: Peinado y retoque diario.', 8.99, 2, '/product-images/peine-gwb-gw6595.jpg', 'cabello'),
  ('ice-cube-maker-genie', 'Ice Cube Maker Genie', 'Molde practico para hacer y servir cubos de hielo en casa.\nColores: Segun disponibilidad.\nUso: Preparar, guardar y servir hielo.', 6.99, 2, '/product-images/ice-cube-maker-genie.webp', 'hogar-cocina'),
  ('magic-suction-cup-celular', 'Magic Suction Cup para celular', 'Soporte con ventosas para sujetar el celular de forma comoda.\nColores: Segun disponibilidad.\nUso: Apoyo para grabar, tomar fotos o colocar el telefono en superficies lisas.', 4.99, 2, '/product-images/magic-suction-cup-phone.jpg', 'celulares'),
  ('masajeador-cuello-kh960', 'Masajeador de cuello KH-960', 'Masajeador cervical electrico para relajacion y uso personal.\nColores: Segun disponibilidad.\nUso: Masaje de cuello con modos de intensidad.', 14.99, 2, '/product-images/masajeador-cuello-kh960.png', 'cuidado-personal'),
  ('juguete-musical-bebe', 'Juguete musical educativo para bebe', 'Juguete colorido con actividad musical para estimulacion temprana.\nColores: Multicolor.\nUso: Entretenimiento y desarrollo sensorial.', 9.99, 2, '/product-images/juguete-musical-bebe.jpg', 'ninos-juguetes'),
  ('cable-tipo-c-mtmax', 'Cable Tipo C MTMAX', 'Cable Tipo C para carga rapida y uso diario con dispositivos compatibles.\nColores: Blanco.\nUso: Carga y transferencia de datos en equipos compatibles.', 3.99, 2, '/product-images/cable-tipo-c-mtmax.webp', 'celulares'),
  ('mochila-transportadora-gato', 'Mochila transportadora para gato', 'Mochila ventilada para transportar gatos pequenos con mayor comodidad.\nColores: Segun disponibilidad.\nUso: Transporte seguro de mascotas pequenas.', 28.50, 2, '/product-images/mochila-para-gato.jpeg', 'mascotas'),
  ('producto-rosado-por-confirmar', 'Producto rosado por confirmar', 'Producto agregado desde enlace compartido de Google pendiente de confirmar, porque el enlace no expone la ficha publica del producto.\nColores: Rosado.\nNota: Actualizar nombre, imagen y precio cuando se confirme el articulo.', 1.00, 1, '/product-images/no-image.svg', 'variedades'),
  ('slice-picker-rs168', 'Slice Picker RS-168', 'Utensilio manual tipo slice picker RS-168 para cortes decorativos o laminas pequenas en cocina.\nColores: Rojo.\nIncluye: Herramienta manual con empaque.', 3.50, 3, '/product-images/producto-rosado-rojo.webp', 'hogar-cocina'),
  ('dispensador-agua-mclassic-md02', 'Dispensador de agua MClassic MD-02', 'Dispensador automatico de agua MClassic MD-02 recargable por USB para botellones.\nColores: Blanco.\nIncluye: Manguera, tubo metalico y cable USB.', 7.99, 3, '/product-images/producto-blanco.webp', 'hogar-cocina'),
  ('labiales-infantiles-florales', 'Labiales infantiles florales', 'Labiales de colores con empaque floral, ideales para juego, detalle o uso cosmetico ligero segun disponibilidad.\nColores y stock: 2 azul, 2 amarillo, 2 naranja, 2 rojo, 2 verde y 2 rosado.\nPresentacion: Barra tipo labial.', 1.99, 12, '/product-images/producto-colores-12.jpg', 'maquillaje'),
  ('labial-liquido-annasa-moisture', 'Labial liquido Annasa Moisture', 'Labial liquido Annasa Moisture con acabado brillante y tonos variados.\nColores: Rojo, vino, nude, rosa, marron y terracota segun modelos visibles.\nNota: Confirmar tonos exactos al preparar pedido.', 2.50, 10, '/product-images/producto-modelos-colores.jpg', 'maquillaje'),
  ('cover-silicon-space-iphone', 'Cover Silicon Space para iPhone', 'Cover Silicon Space para celular, funda flexible de uso diario con proteccion trasera y bordes suaves.\nModelos iPhone: iPhone 11, 11 Pro, 11 Pro Max, 12, 12 Pro, 12 Pro Max, 13, 13 Pro, 13 Pro Max, 14, 14 Plus, 14 Pro, 14 Pro Max, 15, 15 Plus, 15 Pro, 15 Pro Max, 16, 16 Plus, 16 Pro y 16 Pro Max.\nColores: Negro, azul, rosado, morado, verde, rojo y transparente segun disponibilidad. Luego se retiran los modelos o colores que no esten en inventario real.', 3.99, 14, 'https://mayoreo.mundoinnovacionhn.com/wp-content/uploads/2023/08/176378-Cober-Silicon-Space-Honor-X8.jpg', 'celulares')
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
