const { query } = require("./db");

const categories = [
  ["sin-categoria", "Sin categoría"],
  ["celulares", "Accesorios para celulares"],
  ["tecnologia", "Tecnologia"],
  ["mascotas", "Mascotas"],
  ["cabello", "Cabello"],
  ["hogar-cocina", "Hogar y cocina"],
  ["cuidado-personal", "Cuidado personal"],
  ["ninos-juguetes", "Ninos y juguetes"]
];

const products = [
  ["teclado-mouse-imice-an300", "Teclado y mouse iMICE AN-300", "Combo de teclado y mouse iMICE para oficina, estudio o uso diario.", 18.99, 8, "/product-images/teclado-mouse-imice-an300.jpg", "tecnologia"],
  ["plancha-cabello-gwb", "Plancha de cabello GWB", "Plancha GWB compacta para alisar y retocar el cabello en casa.", 12.99, 10, "/product-images/plancha-cabello-gwb.png", "cabello"],
  ["secadora-cabello-superker", "Secadora de cabello Superker", "Secadora Superker practica para secado rapido y peinados diarios.", 15.99, 7, "/product-images/secadora-superker.webp", "cabello"],
  ["peine-electrico-gwb-gw6595", "Peine electrico GWB GW-6595", "Peine electrico GWB GW-6595 para estilizar el cabello con facilidad.", 8.99, 9, "/product-images/peine-gwb-gw6595.jpg", "cabello"],
  ["ice-cube-maker-genie", "Ice Cube Maker Genie", "Molde practico para hacer y servir cubos de hielo en casa.", 6.99, 12, "/product-images/ice-cube-maker-genie.webp", "hogar-cocina"],
  ["magic-suction-cup-celular", "Magic Suction Cup para celular", "Soporte con ventosas para sujetar el celular de forma comoda.", 4.99, 18, "/product-images/magic-suction-cup-phone.jpg", "celulares"],
  ["masajeador-cuello-kh960", "Masajeador de cuello KH-960", "Masajeador cervical electrico para relajacion y uso personal.", 14.99, 6, "/product-images/masajeador-cuello-kh960.png", "cuidado-personal"],
  ["juguete-musical-bebe", "Juguete musical educativo para bebe", "Juguete colorido con actividad musical para estimulacion temprana.", 9.99, 10, "/product-images/juguete-musical-bebe.jpg", "ninos-juguetes"],
  ["cable-tipo-c-mtmax", "Cable Tipo C MTMAX", "Cable Tipo C para carga rapida y uso diario con dispositivos compatibles.", 3.99, 20, "/product-images/cable-tipo-c-mtmax.webp", "celulares"],
  ["mochila-transportadora-gato", "Mochila transportadora para gato", "Mochila ventilada para transportar gatos pequenos con mayor comodidad.", 28.5, 4, "/product-images/mochila-para-gato.jpeg", "mascotas"]
];

async function main() {
  for (const [id, name] of categories) {
    await query("INSERT IGNORE INTO categories (id, name) VALUES (:id, :name)", {
      id,
      name
    });
  }

  const productIds = products.map((product) => product[0]);
  const placeholders = productIds.map(() => "?").join(", ");

  await query(
    `DELETE FROM products
     WHERE id NOT IN (${placeholders})
       AND id NOT IN (SELECT DISTINCT productId FROM order_items)`,
    productIds
  );

  await query(
    `UPDATE products SET isActive = 0 WHERE id NOT IN (${placeholders})`,
    productIds
  );

  for (const [id, name, description, price, stock, imageUrl, categoryId] of products) {
    await query(
      `INSERT INTO products
        (id, name, description, price, stock, imageUrl, categoryId)
       VALUES (:id, :name, :description, :price, :stock, :imageUrl, :categoryId)
       ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        description = VALUES(description),
        price = VALUES(price),
        stock = VALUES(stock),
        imageUrl = VALUES(imageUrl),
        categoryId = VALUES(categoryId),
        isActive = 1`,
      { id, name, description, price, stock, imageUrl, categoryId }
    );
  }

  console.log("Catalogo de productos del usuario insertado correctamente");
  process.exit(0);
}

main().catch((error) => {
  console.error("Error al insertar datos:", error);
  process.exit(1);
});
