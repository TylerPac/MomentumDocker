# Use the official Tomcat base image with JDK 17
FROM tomcat:9.0-jdk17

# Clean out default Tomcat apps (optional but clean)
RUN rm -rf /usr/local/tomcat/webapps/*

# Create a clean logs directory
RUN mkdir -p /app/logs

# Copy WAR to ROOT app
COPY target/Momentum.war /usr/local/tomcat/webapps/ROOT.war

# Copy in custom logging config
COPY logging.properties /usr/local/tomcat/conf/logging.properties

# Ensure Tomcat uses your logging config + updated log path
ENV JAVA_OPTS="-Djava.util.logging.config.file=/usr/local/tomcat/conf/logging.properties"

# Expose port 8080
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]
