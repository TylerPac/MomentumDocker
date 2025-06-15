# Use the official Tomcat base image with JDK 17

FROM eclipse-temurin:17-jdk



USER root
# Clean out default Tomcat apps
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]



# Ensure log directory exists and is writable
# Ensure the logs directory exists and is writable
# RUN mkdir -p /usr/local/tomcat/logs && \
#    chmod -R 777 /usr/local/tomcat/logs && \
#    chown -R root:root /usr/local/tomcat/logs




# Expose port 8080
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]
