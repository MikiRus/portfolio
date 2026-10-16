FROM golang:1.25-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/sandbox ./cmd/sandbox

FROM alpine:3.22
RUN adduser -D -u 10001 app
COPY --from=build /out/sandbox /usr/local/bin/sandbox
USER app
EXPOSE 8080
CMD ["sandbox"]
