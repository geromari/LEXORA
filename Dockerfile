# ==============================================================================
#  LEXORA — All-In-One Unified Fullstack Production Dockerfile
# ==============================================================================

# Stage 1: Build Next.js Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ENV NEXT_PUBLIC_API_URL="/api"
RUN npm run build

# Stage 2: Final Unified Runtime (Python + Node.js)
FROM python:3.12-slim
WORKDIR /app

# Install minimal Node.js runtime for serving Next.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ./backend/requirements.txt

# Copy Backend application
COPY backend/ ./backend/

# Copy built Frontend
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules
COPY frontend/next.config.ts ./frontend/

# Copy Unified Server Runner
COPY server.py ./

EXPOSE 8000 3000

ENV HOST=0.0.0.0

CMD ["python3", "server.py", "--prod", "--host", "0.0.0.0", "--backend-port", "8000", "--frontend-port", "3000"]
