FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV PUBLIC_BASE_URL=
ENV CONTENT_DATA_DIR=/app/data
ENV UPLOADS_DIR=/app/uploads

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/components ./components
COPY --from=build /app/contexts ./contexts
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/services ./services
COPY --from=build /app/data ./data
COPY --from=build /app/types.ts ./types.ts
COPY --from=build /app/server.mjs ./server.mjs

RUN mkdir -p /app/data /app/uploads

EXPOSE 3000

CMD ["node", "server.mjs"]
