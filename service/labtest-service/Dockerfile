# ========================================================
# STAGE 1: Build Stage
# ========================================================
FROM gradle:8.5-jdk17 AS builder
WORKDIR /workspace

# 1. Copy file cấu hình Gradle để tận dụng Cache
# Chỉ copy build.gradle của common
COPY service/common/build.gradle /workspace/common/
# Copy cả build.gradle và settings.gradle của labtest-service
COPY service/labtest-service/build.gradle service/labtest-service/settings.gradle /workspace/labtest-service/

# 2. Build Module Common (Bắt buộc vì labtest-service phụ thuộc vào nó)
COPY service/common/src /workspace/common/src
WORKDIR /workspace/common
# Publish common vào mavenLocal của container
RUN gradle publishToMavenLocal -x test --no-daemon

# 3. Build Labtest Service
COPY service/labtest-service/src /workspace/labtest-service/src
WORKDIR /workspace/labtest-service
# Build ra file .jar (bỏ qua test để tăng tốc)
RUN gradle bootJar -x test --no-daemon

# ========================================================
# STAGE 2: Runtime Stage
# ========================================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 1. Copy file JAR từ giai đoạn builder
COPY --from=builder /workspace/labtest-service/build/libs/*.jar app.jar

# 2. Cấu hình RAM tự động (Giới hạn 75% RAM container)
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"

# 3. Chạy ứng dụng
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]