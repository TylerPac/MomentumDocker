# Use the official Tomcat base image with JDK 17
FROM tomcat:9.0-jdk17

# Clean out default Tomcat apps (optional but clean)
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy WAR to ROOT app
COPY target/MomentumDocker-1.0-SNAPSHOT.war /usr/local/tomcat/webapps/ROOT.war

# Copy custom logging config
# COPY src/main/resources/logging.properties /usr/local/tomcat/conf/logging.properties

# Copy custom startup config
# COPY setenv.sh /usr/local/tomcat/bin/setenv.sh
# RUN chmod +x /usr/local/tomcat/bin/setenv.sh

# 🛠️ Fix permissions so Tomcat can write logs
# RUN mkdir -p /usr/local/tomcat/logs && \
#     chmod -R 777 /usr/local/tomcat/logs

# Set JAVA_OPTS to use custom logging.properties
# ENV JAVA_OPTS="-Djava.util.logging.config.file=/usr/local/tomcat/conf/logging.properties"

# Expose port 8080
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]
