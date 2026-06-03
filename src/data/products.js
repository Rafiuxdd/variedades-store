const products = [
  {
    id: "teclado-mouse-imice-an300",
    name: "Teclado y mouse iMICE AN-300",
    price: 18.99,
    stock: 2,
    image: "/product-images/teclado-mouse-imice-an300.jpg",
    category: "Tecnologia",
    description:
      "Combo de teclado y mouse iMICE para oficina, estudio o uso diario.\nColores: Negro con iluminacion multicolor segun modelo.\nIncluye: Teclado, mouse y empaque."
  },
  {
    id: "plancha-cabello-gwb",
    name: "Plancha de cabello GWB",
    price: 12.99,
    stock: 2,
    image: "/product-images/plancha-cabello-gwb.png",
    category: "Cabello",
    description:
      "Plancha GWB compacta para alisar y retocar el cabello en casa.\nColores: Segun disponibilidad.\nUso: Cabello seco, retoques rapidos y peinados diarios."
  },
  {
    id: "secadora-cabello-superker",
    name: "Secadora de cabello Superker",
    price: 15.99,
    stock: 2,
    image: "/product-images/secadora-superker.webp",
    category: "Cabello",
    description:
      "Secadora Superker practica para secado rapido y peinados diarios.\nColores: Segun disponibilidad.\nUso: Secado de cabello en casa."
  },
  {
    id: "peine-electrico-gwb-gw6595",
    name: "Peine electrico GWB GW-6595",
    price: 8.99,
    stock: 2,
    image: "/product-images/peine-gwb-gw6595.jpg",
    category: "Cabello",
    description:
      "Peine electrico GWB GW-6595 para estilizar el cabello con facilidad.\nColores: Segun disponibilidad.\nUso: Peinado y retoque diario."
  },
  {
    id: "ice-cube-maker-genie",
    name: "Ice Cube Maker Genie",
    price: 6.99,
    stock: 2,
    image: "/product-images/ice-cube-maker-genie.webp",
    category: "Hogar y cocina",
    description:
      "Molde practico para hacer y servir cubos de hielo en casa.\nColores: Segun disponibilidad.\nUso: Preparar, guardar y servir hielo."
  },
  {
    id: "magic-suction-cup-celular",
    name: "Magic Suction Cup para celular",
    price: 4.99,
    stock: 2,
    image: "/product-images/magic-suction-cup-phone.jpg",
    category: "Accesorios para celulares",
    description:
      "Soporte con ventosas para sujetar el celular de forma comoda.\nColores: Segun disponibilidad.\nUso: Apoyo para grabar, tomar fotos o colocar el telefono en superficies lisas."
  },
  {
    id: "masajeador-cuello-kh960",
    name: "Masajeador de cuello KH-960",
    price: 14.99,
    stock: 2,
    image: "/product-images/masajeador-cuello-kh960.png",
    category: "Cuidado personal",
    description:
      "Masajeador cervical electrico para relajacion y uso personal.\nColores: Segun disponibilidad.\nUso: Masaje de cuello con modos de intensidad."
  },
  {
    id: "juguete-musical-bebe",
    name: "Juguete musical educativo para bebe",
    price: 9.99,
    stock: 2,
    image: "/product-images/juguete-musical-bebe.jpg",
    category: "Ninos y juguetes",
    description:
      "Juguete colorido con actividad musical para estimulacion temprana.\nColores: Multicolor.\nUso: Entretenimiento y desarrollo sensorial."
  },
  {
    id: "cable-tipo-c-mtmax",
    name: "Cable Tipo C MTMAX",
    price: 3.99,
    stock: 2,
    image: "/product-images/cable-tipo-c-mtmax.webp",
    category: "Accesorios para celulares",
    description:
      "Cable Tipo C para carga rapida y uso diario con dispositivos compatibles.\nColores: Blanco.\nUso: Carga y transferencia de datos en equipos compatibles."
  },
  {
    id: "mochila-transportadora-gato",
    name: "Mochila transportadora para gato",
    price: 28.5,
    stock: 2,
    image: "/product-images/mochila-para-gato.jpeg",
    category: "Mascotas",
    description:
      "Mochila ventilada para transportar gatos pequenos con mayor comodidad.\nColores: Segun disponibilidad.\nUso: Transporte seguro de mascotas pequenas."
  },
  {
    id: "producto-rosado-por-confirmar",
    name: "Producto rosado por confirmar",
    price: 1,
    stock: 1,
    image: "/product-images/no-image.svg",
    category: "Variedades",
    description:
      "Producto agregado desde enlace compartido de Google pendiente de confirmar, porque el enlace no expone la ficha publica del producto.\nColores: Rosado.\nNota: Actualizar nombre, imagen y precio cuando se confirme el articulo."
  },
  {
    id: "slice-picker-rs168",
    name: "Slice Picker RS-168",
    price: 3.5,
    stock: 3,
    image: "/product-images/producto-rosado-rojo.webp",
    category: "Hogar y cocina",
    description:
      "Utensilio manual tipo slice picker RS-168 para cortes decorativos o laminas pequenas en cocina.\nColores: Rojo.\nIncluye: Herramienta manual con empaque."
  },
  {
    id: "dispensador-agua-mclassic-md02",
    name: "Dispensador de agua MClassic MD-02",
    price: 7.99,
    stock: 3,
    image: "/product-images/producto-blanco.webp",
    category: "Hogar y cocina",
    description:
      "Dispensador automatico de agua MClassic MD-02 recargable por USB para botellones.\nColores: Blanco.\nIncluye: Manguera, tubo metalico y cable USB."
  },
  {
    id: "labiales-infantiles-florales",
    name: "Labiales infantiles florales",
    price: 1.99,
    stock: 12,
    image: "/product-images/producto-colores-12.jpg",
    category: "Maquillaje",
    description:
      "Labiales de colores con empaque floral, ideales para juego, detalle o uso cosmetico ligero segun disponibilidad.\nColores y stock: 2 azul, 2 amarillo, 2 naranja, 2 rojo, 2 verde y 2 rosado.\nPresentacion: Barra tipo labial."
  },
  {
    id: "labial-liquido-annasa-moisture",
    name: "Labial liquido Annasa Moisture",
    price: 2.5,
    stock: 10,
    image: "/product-images/producto-modelos-colores.jpg",
    category: "Maquillaje",
    description:
      "Labial liquido Annasa Moisture con acabado brillante y tonos variados.\nColores: Rojo, vino, nude, rosa, marron y terracota segun modelos visibles.\nNota: Confirmar tonos exactos al preparar pedido."
  },
  {
    id: "cover-silicon-space-iphone",
    name: "Cover Silicon Space para iPhone",
    price: 3.99,
    stock: 14,
    image: "https://mayoreo.mundoinnovacionhn.com/wp-content/uploads/2023/08/176378-Cober-Silicon-Space-Honor-X8.jpg",
    category: "Accesorios para celulares",
    description:
      "Cover Silicon Space para celular, funda flexible de uso diario con proteccion trasera y bordes suaves.\nModelos iPhone: iPhone 11, 11 Pro, 11 Pro Max, 12, 12 Pro, 12 Pro Max, 13, 13 Pro, 13 Pro Max, 14, 14 Plus, 14 Pro, 14 Pro Max, 15, 15 Plus, 15 Pro, 15 Pro Max, 16, 16 Plus, 16 Pro y 16 Pro Max.\nColores: Negro, azul, rosado, morado, verde, rojo y transparente segun disponibilidad. Luego se retiran los modelos o colores que no esten en inventario real."
  },
  {
    id: "calculadora-casio-hl815l",
    name: "Calculadora Casio HL-815L",
    price: 1,
    stock: 2,
    image: "/product-images/no-image.svg",
    category: "Tecnologia",
    description:
      "Calculadora basica Casio HL-815L de 8 digitos.\nUso: Escuela, oficina y comercio.\nNota: Precio pendiente de confirmar."
  },
  {
    id: "calculadora-ruizuon-rz8098",
    name: "Calculadora Ruizuon RZ-8098",
    price: 1,
    stock: 2,
    image: "/product-images/no-image.svg",
    category: "Tecnologia",
    description:
      "Calculadora basica de bolsillo Ruizuon RZ-8098.\nColor observado: Rosa.\nUso: Escuela, oficina y comercio.\nNota: Precio pendiente de confirmar."
  },
  {
    id: "cargador-fast-charger-2en1-6a",
    name: "Cargador Fast Charger 2 en 1 - 6.0A",
    price: 1,
    stock: 2,
    image: "/product-images/no-image.svg",
    category: "Accesorios para celulares",
    description:
      "Cargador 2 en 1 Fast Charger de carga rapida.\nCaracteristicas visibles: 6.0A y cable incluido.\nNota: Precio pendiente de confirmar."
  },
  {
    id: "mobile-phone-holder-vehiculo",
    name: "Mobile Phone Holder",
    price: 4,
    stock: 2,
    image: "/product-images/no-image.svg",
    category: "Accesorios para celulares",
    description:
      "Soporte para celular de vehiculo con ventosa para parabrisas o tablero.\nPrecio visible: $4.00.\nUso: Sujetar el telefono en carro."
  },
  {
    id: "funda-vanguard-samsung-a04",
    name: "Funda Vanguard Samsung A04",
    price: 5,
    stock: 2,
    image: "/product-images/no-image.svg",
    category: "Accesorios para celulares",
    description:
      "Funda Vanguard para Samsung A04 tipo silicona Soft Touch.\nColor visible: Morado/Lila.\nPrecio visible: $5.00."
  },
  {
    id: "funda-durazno-naranja",
    name: "Funda color durazno/naranja",
    price: 5,
    stock: 2,
    image: "/product-images/no-image.svg",
    category: "Accesorios para celulares",
    description:
      "Funda para celular color durazno o naranja.\nCompatibilidad pendiente de confirmar: parece iPhone o Samsung.\nPrecio visible: $5.00."
  },
  {
    id: "rectangular-self-cleaning-comb",
    name: "Rectangular Self-Cleaning Comb",
    price: 1,
    stock: 2,
    image: "/product-images/no-image.svg",
    category: "Mascotas",
    description:
      "Cepillo autolimpiante rectangular para gatos y perros.\nFuncion: Retira pelo muerto y usa boton para expulsar el pelo acumulado.\nNota: Precio pendiente de confirmar."
  },
  {
    id: "bolsa-celular-bicicleta-impermeable",
    name: "Bolsa impermeable para celular de bicicleta",
    price: 4,
    stock: 2,
    image: "/product-images/no-image.svg",
    category: "Accesorios para bicicleta",
    description:
      "Bolsa impermeable para celular con montaje en manubrio de bicicleta.\nIncluye compartimento para telefono.\nPrecio visible aproximado: $4.00."
  },
  {
    id: "cable-blanco-usb",
    name: "Cable blanco USB",
    price: 4,
    stock: 2,
    image: "/product-images/no-image.svg",
    category: "Accesorios para celulares",
    description:
      "Cable blanco USB para carga.\nCompatibilidad pendiente de confirmar: parece iPhone o USB-C.\nPrecio visible: $4.00."
  },
  {
    id: "adaptador-usb-magnetico-celular",
    name: "Adaptador USB magnetico para celular",
    price: 1,
    stock: 2,
    image: "/product-images/no-image.svg",
    category: "Accesorios para celulares",
    description:
      "Adaptador o soporte magnetico para celular en caja naranja.\nParece accesorio magnetico para automovil.\nNota: Precio pendiente de confirmar."
  }
];

export default products;
