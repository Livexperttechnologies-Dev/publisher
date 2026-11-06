# ==============================================================================
# Production Dockerfile for KIBO360 Static Marketing Website (Root Context)
# ==============================================================================

FROM nginx:1.25-alpine

WORKDIR /usr/share/nginx/html

# Remove default nginx HTML
RUN rm -rf ./*

# Copy static marketing pages and assets
COPY index.html about.html contact.html privacy-policy.html terms.html favicon.png robots.txt sitemap.xml ./
COPY assets ./assets
COPY products ./products

# Copy nginx configuration
COPY deployment/nginx/marketing.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
