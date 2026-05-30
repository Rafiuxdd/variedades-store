const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.deliveryPoint.count();

  if (count === 0) {
    await prisma.deliveryPoint.createMany({
      data: [
        {
          name: "Metrocentro Sonsonate",
          address: "Centro comercial Metrocentro Sonsonate",
          reference: "Entrada principal",
          schedule: "Lunes a domingo, 10:00 AM - 6:00 PM",
          isActive: true
        },
        {
          name: "Parque Central",
          address: "Parque central de Sonsonate",
          reference: "Frente a la iglesia",
          schedule: "Lunes a sábado, 2:00 PM - 5:00 PM",
          isActive: true
        }
      ]
    });
  }

  console.log("Puntos de entrega insertados correctamente");
}

main()
  .catch((error) => {
    console.error("Error insertando puntos de entrega:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });