#!/usr/bin/env python3
"""
Genera una vista previa local de sections/seguimiento.liquid sin Shopify.

Sirve para revisar el diseno y las traducciones rapido, sin levantar
el tema completo. Reemplaza las variables de Liquid por los valores
por defecto del schema y arma un HTML suelto.

Uso:
    python3 proxy-seguimiento/preview-local.py
    # luego abre la URL que imprime en la terminal
"""

import http.server
import os
import pathlib
import re
import socketserver

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SALIDA = pathlib.Path("/tmp/preview-seguimiento")

VALORES = {
    "sid": "demo",
    "section.settings.titulo": "Sigue tu pedido",
    "section.settings.bajada": (
        "Ingresa tu numero de seguimiento o busca con tu numero de pedido y tu email."
    ),
    "section.settings.tab_numero": "Numero de seguimiento",
    "section.settings.tab_pedido": "Numero de pedido",
    "section.settings.texto_ayuda": (
        "<p>Los envios suelen demorar entre 9 y 16 dias corridos. Si tu pedido lleva mas "
        'de 15 dias, <a href="https://wa.me/message/Z5XXALWPDL4GI1" target="_blank">escribenos</a> y lo revisamos.</p>'
    ),
    "section.settings.accent_color": "#00E676",
    "section.settings.card_color": "#101010",
    "section.settings.padding_top": "48",
    "section.settings.padding_bottom": "72",
}


def compilar(liquid: str) -> str:
    # Fuera los bloques que no son HTML
    liquid = re.sub(r"\{%\s*comment\s*%\}.*?\{%\s*endcomment\s*%\}", "", liquid, flags=re.S)
    liquid = re.sub(r"\{%\s*schema\s*%\}.*?\{%\s*endschema\s*%\}", "", liquid, flags=re.S)
    liquid = re.sub(r"\{%-?\s*assign[^%]*%\}", "", liquid)

    # El {% if %} de la ayuda siempre se cumple en la vista previa
    liquid = re.sub(r"\{%\s*if[^%]*%\}", "", liquid)
    liquid = re.sub(r"\{%\s*endif\s*%\}", "", liquid)

    # Los assets se sirven desde la misma carpeta
    liquid = re.sub(
        r"\{\{\s*'(seguimiento-[\w-]+\.js)'\s*\|\s*asset_url\s*\}\}", r"\1", liquid
    )

    # Variables del schema
    for clave, valor in VALORES.items():
        liquid = re.sub(r"\{\{-?\s*" + re.escape(clave) + r"\s*-?\}\}", valor, liquid)

    faltantes = re.findall(r"\{\{[^}]*\}\}|\{%[^%]*%\}", liquid)
    if faltantes:
        print("Aviso: quedaron etiquetas de Liquid sin resolver:")
        for etiqueta in sorted(set(faltantes)):
            print("   ", etiqueta.strip())

    return liquid


def preparar_diccionario() -> str:
    """
    Copia el diccionario de traducciones a la vista previa.

    Si se define PROXY_URL, apunta la vista previa a ese proxy y apaga
    el modo demo. El archivo del tema no se modifica, el cambio solo
    afecta a la copia que se sirve en local.
    """
    contenido = (RAIZ / "assets" / "seguimiento-estados.js").read_text(encoding="utf-8")
    proxy = os.environ.get("PROXY_URL", "").strip()

    if not proxy:
        print("Modo demo: datos de ejemplo (define PROXY_URL para usar datos reales)")
        return contenido

    contenido, cambios_url = re.subn(
        r"proxyUrl:\s*'[^']*'", f"proxyUrl: '{proxy}'", contenido, count=1
    )
    contenido, cambios_demo = re.subn(
        r"modoDemo:\s*(true|false)", "modoDemo: false", contenido, count=1
    )

    if not cambios_url or not cambios_demo:
        print("Aviso: no se pudo reescribir proxyUrl o modoDemo en el diccionario")
    else:
        print(f"Datos reales: consultando a {proxy}")

    return contenido


def main() -> None:
    seccion = (RAIZ / "sections" / "seguimiento.liquid").read_text(encoding="utf-8")
    cuerpo = compilar(seccion)

    SALIDA.mkdir(parents=True, exist_ok=True)
    SALIDA.joinpath("seguimiento-estados.js").write_text(
        preparar_diccionario(), encoding="utf-8"
    )
    SALIDA.joinpath("seguimiento-motor.js").write_text(
        (RAIZ / "assets" / "seguimiento-motor.js").read_text(encoding="utf-8"),
        encoding="utf-8",
    )

    html = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vista previa - Seguimiento</title>
<style>
  html, body {{
    margin: 0;
    background: #000;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }}
  /* Imita la regla global del tema que fuerza texto blanco */
  body, p, h1, span, div, a, label, input {{ color: #ffffff; }}
</style>
</head>
<body>
{cuerpo}
</body>
</html>
"""
    (SALIDA / "index.html").write_text(html, encoding="utf-8")

    puerto = 8730
    handler = lambda *a, **k: http.server.SimpleHTTPRequestHandler(
        *a, directory=str(SALIDA), **k
    )

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", puerto), handler) as servidor:
        print(f"Vista previa en http://127.0.0.1:{puerto}")
        print(f"Estados de ejemplo: ?demo=transit | aduana | delivered | pickup | inforeceived")
        servidor.serve_forever()


if __name__ == "__main__":
    main()
