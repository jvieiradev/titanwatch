# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git make

# Copy source code
COPY . .

# Download dependencies and tidy
RUN go mod download && go mod tidy

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /app/bin/auth-service cmd/api/main.go
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /app/bin/migrate cmd/migrate/main.go

# Final stage
FROM alpine:latest

WORKDIR /app

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Copy binaries from builder
COPY --from=builder /app/bin/auth-service /app/auth-service
COPY --from=builder /app/bin/migrate /app/migrate
COPY --from=builder /app/migrations /app/migrations

# Expose port
EXPOSE 8001

# Run the application
CMD ["/app/auth-service"]
