FROM eclipse-temurin:17-jdk

# Set work directory
WORKDIR /app

# Copy JAR into image
COPY target/MomentumDocker-1.0-SNAPSHOT.jar app.jar

# Expose app port
EXPOSE 8080

# Run Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
