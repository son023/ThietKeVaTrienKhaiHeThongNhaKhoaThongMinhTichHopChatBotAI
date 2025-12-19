FROM gradle:8.1.1-jdk17 AS build

WORKDIR /workspace

# Build and publish common module to mavenLocal inside the build container
COPY service/common /workspace/common
RUN cd /workspace/common && gradle --no-daemon publishToMavenLocal -x test

# Copy invoice-service sources
COPY service/invoice-service /workspace/app
WORKDIR /workspace/app

# Build the bootable jar (tests skipped for speed in container builds)
RUN gradle --no-daemon bootJar -x test

FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

COPY --from=build /workspace/app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
