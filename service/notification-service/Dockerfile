FROM gradle:7.6.1-jdk17 AS build
WORKDIR /app
COPY . .
RUN gradle clean bootJar --no-daemon

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]