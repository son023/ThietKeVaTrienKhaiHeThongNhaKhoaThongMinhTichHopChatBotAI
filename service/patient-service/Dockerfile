FROM gradle:7.6.1-jdk17 AS build
WORKDIR /app
COPY common ./common
COPY patient-service ./patient-service
WORKDIR /app/patient-service
RUN gradle clean bootJar --no-daemon

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/patient-service/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
