# Use the official Tomcat base image with JDK 17
FROM tomcat:9.0-jdk17

# Clean out default Tomcat apps
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy WAR to ROOT app
COPY target/MomentumDocker-1.0-SNAPSHOT.war /usr/local/tomcat/webapps/ROOT.war


# Fix log permissions for everyone
RUN mkdir -p /usr/local/tomcat/logs && \
    chmod -R 777 /usr/local/tomcat/logs


# Expose port 8080
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]
