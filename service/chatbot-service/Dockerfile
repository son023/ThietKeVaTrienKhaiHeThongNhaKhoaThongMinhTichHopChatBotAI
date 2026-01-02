FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# 1. Cài System Deps tối thiểu (Thêm curl để healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ curl \
    && rm -rf /var/lib/apt/lists/*

# 2. CHIẾN THUẬT: Cài PyTorch CPU riêng trước (Quan trọng nhất để giảm size)
# Sử dụng --index-url thay vì -f để ép buộc chỉ tìm ở kho CPU
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# 3. Copy và cài các thư viện còn lại
COPY requirements.txt .
# Lưu ý: Cần xóa dòng 'torch' trong requirements.txt hoặc pip sẽ check lại
RUN pip install --no-cache-dir -r requirements.txt

# 4. Dọn dẹp build tools để giảm layer cuối
RUN apt-get purge -y gcc g++ \
    && apt-get autoremove -y \
    && rm -rf /root/.cache /tmp/*

COPY . .

EXPOSE 9992

# Healthcheck giữ nguyên
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -fs http://localhost:9992/api/health || exit 1

CMD ["python", "-m", "app.main"]