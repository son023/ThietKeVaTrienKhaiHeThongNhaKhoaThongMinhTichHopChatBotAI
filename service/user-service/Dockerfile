FROM gradle:7.6.1-jdk17 AS build
WORKDIR /app
COPY user-service ./user-service
WORKDIR /app/user-service
RUN gradle clean bootJar --no-daemon

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/user-service/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
