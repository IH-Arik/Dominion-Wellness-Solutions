FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./next.config.ts

FROM node:20-alpine AS final

RUN apk add --no-cache nginx

WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=runner /app /app
RUN rm -rf /app/.next/standalone/.next && ln -s /app/.next /app/.next/standalone/.next
COPY nginx/default.conf /etc/nginx/http.d/default.conf

EXPOSE 80

CMD sh -c "node .next/standalone/server.js & sleep 2 && nginx -g 'daemon off;'"
