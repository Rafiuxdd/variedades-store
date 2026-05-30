const axios = require("axios");

async function getWompiAccessToken() {
  const tokenUrl =
    process.env.WOMPI_TOKEN_URL || "https://id.wompi.sv/connect/token";
  const clientId = process.env.WOMPI_CLIENT_ID;
  const clientSecret = process.env.WOMPI_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Faltan WOMPI_CLIENT_ID o WOMPI_CLIENT_SECRET en el .env");
  }

  const body = new URLSearchParams();
  body.append("grant_type", "client_credentials");
  body.append("client_id", clientId);
  body.append("client_secret", clientSecret);
  body.append("audience", "wompi_api");

  const response = await axios.post(tokenUrl, body.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });

  if (!response.data?.access_token) {
    throw new Error("Wompi no devolvió access_token");
  }

  return response.data.access_token;
}

async function createWompiPaymentLink({
  orderId,
  amount,
  productName,
  customerEmail = ""
}) {
  const apiUrl = process.env.WOMPI_API_URL || "https://api.wompi.sv";
  const redirectUrl = process.env.WOMPI_REDIRECT_URL;
  const webhookUrl = process.env.WOMPI_WEBHOOK_URL;

  if (!redirectUrl || !webhookUrl) {
    throw new Error("Faltan WOMPI_REDIRECT_URL o WOMPI_WEBHOOK_URL en el .env");
  }

  if (process.env.NODE_ENV === "production") {
    if (!redirectUrl.startsWith("https://") || !webhookUrl.startsWith("https://")) {
      throw new Error("Las URLs de Wompi deben usar https en produccion");
    }

    if (!process.env.WOMPI_API_SECRET) {
      throw new Error("Falta WOMPI_API_SECRET para validar webhooks en produccion");
    }
  }

  const accessToken = await getWompiAccessToken();

  const payload = {
    identificadorEnlaceComercio: String(orderId),
    monto: Number(amount),
    nombreProducto: productName,
    Configuracion: {
      urlRedirect: redirectUrl,
      urlWebhook: webhookUrl,
      notificarTransaccionCliente: true
    },
    infoProducto: {
      descripcionProducto: `Pedido ${orderId} de Variedades Store`
    }
  };

  if (customerEmail && customerEmail.trim()) {
    payload.Configuracion.emailsNotificacion = customerEmail.trim();
  }

  const response = await axios.post(`${apiUrl}/EnlacePago`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.data?.urlEnlace) {
    throw new Error("Wompi no devolvió urlEnlace");
  }

  return response.data;
}

module.exports = {
  getWompiAccessToken,
  createWompiPaymentLink
};
