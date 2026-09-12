# Seguimiento SUNYOU — La Cábala

Configurado para `www.lacabala.cl` (`0aap7q-qc.myshopify.com`).

## Tema Shopify (ya copiado)

- `assets/seguimiento-estados.js`
- `assets/seguimiento-motor.js`
- `sections/seguimiento.liquid`
- `templates/page.seguimiento.json`

Worker publicado: `https://seguimiento-lacabala.lacabalachile.workers.dev`

`proxyUrl` y `modoDemo: false` ya estan en el tema. Sube el asset:

```sh
shopify theme push --only assets/seguimiento-estados.js \
  --only assets/seguimiento-motor.js \
  --only sections/seguimiento.liquid \
  --only templates/page.seguimiento.json \
  --only snippets/baul-footer.liquid
```

## Pagina en Shopify

1. Admin → Paginas → crear pagina con handle exacto: `seguimiento-de-pedido`
2. Asignar template `page.seguimiento`
3. URL final: https://www.lacabala.cl/pages/seguimiento-de-pedido

## Proxy Cloudflare

```sh
cd proxy-seguimiento
npx wrangler deploy
npx wrangler secret put TRACKING_API_KEY
npx wrangler secret put SHOPIFY_CLIENT_ID
npx wrangler secret put SHOPIFY_CLIENT_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put WEBHOOK_TOKEN
```

Webhook TrackingMore:

```
https://URL-DEL-WORKER.workers.dev/webhook?token=EL_WEBHOOK_TOKEN
```

Estados: transit, pickup, delivered, exception, etc.

Sin dominio verificado en Resend, los mails de prueba solo llegan al mail de la cuenta Resend.

## App Shopify (busqueda por pedido + email)

1. Admin → Apps → Desarrollar apps → Crear app
2. Permiso Admin API: `read_orders`
3. Instalar → copiar Client ID y Client Secret
4. Cargarlos con `wrangler secret put`

Sin esto, la pagina funciona solo con numero de seguimiento.

## Prueba

```sh
curl -X POST https://URL-DEL-WORKER.workers.dev \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://www.lacabala.cl' \
  -d '{"numero":"SYCLXXXXXXXXX"}'
```
