const { query, getConnection } = require("../db");
const { mapCategory } = require("../mappers/store.mappers");
const { createId } = require("../utils/id");

async function listCategories(req, res) {
  try {
    const rows = await query("SELECT * FROM categories ORDER BY createdAt DESC");

    res.json({
      ok: true,
      data: rows.map(mapCategory)
    });
  } catch (error) {
    console.error("Error al obtener categorias:", error);

    res.status(500).json({
      ok: false,
      message: "Error al obtener categorias"
    });
  }
}

async function createCategory(req, res) {
  try {
    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({
        ok: false,
        message: "El nombre de la categoria es obligatorio"
      });
    }

    const existing = await query(
      "SELECT id FROM categories WHERE name = :name LIMIT 1",
      { name }
    );

    if (existing.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Ya existe una categoria con ese nombre"
      });
    }

    const id = createId();

    await query("INSERT INTO categories (id, name) VALUES (:id, :name)", {
      id,
      name
    });

    const created = await query("SELECT * FROM categories WHERE id = :id", {
      id
    });

    res.status(201).json({
      ok: true,
      message: "Categoria creada correctamente",
      data: mapCategory(created[0])
    });
  } catch (error) {
    console.error("Error al crear categoria:", error);

    res.status(500).json({
      ok: false,
      message: "Error al crear categoria"
    });
  }
}

async function deleteCategory(req, res) {
  const connection = await getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [categoryRows] = await connection.execute(
      "SELECT * FROM categories WHERE id = ? LIMIT 1",
      [id]
    );

    if (!categoryRows[0]) {
      await connection.rollback();

      return res.status(404).json({
        ok: false,
        message: "Categoria no encontrada"
      });
    }

    let [uncategorizedRows] = await connection.execute(
      "SELECT * FROM categories WHERE name = 'Sin categoría' LIMIT 1"
    );

    let uncategorizedId = uncategorizedRows[0]?.id;

    if (!uncategorizedId) {
      uncategorizedId = "sin-categoria";

      await connection.execute(
        "INSERT INTO categories (id, name) VALUES (?, 'Sin categoría')",
        [uncategorizedId]
      );
    }

    await connection.execute(
      "UPDATE products SET categoryId = ? WHERE categoryId = ?",
      [uncategorizedId, id]
    );

    await connection.execute("DELETE FROM categories WHERE id = ?", [id]);

    await connection.commit();

    res.json({
      ok: true,
      message: "Categoria eliminada y productos reasignados a 'Sin categoría'"
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error al eliminar categoria:", error);

    res.status(500).json({
      ok: false,
      message: "Error al eliminar categoria"
    });
  } finally {
    connection.release();
  }
}

module.exports = {
  listCategories,
  createCategory,
  deleteCategory
};
