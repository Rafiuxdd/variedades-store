const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { pool } = require("../db");
const { verifyToken, requirePermission } = require("../middlewares/auth");

const router = express.Router();

function createId() {
  return crypto.randomUUID();
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "2h"
    }
  );
}


function cookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 2 * 60 * 60 * 1000,
    path: "/"
  };
}

function getPermissionsFromUser(user) {
  if (user.role === "ADMIN") {
    return {
      dashboard: true,
      orders: true,
      users: true,
      products: true,
      deliveryPoints: true
    };
  }

  return {
    dashboard: Boolean(user.canDashboard),
    orders: Boolean(user.canOrders),
    users: Boolean(user.canUsers),
    products: Boolean(user.canProducts),
    deliveryPoints: Boolean(user.canDeliveryPoints)
  };
}

function permissionsToDb(permissions = {}, role = "EMPLOYEE") {
  if (role === "ADMIN") {
    return {
      canDashboard: 1,
      canOrders: 1,
      canUsers: 1,
      canProducts: 1,
      canDeliveryPoints: 1
    };
  }

  return {
    canDashboard: permissions.dashboard ? 1 : 0,
    canOrders: permissions.orders ? 1 : 0,
    canUsers: permissions.users ? 1 : 0,
    canProducts: permissions.products ? 1 : 0,
    canDeliveryPoints: permissions.deliveryPoints ? 1 : 0
  };
}

function mapUser(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.name,
    email: user.email,
    role: user.role,
    isActive: Boolean(user.isActive),
    permissions: getPermissionsFromUser(user),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Correo y contraseña son obligatorios"
      });
    }

    const [users] = await pool.execute(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    const user = users[0];

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "Credenciales incorrectas"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        ok: false,
        message: "Este usuario está desactivado"
      });
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordIsValid) {
      return res.status(401).json({
        ok: false,
        message: "Credenciales incorrectas"
      });
    }

    const mappedUser = mapUser(user);
    const token = createToken(mappedUser);

    res.cookie("access_token", token, cookieOptions());

    return res.json({
      ok: true,
      message: "Inicio de sesión correcto",
      user: mappedUser
    });
  } catch (error) {
    console.error("Error en login:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al iniciar sesión"
    });
  }
});


router.post("/logout", (req, res) => {
  res.clearCookie("access_token", cookieOptions());

  return res.json({
    ok: true,
    message: "Sesión cerrada correctamente"
  });
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    const user = users[0];

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        ok: false,
        message: "Este usuario está desactivado"
      });
    }

    return res.json({
      ok: true,
      user: mapUser(user)
    });
  } catch (error) {
    console.error("Error en /me:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al validar usuario"
    });
  }
});

router.get("/users", verifyToken, requirePermission("users"), async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, name, email, role, isActive,
              canDashboard, canOrders, canUsers, canProducts, canDeliveryPoints,
              createdAt, updatedAt
       FROM users
       ORDER BY createdAt DESC`
    );

    return res.json({
      ok: true,
      data: users.map(mapUser)
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al obtener usuarios"
    });
  }
});

router.post("/register", verifyToken, requirePermission("users"), async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const role = req.body.role || "EMPLOYEE";
    const permissions = req.body.permissions || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Nombre, correo y contraseña son obligatorios"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        ok: false,
        message: "La contraseña debe tener al menos 8 caracteres"
      });
    }

    if (!["ADMIN", "EMPLOYEE"].includes(role)) {
      return res.status(400).json({
        ok: false,
        message: "Rol inválido"
      });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Ya existe un usuario con ese correo"
      });
    }

    const id = createId();
    const passwordHash = await bcrypt.hash(password, 10);
    const dbPermissions = permissionsToDb(permissions, role);

    await pool.execute(
      `INSERT INTO users
        (id, name, email, passwordHash, role, isActive,
         canDashboard, canOrders, canUsers, canProducts, canDeliveryPoints)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        email,
        passwordHash,
        role,
        req.body.isActive === false ? 0 : 1,
        dbPermissions.canDashboard,
        dbPermissions.canOrders,
        dbPermissions.canUsers,
        dbPermissions.canProducts,
        dbPermissions.canDeliveryPoints
      ]
    );

    const [created] = await pool.execute(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id]
    );

    return res.status(201).json({
      ok: true,
      message: "Usuario creado correctamente",
      user: mapUser(created[0]),
      data: mapUser(created[0])
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al crear usuario"
    });
  }
});

router.put("/users/:id", verifyToken, requirePermission("users"), async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id]
    );

    const existingUser = rows[0];

    if (!existingUser) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado"
      });
    }

    const name = req.body.name?.trim() || existingUser.name;
    const email = req.body.email?.trim().toLowerCase() || existingUser.email;
    const role = req.body.role || existingUser.role;
    const isActive = req.body.isActive === undefined ? existingUser.isActive : req.body.isActive ? 1 : 0;
    const permissions = req.body.permissions || getPermissionsFromUser(existingUser);

    if (!["ADMIN", "EMPLOYEE"].includes(role)) {
      return res.status(400).json({
        ok: false,
        message: "Rol inválido"
      });
    }

    const [duplicate] = await pool.execute(
      "SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1",
      [email, id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Ya existe otro usuario con ese correo"
      });
    }

    const dbPermissions = permissionsToDb(permissions, role);

    if (req.body.password && req.body.password.trim()) {
      if (req.body.password.length < 8) {
        return res.status(400).json({
          ok: false,
          message: "La contraseña debe tener al menos 8 caracteres"
        });
      }

      const passwordHash = await bcrypt.hash(req.body.password, 10);

      await pool.execute(
        `UPDATE users
         SET name = ?, email = ?, role = ?, isActive = ?, passwordHash = ?,
             canDashboard = ?, canOrders = ?, canUsers = ?, canProducts = ?, canDeliveryPoints = ?
         WHERE id = ?`,
        [
          name,
          email,
          role,
          isActive,
          passwordHash,
          dbPermissions.canDashboard,
          dbPermissions.canOrders,
          dbPermissions.canUsers,
          dbPermissions.canProducts,
          dbPermissions.canDeliveryPoints,
          id
        ]
      );
    } else {
      await pool.execute(
        `UPDATE users
         SET name = ?, email = ?, role = ?, isActive = ?,
             canDashboard = ?, canOrders = ?, canUsers = ?, canProducts = ?, canDeliveryPoints = ?
         WHERE id = ?`,
        [
          name,
          email,
          role,
          isActive,
          dbPermissions.canDashboard,
          dbPermissions.canOrders,
          dbPermissions.canUsers,
          dbPermissions.canProducts,
          dbPermissions.canDeliveryPoints,
          id
        ]
      );
    }

    const [updated] = await pool.execute(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id]
    );

    return res.json({
      ok: true,
      message: "Usuario actualizado correctamente",
      user: mapUser(updated[0]),
      data: mapUser(updated[0])
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al actualizar usuario"
    });
  }
});

router.delete("/users/:id", verifyToken, requirePermission("users"), async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        ok: false,
        message: "No puedes eliminar tu propia cuenta"
      });
    }

    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id]
    );

    if (!rows[0]) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado"
      });
    }

    await pool.execute("DELETE FROM users WHERE id = ?", [id]);

    return res.json({
      ok: true,
      message: "Usuario eliminado correctamente"
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al eliminar usuario"
    });
  }
});

module.exports = router;
