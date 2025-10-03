FROM gradle:7.6.1-jdk17 AS builder
WORKDIR /app
COPY . .
# Xóa thư mục cache và thực hiện build lại
RUN rm -rf /home/gradle/.gradle/caches/ && \
    gradle bootJar --refresh-dependencies --no-daemon --info

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]