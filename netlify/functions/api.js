const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade"
]);
const HTML_RESPONSE_PATTERN = /^\s*(?:<!doctype html|<html|<head|<body)/i;

function normalizeBackendUrl(value) {
  return String(value || "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");
}

function buildProxyHeaders(headers = {}) {
  const nextHeaders = {};

  Object.entries(headers).forEach(([key, value]) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      nextHeaders[key] = value;
    }
  });

  return nextHeaders;
}

function getForwardedSetCookies(headers) {
  if (typeof headers.raw === "function") {
    return headers.raw()["set-cookie"] || [];
  }

  const cookie = headers.get("set-cookie");
  return cookie ? [cookie] : [];
}

exports.handler = async (event) => {
  const backendUrl = normalizeBackendUrl(process.env.BACKEND_URL);
  const currentHost = event.headers.host || event.headers.Host || "";

  if (!backendUrl) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ok: false,
        message: "BACKEND_URL no esta configurado en Netlify."
      })
    };
  }

  if (currentHost && backendUrl.includes(currentHost)) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ok: false,
        message: "BACKEND_URL debe apuntar al backend en Railway, no a la URL de Netlify."
      })
    };
  }

  const apiPath = event.path.replace(/^\/(?:api|\.netlify\/functions\/api)/, "");
  const query = event.rawQuery ? `?${event.rawQuery}` : "";
  const targetUrl = `${backendUrl}/api${apiPath}${query}`;
  const headers = buildProxyHeaders(event.headers);
  const body = event.isBase64Encoded && event.body
    ? Buffer.from(event.body, "base64")
    : event.body;

  const response = await fetch(targetUrl, {
    method: event.httpMethod,
    headers,
    body: ["GET", "HEAD"].includes(event.httpMethod) ? undefined : body,
    redirect: "manual"
  });

  const responseHeaders = {};

  response.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase()) && key.toLowerCase() !== "set-cookie") {
      responseHeaders[key] = value;
    }
  });

  const setCookies = getForwardedSetCookies(response.headers);
  const responseBody = await response.text();
  const responseContentType = response.headers.get("content-type") || "";

  if (responseContentType.includes("text/html") || HTML_RESPONSE_PATTERN.test(responseBody)) {
    return {
      statusCode: response.ok ? 502 : response.status,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ok: false,
        message:
          response.status === 404
            ? "No se encontro el backend. Revisa que BACKEND_URL en Netlify apunte al dominio de Railway."
            : "El backend respondio con HTML en lugar de JSON."
      })
    };
  }

  return {
    statusCode: response.status,
    headers: responseHeaders,
    multiValueHeaders: setCookies.length > 0 ? { "set-cookie": setCookies } : undefined,
    body: responseBody
  };
};
