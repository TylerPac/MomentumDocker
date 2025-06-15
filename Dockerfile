# Use the official Tomcat base image with JDK 17

FROM tomcat:9.0-jdk17

USER root
# Clean out default Tomcat apps
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy WAR to ROOT app
ARG WAR_FILE=target/Momentum-0.0.1-SNAPSHOT.war
COPY ${WAR_FILE} /usr/local/tomcat/webapps/ROOT.war



# Ensure log directory exists and is writable
# Ensure the logs directory exists and is writable
RUN mkdir -p /usr/local/tomcat/logs && \
    chmod -R 777 /usr/local/tomcat/logs && \
    chown -R root:root /usr/local/tomcat/logs




# Expose port 8080
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]
