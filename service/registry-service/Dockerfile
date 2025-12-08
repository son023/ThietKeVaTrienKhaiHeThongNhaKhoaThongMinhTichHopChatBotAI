FROM gradle:7.6.1-jdk17 AS builder
WORKDIR /app
COPY registry-service ./registry-service
WORKDIR /app/registry-service
# Xóa thư mục cache và thực hiện build lại
RUN rm -rf /home/gradle/.gradle/caches/ && \
    gradle bootJar --refresh-dependencies --no-daemon --info

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/registry-service/build/libs/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]