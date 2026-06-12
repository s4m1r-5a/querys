FROM node:20-alpine

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

ENV NODE_ENV=production \
    PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
    && mkdir -p /usr/src/app /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /usr/src/app /home/pptruser

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --chown=pptruser:pptruser . .

EXPOSE 9000

USER pptruser

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -q -O- "http://127.0.0.1:${PORT:-9000}/api" || exit 1

CMD [ "npm", "start" ]
