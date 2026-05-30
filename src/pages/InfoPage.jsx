import { Link } from "react-router-dom";

const INFO_CONTENT = {
  terms: {
    eyebrow: "Compra segura",
    title: "Terminos y condiciones",
    intro:
      "Estas condiciones explican como funcionan los pedidos, pagos, entregas y cambios dentro de la tienda.",
    sections: [
      {
        title: "Pedidos",
        text:
          "Los pedidos se procesan segun disponibilidad de stock. Al enviar un pedido, revisaremos la informacion y confirmaremos los detalles antes de completar la entrega."
      },
      {
        title: "Pagos",
        text:
          "Los pagos pueden realizarse en efectivo o mediante link de pago cuando la opcion este disponible. Un pedido con link de pago se confirma cuando el pago aparece aprobado."
      },
      {
        title: "Entregas",
        text:
          "Las entregas pueden coordinarse por punto de entrega o delivery. Los tiempos y costos pueden variar segun zona, disponibilidad y forma de entrega seleccionada."
      },
      {
        title: "Cambios y cancelaciones",
        text:
          "Si necesitas cancelar o ajustar un pedido, contactanos lo antes posible. Los cambios dependen del estado del pedido y de si ya fue preparado o entregado."
      }
    ]
  },
  howToBuy: {
    eyebrow: "Guia rapida",
    title: "Como comprar",
    intro:
      "Comprar en Variedades Store es sencillo: eliges productos, completas tus datos y coordinamos por WhatsApp.",
    sections: [
      {
        title: "1. Elige tus productos",
        text:
          "Explora el catalogo, filtra por categoria y agrega al carrito los productos que quieras comprar."
      },
      {
        title: "2. Revisa tu carrito",
        text:
          "Confirma cantidades, productos y total. Puedes quitar productos o ajustar unidades antes de enviar el pedido."
      },
      {
        title: "3. Completa tus datos",
        text:
          "Ingresa tu nombre, telefono, metodo de entrega y metodo de pago para que podamos procesar el pedido."
      },
      {
        title: "4. Confirma y coordina",
        text:
          "Cuando crees el pedido, se abrira WhatsApp o el link de pago segun la opcion seleccionada."
      }
    ]
  },
  contact: {
    eyebrow: "Estamos cerca",
    title: "Contacto",
    intro:
      "Si tienes dudas sobre disponibilidad, entregas, pagos o un pedido, puedes escribirnos para ayudarte.",
    sections: [
      {
        title: "Atencion por WhatsApp",
        text:
          "Usa el carrito para generar tu pedido y abrir el mensaje de WhatsApp con el detalle listo para enviar."
      },
      {
        title: "Consultas de productos",
        text:
          "Puedes preguntar por colores, modelos disponibles, entregas o reposicion de productos agotados."
      },
      {
        title: "Soporte de pedidos",
        text:
          "Ten a mano tu nombre y el producto que pediste para ubicar mas rapido la informacion."
      }
    ]
  },
  about: {
    eyebrow: "Nuestra tienda",
    title: "Quienes somos",
    intro:
      "Variedades Store reune productos practicos y bonitos para belleza, hogar, tecnologia, moda, mascotas y regalos.",
    sections: [
      {
        title: "Catalogo variado",
        text:
          "Organizamos cada producto por categoria para que encuentres rapido lo que necesitas."
      },
      {
        title: "Tienda cercana",
        text:
          "Queremos que comprar sea claro, facil y confiable, con informacion ordenada y atencion directa."
      },
      {
        title: "Pedidos simples",
        text:
          "El carrito arma el detalle del pedido para que puedas enviarlo por WhatsApp sin escribir todo a mano."
      }
    ]
  }
};

function InfoPage({ type }) {
  const content = INFO_CONTENT[type] || INFO_CONTENT.about;

  return (
    <div className="page info-page">
      <section className="info-hero">
        <span>{content.eyebrow}</span>
        <h2>{content.title}</h2>
        <p>{content.intro}</p>
      </section>

      <section className="info-grid">
        {content.sections.map((section) => (
          <article className="info-card" key={section.title}>
            <h3>{section.title}</h3>
            <p>{section.text}</p>
          </article>
        ))}
      </section>

      <section className="info-cta">
        <div>
          <h3>Listo para ver productos?</h3>
          <p>Vuelve al catalogo y encuentra lo que necesitas.</p>
        </div>
        <Link to="/" className="hero-button">
          Ver catalogo
        </Link>
      </section>
    </div>
  );
}

export default InfoPage;
