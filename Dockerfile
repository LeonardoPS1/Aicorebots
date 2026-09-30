FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html 404.html robots.txt sitemap.xml /usr/share/nginx/html/
COPY productos/ /usr/share/nginx/html/productos/
COPY faq/ /usr/share/nginx/html/faq/
COPY privacidad/ /usr/share/nginx/html/privacidad/
COPY terminos/ /usr/share/nginx/html/terminos/
COPY aviso-legal/ /usr/share/nginx/html/aviso-legal/
COPY assets/ /usr/share/nginx/html/assets/
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
