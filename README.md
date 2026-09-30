# Aicorebots

Sitio web de Aicore Agency (aicorebots.com). HTML, CSS y JS estáticos, sin build ni dependencias.

## Estructura

```
index.html            Home
productos/index.html  Detalle de cada producto (/productos/)
assets/site.css       Estilos compartidos
assets/site.js        JS compartido (WebGL del hero, chat demo, pipeline, terminal)
assets/productos.css  Estilos de /productos/
assets/productos.js   JS de /productos/ (índice lateral, mapa)
assets/favicon.svg
Dockerfile            nginx:alpine
nginx.conf
robots.txt, sitemap.xml
```

## Desarrollo local

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## Despliegue en Dokploy

1. Application, Provider: GitHub, repo `LeonardoPS1/Aicorebots`, rama `main`.
2. Build Type: `Dockerfile`, Docker File: `./Dockerfile`, Docker Context Path: `.`.
3. Domains: `aicorebots.com`, puerto del contenedor `80`, HTTPS con Let's Encrypt.
4. Activar Auto Deploy para que cada push a `main` redespliegue.

## Pendientes antes de publicar

- Reemplazar el número de WhatsApp `56900000000` (buscar en `index.html` y `productos/index.html`).
- Confirmar el correo `hola@aicorebots.com`.
- Revisar el estado de cada producto (badges en `productos/index.html`).
