FROM gradle:7.6.1-jdk17 AS build
WORKDIR /app
COPY doctor-service ./doctor-service
WORKDIR /app/doctor-service
RUN gradle clean bootJar --no-daemon

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/doctor-service/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
