FROM python:3.13.5-slim

# ===== Env =====
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HF_HOME=/tmp/hf \
    TRANSFORMERS_CACHE=/tmp/hf \
    TORCH_HOME=/tmp/torch

WORKDIR /app

# ===== System deps (build only) =====
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# ===== Install Python deps (CPU torch) =====
RUN pip install --no-cache-dir \
    -f https://download.pytorch.org/whl/cpu \
    -r requirements.txt

# ===== Remove build tools =====
RUN apt-get purge -y gcc g++ \
    && apt-get autoremove -y \
    && rm -rf /root/.cache /tmp/*

# ===== App code =====
COPY . .

EXPOSE 9992

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -fs http://localhost:9992/api/health || exit 1
CMD ["python", "-m", "app.main"]
