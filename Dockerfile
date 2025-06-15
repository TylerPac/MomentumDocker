# Use the official Tomcat base image with JDK 17
USER root
FROM tomcat:9.0-jdk17

# Clean out default Tomcat apps
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy WAR to ROOT app
ARG WAR_FILE=target/Momentum-0.0.1-SNAPSHOT.war
COPY ${WAR_FILE} /usr/local/tomcat/webapps/ROOT.war



RUN mkdir -p /usr/local/tomcat/logs && \
    chown -R 777 /usr/local/tomcat/logs


# Expose port 8080
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]
