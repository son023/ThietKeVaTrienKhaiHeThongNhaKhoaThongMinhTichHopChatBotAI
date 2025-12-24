# ========================================================
# STAGE 1: Build Stage
# ========================================================
FROM gradle:8.5-jdk17 AS builder
WORKDIR /workspace

# 1. Copy file cấu hình Gradle của Registry Service
# Vì Registry Service không phụ thuộc vào Common, ta chỉ cần copy file của chính nó
COPY service/registry-service/build.gradle service/registry-service/settings.gradle /workspace/registry-service/

# 2. Build Registry Service
# Copy source code
COPY service/registry-service/src /workspace/registry-service/src
WORKDIR /workspace/registry-service

# Build ra file .jar (bỏ qua test)
RUN gradle bootJar -x test --no-daemon

# ========================================================
# STAGE 2: Runtime Stage
# ========================================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 1. Copy file JAR từ builder
COPY --from=builder /workspace/registry-service/build/libs/*.jar app.jar

# 2. Cấu hình RAM tự động (Eureka Server khá nhẹ, nhưng vẫn nên giới hạn)
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"

# 3. Chạy ứng dụng
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]