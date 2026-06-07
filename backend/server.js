const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env")
});

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const { query, getConnection } = require("./db");
const { createWompiPaymentLink } = require("./services/wompi");
const { buildWhatsAppMessage } = require("./services/whatsapp-message");
const { getDeliveryRatesMap, mapDeliveryRates, ensureDeliveryRatesTable } = require("./services/delivery-rates.service");
const { getProductById } = require("./services/products.service");
const { getOrderFullById } = require("./services/orders.service");
const authRoutes = require("./routes/auth.routes");
const categoriesRoutes = require("./routes/categories.routes");
const { verifyToken, requirePermission } = require("./middlewares/auth");
const { requireTrustedOrigin } = require("./middlewares/trusted-origin");
const {
  loginLimiter,
  apiLimiter,
  orderLimiter,
  webhookLimiter
} = require("./config/rate-limiters");
const {
  PORT,
  allowedOrigins,
  WHATSAPP_OWNER_NUMBER,
  validateEnv
} = require("./config/env");
const { SONSONATE_MUNICIPALITIES } = require("./constants/delivery.constants");
const {
  RESERVATION_MINUTES
} = require("./constants/order.constants");
const { createId } = require("./utils/id");
const { addMinutes } = require("./utils/date");
const { normalizePhone, formatSelectedOptions } = require("./utils/formatters");
const { isValidEmail } = require("./utils/validation");
const { isValidWompiHash } = require("./utils/crypto");
const {
  mapProduct,
  mapDeliveryPoint
} = require("./mappers/store.mappers");
const { validateOrderPayload } = require("./validators/order.validator");

const app = express();

validateEnv();

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origen no permitido por CORS"));
    },
    credentials: true
  })
);
app.use(cookieParser());
app.post("/api/wompi/webhook", webhookLimiter, express.raw({ type: "application/json", limit: "256kb" }), async (req, res) => {
  try {
    const apiSecret = process.env.WOMPI_API_SECRET;
    const receivedHash = req.get("wompi_hash");
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from("");

    if (!apiSecret || !receivedHash || !isValidWompiHash(rawBody, receivedHash, apiSecret)) {
      return res.status(401).json({
        ok: false,
        message: "Webhook no autorizado"
      });
    }

    const payload = JSON.parse(rawBody.toString("utf8"));
    const orderId = payload?.EnlacePago?.IdentificadorEnlaceComercio;
    const isApproved = payload?.ResultadoTransaccion === "ExitosaAprobada";

    if (!orderId || !isApproved) {
      return res.json({ ok: true });
    }

    const order = await getOrderFullById(orderId);

    if (!order || order.paymentMethod !== "PAYMENT_LINK") {
      return res.json({ ok: true });
    }

    const wompiAmount = Number(payload.Monto);
    const orderTotal = Number(order.total);

    if (!Number.isFinite(wompiAmount) || Math.abs(wompiAmount - orderTotal) > 0.01) {
      console.warn("Webhook Wompi con monto distinto al pedido", {
        orderId,
        wompiAmount,
        orderTotal
      });

      return res.status(400).json({
        ok: false,
        message: "Monto de webhook no coincide con el pedido"
      });
    }

    if (order.status === "PENDING_WHATSAPP") {
      await query("UPDATE orders SET status = 'CONFIRMED' WHERE id = :id", {
        id: orderId
      });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error("Error procesando webhook Wompi:", error);

    return res.status(500).json({
      ok: false,
      message: "Error procesando webhook"
    });
  }
});
app.use(express.json({ limit: "1mb" }));

app.use("/api", apiLimiter);
app.use("/api", requireTrustedOrigin);
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Backend de tienda de variedades funcionando con MySQL directo y JWT"
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await query("SELECT 1 AS ok");

    res.json({
      ok: true,
      status: "healthy",
      database: "mysql",
      auth: "jwt con httpOnly cookies",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error en health:", error);

    res.status(500).json({
      ok: false,
      message: "No se pudo conectar a MySQL"
    });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const rows = await query(
      `SELECT 
        p.*, 
        c.name AS categoryName, 
        c.createdAt AS categoryCreatedAt, 
        c.updatedAt AS categoryUpdatedAt
       FROM products p
       LEFT JOIN categories c ON c.id = p.categoryId
       WHERE p.isActive = 1
       ORDER BY p.createdAt DESC`
    );

    res.json({
      ok: true,
      data: rows.map(mapProduct)
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);

    res.status(500).json({
      ok: false,
      message: "Error al obtener productos",
      error: error.message,
      code: error.code
    });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado"
      });
    }

    res.json({
      ok: true,
      data: product
    });
  } catch (error) {
    console.error("Error al obtener producto:", error);

    res.status(500).json({
      ok: false,
      message: "Error al obtener producto"
    });
  }
});

