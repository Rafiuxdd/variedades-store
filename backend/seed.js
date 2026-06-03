const { query } = require("./db");

const categories = [
  ["sin-categoria", "Sin categoría"],
  ["celulares", "Accesorios para celulares"],
  ["tecnologia", "Tecnologia"],
  ["mascotas", "Mascotas"],
  ["cabello", "Cabello"],
  ["hogar-cocina", "Hogar y cocina"],
  ["cuidado-personal", "Cuidado personal"],
  ["ninos-juguetes", "Ninos y juguetes"],
  ["maquillaje", "Maquillaje"],
  ["variedades", "Variedades"],
  ["bicicleta", "Accesorios para bicicleta"]
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
  ["mochila-transportadora-gato", "Mochila transportadora para gato", "Mochila ventilada para transportar gatos pequenos con mayor comodidad.", 28.5, 4, "/product-images/mochila-para-gato.jpeg", "mascotas"],
  ["producto-rosado-por-confirmar", "Producto rosado por confirmar", "Producto agregado desde enlace compartido de Google pendiente de confirmar.", 1, 1, "/product-images/no-image.svg", "variedades"],
  ["slice-picker-rs168", "Slice Picker RS-168", "Utensilio manual tipo slice picker RS-168 para cortes decorativos o laminas pequenas en cocina.", 3.5, 3, "/product-images/producto-rosado-rojo.webp", "hogar-cocina"],
  ["dispensador-agua-mclassic-md02", "Dispensador de agua MClassic MD-02", "Dispensador automatico de agua MClassic MD-02 recargable por USB para botellones.", 7.99, 3, "/product-images/producto-blanco.webp", "hogar-cocina"],
  ["labiales-infantiles-florales", "Labiales infantiles florales", "Labiales de colores con empaque floral, ideales para juego, detalle o uso cosmetico ligero.", 1.99, 12, "/product-images/producto-colores-12.jpg", "maquillaje"],
  ["labial-liquido-annasa-moisture", "Labial liquido Annasa Moisture", "Labial liquido Annasa Moisture con acabado brillante y tonos variados.", 2.5, 10, "/product-images/producto-modelos-colores.jpg", "maquillaje"],
  ["cover-silicon-space-iphone", "Cover Silicon Space para iPhone", "Cover Silicon Space para celular, funda flexible de uso diario con proteccion trasera y bordes suaves.", 3.99, 14, "https://mayoreo.mundoinnovacionhn.com/wp-content/uploads/2023/08/176378-Cober-Silicon-Space-Honor-X8.jpg", "celulares"],
  ["calculadora-casio-hl815l", "Calculadora Casio HL-815L", "Calculadora basica Casio HL-815L de 8 digitos. Uso: escuela, oficina y comercio. Precio pendiente de confirmar.", 1, 2, "/product-images/no-image.svg", "tecnologia"],
  ["calculadora-ruizuon-rz8098", "Calculadora Ruizuon RZ-8098", "Calculadora basica de bolsillo Ruizuon RZ-8098. Color observado: rosa. Precio pendiente de confirmar.", 1, 2, "/product-images/no-image.svg", "tecnologia"],
  ["cargador-fast-charger-2en1-6a", "Cargador Fast Charger 2 en 1 - 6.0A", "Cargador 2 en 1 Fast Charger de carga rapida, 6.0A y cable incluido. Precio pendiente de confirmar.", 1, 2, "/product-images/no-image.svg", "celulares"],
  ["mobile-phone-holder-vehiculo", "Mobile Phone Holder", "Soporte para celular de vehiculo con ventosa para parabrisas o tablero. Precio visible: $4.00.", 4, 2, "/product-images/no-image.svg", "celulares"],
  ["funda-vanguard-samsung-a04", "Funda Vanguard Samsung A04", "Funda Vanguard para Samsung A04 tipo silicona Soft Touch. Color visible: morado/lila. Precio visible: $5.00.", 5, 2, "/product-images/no-image.svg", "celulares"],
  ["funda-durazno-naranja", "Funda color durazno/naranja", "Funda para celular color durazno o naranja. Compatibilidad pendiente de confirmar. Precio visible: $5.00.", 5, 2, "/product-images/no-image.svg", "celulares"],
  ["rectangular-self-cleaning-comb", "Rectangular Self-Cleaning Comb", "Cepillo autolimpiante rectangular para gatos y perros. Retira pelo muerto y expulsa el pelo acumulado con boton. Precio pendiente de confirmar.", 1, 2, "/product-images/no-image.svg", "mascotas"],
  ["bolsa-celular-bicicleta-impermeable", "Bolsa impermeable para celular de bicicleta", "Bolsa impermeable para celular con montaje en manubrio y compartimento para telefono. Precio visible aproximado: $4.00.", 4, 2, "/product-images/no-image.svg", "bicicleta"],
  ["cable-blanco-usb", "Cable blanco USB", "Cable blanco USB para carga. Compatibilidad pendiente de confirmar: parece iPhone o USB-C. Precio visible: $4.00.", 4, 2, "/product-images/no-image.svg", "celulares"],
  ["adaptador-usb-magnetico-celular", "Adaptador USB magnetico para celular", "Adaptador o soporte magnetico para celular en caja naranja. Parece accesorio magnetico para automovil. Precio pendiente de confirmar.", 1, 2, "/product-images/no-image.svg", "celulares"]
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
