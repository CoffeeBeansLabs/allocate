ARG node_version=21.0.0
FROM node:${node_version}-alpine AS builder

ARG CBST_GOOGLE_AUTH_CLIENT_ID
ENV CBST_GOOGLE_AUTH_CLIENT_ID=$CBST_GOOGLE_AUTH_CLIENT_ID

RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json nx.json tsconfig.base.json .eslintrc.json ./
RUN npm install --frozen-lockfile
COPY ./libs/ui ./libs/ui
COPY ./apps/ui ./apps/ui
RUN npx nx run-many -t build -p util-hooks util-formatting util-data-values ui-components ui --parallel=false

FROM nginx:1.23.1-alpine
WORKDIR /app
EXPOSE 443
COPY ./apps/ui/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/apps/ui /usr/share/nginx/html