app.post("/api/products", verifyToken, requirePermission("products"), async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl, categoryId } = req.body;
    const cleanName = name?.trim();

    if (!cleanName) {
      return res.status(400).json({
        ok: false,
        message: "El nombre del producto es obligatorio"
      });
    }

    if (price === undefined || price === null || Number(price) < 0) {
      return res.status(400).json({
        ok: false,
        message: "El precio debe ser válido"
      });
    }

    if (stock === undefined || stock === null || Number(stock) < 0) {
      return res.status(400).json({
        ok: false,
        message: "El stock debe ser válido"
      });
    }

    if (categoryId) {
      const categoryRows = await query(
        "SELECT id FROM categories WHERE id = :categoryId LIMIT 1",
        { categoryId }
      );

      if (categoryRows.length === 0) {
        return res.status(400).json({
          ok: false,
          message: "La categoría seleccionada no existe"
        });
      }
    }

    const id = createId();

    await query(
      `INSERT INTO products 
        (id, name, description, price, stock, imageUrl, categoryId)
       VALUES 
        (:id, :name, :description, :price, :stock, :imageUrl, :categoryId)`,
      {
        id,
        name: cleanName,
        description: description?.trim() || null,
        price: Number(price),
        stock: Number(stock),
        imageUrl: imageUrl?.trim() || null,
        categoryId: categoryId || null
      }
    );

    const product = await getProductById(id);

    res.status(201).json({
      ok: true,
      message: "Producto creado correctamente",
      data: product
    });
  } catch (error) {
    console.error("Error al crear producto:", error);

    res.status(500).json({
      ok: false,
      message: "Error al crear producto"
    });
  }
});

app.put("/api/products/:id", verifyToken, requirePermission("products"), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getProductById(id);

    if (!existing) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado"
      });
    }

    const name =
      req.body.name !== undefined ? req.body.name.trim() : existing.name;

    const description =
      req.body.description !== undefined
        ? req.body.description?.trim() || null
        : existing.description;

    const price =
      req.body.price !== undefined ? Number(req.body.price) : existing.price;

    const stock =
      req.body.stock !== undefined ? Number(req.body.stock) : existing.stock;

    const imageUrl =
      req.body.imageUrl !== undefined
        ? req.body.imageUrl?.trim() || null
        : existing.imageUrl;

    const categoryId =
      req.body.categoryId !== undefined
        ? req.body.categoryId || null
        : existing.categoryId;

    const isActive =
      req.body.isActive !== undefined
        ? req.body.isActive
          ? 1
          : 0
        : existing.isActive
        ? 1
        : 0;

    if (!name) {
      return res.status(400).json({
        ok: false,
        message: "El nombre del producto es obligatorio"
      });
    }

    if (price < 0) {
      return res.status(400).json({
        ok: false,
        message: "El precio debe ser válido"
      });
    }

    if (stock < 0) {
      return res.status(400).json({
        ok: false,
        message: "El stock debe ser válido"
      });
    }

    if (categoryId) {
      const categoryRows = await query(
        "SELECT id FROM categories WHERE id = :categoryId LIMIT 1",
        { categoryId }
      );

      if (categoryRows.length === 0) {
        return res.status(400).json({
          ok: false,
          message: "La categoría seleccionada no existe"
        });
      }
    }

    await query(
      `UPDATE products
       SET 
        name = :name,
        description = :description,
        price = :price,
        stock = :stock,
        imageUrl = :imageUrl,
        categoryId = :categoryId,
        isActive = :isActive
       WHERE id = :id`,
      {
        id,
        name,
        description,
        price,
        stock,
        imageUrl,
        categoryId,
        isActive
      }
    );

    const updated = await getProductById(id);

    res.json({
      ok: true,
      message: "Producto actualizado correctamente",
      data: updated
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);

    res.status(500).json({
      ok: false,
      message: "Error al actualizar producto"
    });
  }
});

