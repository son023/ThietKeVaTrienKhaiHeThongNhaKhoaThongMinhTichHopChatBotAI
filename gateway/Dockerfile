# ========================================================
# STAGE 1: Build Stage
# ========================================================
FROM gradle:8.5-jdk17 AS builder
WORKDIR /workspace

# 1. Copy file cấu hình Gradle của Gateway
# Lưu ý: Gateway nằm ngay thư mục gốc (ngang hàng hoặc bên ngoài service),
# nên đường dẫn copy sẽ là gateway/build.gradle
COPY gateway/build.gradle gateway/settings.gradle /workspace/gateway/

# 2. Build Gateway
# Copy source code
COPY gateway/src /workspace/gateway/src
WORKDIR /workspace/gateway

# Build ra file .jar (bỏ qua test để tăng tốc)
RUN gradle bootJar -x test --no-daemon

# ========================================================
# STAGE 2: Runtime Stage
# ========================================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 1. Copy file JAR từ builder
COPY --from=builder /workspace/gateway/build/libs/*.jar app.jar

# 2. Cấu hình RAM tự động
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"

# 3. Chạy ứng dụng
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]