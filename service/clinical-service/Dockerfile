FROM gradle:7.6.1-jdk17 AS build
WORKDIR /app
COPY common ./common
COPY clinical-service ./clinical-service
WORKDIR /app/clinical-service
RUN gradle clean bootJar --no-daemon

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/clinical-service/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