app.delete("/api/products/:id", verifyToken, requirePermission("products"), async (req, res) => {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado"
      });
    }

    await query("DELETE FROM products WHERE id = :id", {
      id: req.params.id
    });

    res.json({
      ok: true,
      message: "Producto eliminado correctamente"
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);

    res.status(500).json({
      ok: false,
      message: "Error al eliminar producto. Revisa si ya está ligado a un pedido."
    });
  }
});

app.get("/api/delivery-rates", async (req, res) => {
  try {
    const rates = await getDeliveryRatesMap();

    res.json({
      ok: true,
      data: rates
    });
  } catch (error) {
    console.error("Error al obtener tarifas de delivery:", error);

    res.status(500).json({
      ok: false,
      message: "Error al obtener tarifas de delivery"
    });
  }
});

app.put("/api/delivery-rates", verifyToken, requirePermission("deliveryPoints"), async (req, res) => {
  try {
    const incomingRates = req.body.rates || {};
    await ensureDeliveryRatesTable();

    for (const municipality of SONSONATE_MUNICIPALITIES) {
      const price = Number(incomingRates[municipality]);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          ok: false,
          message: `Ingresa un precio valido para ${municipality}.`
        });
      }

      await query(
        `INSERT INTO delivery_rates (municipality, price, isActive)
         VALUES (:municipality, :price, 1)
         ON DUPLICATE KEY UPDATE price = :price, isActive = 1`,
        { municipality, price }
      );
    }

    const rates = await getDeliveryRatesMap();

    res.json({
      ok: true,
      message: "Tarifas de delivery actualizadas correctamente",
      data: rates
    });
  } catch (error) {
    console.error("Error al actualizar tarifas de delivery:", error);

    res.status(500).json({
      ok: false,
      message: "Error al actualizar tarifas de delivery"
    });
  }
});

app.get("/api/delivery-points", async (req, res) => {
  try {
    const onlyActive = req.query.active === "true";

    const sql = onlyActive
      ? "SELECT * FROM delivery_points WHERE isActive = 1 ORDER BY createdAt DESC"
      : "SELECT * FROM delivery_points ORDER BY createdAt DESC";

    const rows = await query(sql);

    res.json({
      ok: true,
      data: rows.map(mapDeliveryPoint)
    });
  } catch (error) {
    console.error("Error al obtener puntos de entrega:", error);

    res.status(500).json({
      ok: false,
      message: "Error al obtener puntos de entrega"
    });
  }
});

app.post("/api/delivery-points", verifyToken, requirePermission("deliveryPoints"), async (req, res) => {
  try {
    const { name, address, reference, schedule, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El nombre del punto de entrega es obligatorio"
      });
    }

    if (!address || !address.trim()) {
      return res.status(400).json({
        ok: false,
        message: "La dirección del punto de entrega es obligatoria"
      });
    }

    const id = createId();

    await query(
      `INSERT INTO delivery_points 
        (id, name, address, reference, schedule, isActive)
       VALUES 
        (:id, :name, :address, :reference, :schedule, :isActive)`,
      {
        id,
        name: name.trim(),
        address: address.trim(),
        reference: reference?.trim() || null,
        schedule: schedule?.trim() || null,
        isActive: isActive !== undefined ? (isActive ? 1 : 0) : 1
      }
    );

    const rows = await query("SELECT * FROM delivery_points WHERE id = :id", {
      id
    });

    res.status(201).json({
      ok: true,
      message: "Punto de entrega creado correctamente",
      data: mapDeliveryPoint(rows[0])
    });
  } catch (error) {
    console.error("Error al crear punto de entrega:", error);

    res.status(500).json({
      ok: false,
      message: "Error al crear punto de entrega"
    });
  }
});

app.put("/api/delivery-points/:id", verifyToken, requirePermission("deliveryPoints"), async (req, res) => {
  try {
    const { id } = req.params;

    const rows = await query(
      "SELECT * FROM delivery_points WHERE id = :id LIMIT 1",
      { id }
    );

    const existing = rows[0];

    if (!existing) {
      return res.status(404).json({
        ok: false,
        message: "Punto de entrega no encontrado"
      });
    }

    const name =
      req.body.name !== undefined ? req.body.name.trim() : existing.name;

    const address =
      req.body.address !== undefined
        ? req.body.address.trim()
        : existing.address;

    const reference =
      req.body.reference !== undefined
        ? req.body.reference?.trim() || null
        : existing.reference;

    const schedule =
      req.body.schedule !== undefined
        ? req.body.schedule?.trim() || null
        : existing.schedule;

    const isActive =
      req.body.isActive !== undefined
        ? req.body.isActive
          ? 1
          : 0
        : existing.isActive;

    await query(
      `UPDATE delivery_points
       SET 
        name = :name,
        address = :address,
        reference = :reference,
        schedule = :schedule,
        isActive = :isActive
       WHERE id = :id`,
      {
        id,
        name,
        address,
        reference,
        schedule,
        isActive
      }
    );

    const updatedRows = await query(
      "SELECT * FROM delivery_points WHERE id = :id",
      { id }
    );

    res.json({
      ok: true,
      message: "Punto de entrega actualizado correctamente",
      data: mapDeliveryPoint(updatedRows[0])
    });
  } catch (error) {
    console.error("Error al actualizar punto de entrega:", error);

    res.status(500).json({
      ok: false,
      message: "Error al actualizar punto de entrega"
    });
  }
});

app.delete("/api/delivery-points/:id", verifyToken, requirePermission("deliveryPoints"), async (req, res) => {
  try {
    const rows = await query(
      "SELECT * FROM delivery_points WHERE id = :id LIMIT 1",
      { id: req.params.id }
    );

    if (!rows[0]) {
      return res.status(404).json({
        ok: false,
        message: "Punto de entrega no encontrado"
      });
    }

    await query("DELETE FROM delivery_points WHERE id = :id", {
      id: req.params.id
    });

    res.json({
      ok: true,
      message: "Punto de entrega eliminado correctamente"
    });
  } catch (error) {
    console.error("Error al eliminar punto de entrega:", error);

    res.status(500).json({
      ok: false,
      message:
        "Error al eliminar punto de entrega. Revisa si ya está ligado a un pedido."
    });
  }
});

app.get("/api/orders", verifyToken, requirePermission("orders"), async (req, res) => {
  try {
    const orderRows = await query("SELECT * FROM orders ORDER BY createdAt DESC");
    const orders = [];

    for (const orderRow of orderRows) {
      orders.push(await getOrderFullById(orderRow.id));
    }

    res.json({
      ok: true,
      data: orders
    });
  } catch (error) {
    console.error("Error al obtener pedidos:", error);

    res.status(500).json({
      ok: false,
      message: "Error al obtener pedidos"
    });
  }
});

app.post("/api/orders", orderLimiter, async (req, res) => {
  const connection = await getConnection();

  try {
    const errors = validateOrderPayload(req.body);

    if (errors.length > 0) {
      connection.release();

      return res.status(400).json({
        ok: false,
        message: errors[0],
        errors
      });
    }

  const {
    customerName,
    customerPhone,
    deliveryMethod,
    paymentMethod,
    deliveryDepartment,
    deliveryMunicipality,
    deliveryAddress,
    deliveryNotes,
    deliveryPointId,
    items
  } = req.body;

    const productIds = items.map((item) => item.productId);

    await connection.beginTransaction();

    const placeholders = productIds.map(() => "?").join(",");

    const [productRows] = await connection.execute(
      `SELECT * FROM products WHERE id IN (${placeholders}) FOR UPDATE`,
      productIds
    );

    if (productRows.length !== productIds.length) {
      await connection.rollback();

      return res.status(400).json({
        ok: false,
        message: "Uno o más productos no existen."
      });
    }

    let selectedDeliveryPoint = null;

    if (deliveryMethod === "PICKUP_POINT") {
      const [pointRows] = await connection.execute(
        "SELECT * FROM delivery_points WHERE id = ? LIMIT 1",
        [deliveryPointId]
      );

      selectedDeliveryPoint = pointRows[0]
        ? mapDeliveryPoint(pointRows[0])
        : null;

      if (!selectedDeliveryPoint || !selectedDeliveryPoint.isActive) {
        await connection.rollback();

        return res.status(400).json({
          ok: false,
          message: "El punto de entrega seleccionado no es válido."
        });
      }
    }

    if (deliveryMethod === "DELIVERY") {
      if (deliveryDepartment !== "Sonsonate") {
        await connection.rollback();

        return res.status(400).json({
          ok: false,
          message: "Por el momento solo contamos con envios en Sonsonate."
        });
      }

      if (!SONSONATE_MUNICIPALITIES.includes(deliveryMunicipality)) {
        await connection.rollback();

        return res.status(400).json({
          ok: false,
          message: "El municipio seleccionado no es valido."
        });
      }
    }

    const productsMap = new Map(
      productRows.map((product) => [product.id, product])
    );

    for (const item of items) {
      const dbProduct = productsMap.get(item.productId);

      if (!dbProduct) {
        await connection.rollback();

        return res.status(400).json({
          ok: false,
          message: `El producto con id ${item.productId} no existe.`
        });
      }

      if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
        await connection.rollback();

        return res.status(400).json({
          ok: false,
          message: `La cantidad de "${dbProduct.name}" no es válida.`
        });
      }

      if (Number(dbProduct.stock) < Number(item.quantity)) {
        await connection.rollback();

        return res.status(400).json({
          ok: false,
          message: `No hay suficiente stock para "${dbProduct.name}".`
        });
      }
    }

    const reservedUntil = addMinutes(new Date(), RESERVATION_MINUTES);

    const preparedItems = items.map((item) => {
      const dbProduct = productsMap.get(item.productId);
      const optionText = formatSelectedOptions(item.selectedOptions);
      const itemName = optionText
        ? `${dbProduct.name} (${optionText})`
        : dbProduct.name;

      return {
        productId: dbProduct.id,
        quantity: Number(item.quantity),
        price: Number(dbProduct.price),
        name: itemName,
        imageUrl: dbProduct.imageUrl || null
      };
    });

    const productsTotal = preparedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const deliveryRates = deliveryMethod === "DELIVERY" ? await getDeliveryRatesMap() : {};
    const deliveryCost =
      deliveryMethod === "DELIVERY"
        ? Number(deliveryRates[deliveryMunicipality] || 0)
        : 0;
    const total = productsTotal + deliveryCost;
    const cleanDeliveryNotes =
      deliveryMethod === "DELIVERY"
        ? `Delivery: $${deliveryCost.toFixed(2)}. ${
            deliveryNotes?.trim() || "Sin indicaciones adicionales"
          }`
        : deliveryNotes?.trim() || null;

    const whatsappMessage = buildWhatsAppMessage({
      customerName: customerName.trim(),
      customerPhone: normalizePhone(customerPhone),
      deliveryMethod,
      paymentMethod,
      deliveryAddress: deliveryAddress?.trim() || null,
      deliveryNotes: cleanDeliveryNotes,
      deliveryPoint: selectedDeliveryPoint,
      items: preparedItems,
      total
    });

    for (const item of preparedItems) {
      await connection.execute(
        "UPDATE products SET stock = stock - ?, reservedUntil = ? WHERE id = ?",
        [item.quantity, reservedUntil, item.productId]
      );
    }

    const orderId = createId();

    await connection.execute(
      `INSERT INTO orders
       (
        id,
        customerName,
        customerPhone,
        total,
        status,
        deliveryMethod,
        paymentMethod,
        deliveryAddress,
        deliveryNotes,
        deliveryPointId,
        reservedUntil,
        whatsappMessage
       )
       VALUES (?, ?, ?, ?, 'PENDING_WHATSAPP', ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        customerName.trim(),
        normalizePhone(customerPhone),
        total,
        deliveryMethod,
        paymentMethod,
        deliveryMethod === "DELIVERY" ? deliveryAddress?.trim() || null : null,
        deliveryMethod === "DELIVERY" ? cleanDeliveryNotes : null,
        deliveryMethod === "PICKUP_POINT" ? deliveryPointId : null,
        reservedUntil,
        whatsappMessage
      ]
    );

    for (const item of preparedItems) {
      await connection.execute(
        `INSERT INTO order_items 
          (id, orderId, productId, quantity, price, name, imageUrl)
         VALUES 
          (?, ?, ?, ?, ?, ?, ?)`,
        [
          createId(),
          orderId,
          item.productId,
          item.quantity,
          item.price,
          item.name,
          item.imageUrl
        ]
      );
    }

    await connection.commit();

    const order = await getOrderFullById(orderId);

    const whatsappUrl = `https://wa.me/${WHATSAPP_OWNER_NUMBER}?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    res.status(201).json({
      ok: true,
      message: "Pedido creado correctamente",
      data: order,
      whatsappUrl
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error al crear pedido:", error);

    res.status(500).json({
      ok: false,
      message: "Error al crear pedido"
    });
  } finally {
    connection.release();
  }
});

app.patch("/api/orders/:id/confirm", verifyToken, requirePermission("orders"), async (req, res) => {
  try {
    const order = await getOrderFullById(req.params.id);

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: "Pedido no encontrado"
      });
    }

    await query("UPDATE orders SET status = 'CONFIRMED' WHERE id = :id", {
      id: req.params.id
    });

    const updated = await getOrderFullById(req.params.id);

    res.json({
      ok: true,
      message: "Pedido confirmado correctamente",
      data: updated
    });
  } catch (error) {
    console.error("Error al confirmar pedido:", error);

    res.status(500).json({
      ok: false,
      message: "Error al confirmar pedido"
    });
  }
});

app.patch("/api/orders/:id/cancel", verifyToken, requirePermission("orders"), async (req, res) => {
  const connection = await getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [orderRows] = await connection.execute(
      "SELECT * FROM orders WHERE id = ? LIMIT 1 FOR UPDATE",
      [id]
    );

    const order = orderRows[0];

    if (!order) {
      await connection.rollback();

      return res.status(404).json({
        ok: false,
        message: "Pedido no encontrado"
      });
    }

    if (order.status === "CANCELLED" || order.status === "EXPIRED") {
      await connection.rollback();

      return res.status(400).json({
        ok: false,
        message: "El pedido ya no se puede cancelar."
      });
    }

    const [items] = await connection.execute(
      "SELECT * FROM order_items WHERE orderId = ?",
      [id]
    );

    for (const item of items) {
      await connection.execute(
        "UPDATE products SET stock = stock + ?, reservedUntil = NULL WHERE id = ?",
        [item.quantity, item.productId]
      );
    }

    await connection.execute(
      "UPDATE orders SET status = 'CANCELLED' WHERE id = ?",
      [id]
    );

    await connection.commit();

    res.json({
      ok: true,
      message: "Pedido cancelado correctamente y stock liberado"
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error al cancelar pedido:", error);

    res.status(500).json({
      ok: false,
      message: "Error al cancelar pedido"
    });
  } finally {
    connection.release();
  }
});

app.post("/api/wompi/create-link", async (req, res) => {
  try {
    const { orderId, customerEmail } = req.body;

    if (!orderId) {
      return res.status(400).json({
        ok: false,
        message: "Falta el id del pedido."
      });
    }

    if (customerEmail && !isValidEmail(customerEmail)) {
      return res.status(400).json({
        ok: false,
        message: "El correo para el pago no es valido."
      });
    }

    const order = await getOrderFullById(orderId);

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: "Pedido no encontrado."
      });
    }

    if (order.paymentMethod !== "PAYMENT_LINK") {
      return res.status(400).json({
        ok: false,
        message: "Este pedido no usa link de pago."
      });
    }

    if (order.status !== "PENDING_WHATSAPP") {
      return res.status(400).json({
        ok: false,
        message: "Este pedido ya no puede generar un link de pago."
      });
    }

    const productName =
      order.items.length === 1
        ? order.items[0].name
        : `Pedido de ${order.items.length} productos`;

    const wompiResponse = await createWompiPaymentLink({
      orderId: order.id,
      amount: order.total,
      productName,
      customerEmail
    });

    return res.json({
      ok: true,
      data: wompiResponse
    });
  } catch (error) {
    console.error("Error creando enlace Wompi:", error.response?.data || error.message);

    return res.status(500).json({
      ok: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "No se pudo crear el enlace de pago en Wompi."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});


