# Use the official Tomcat base image with JDK 17
FROM tomcat:9.0-jdk17

# Clean out default Tomcat apps (optional but clean)
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy your WAR into the ROOT app
COPY target/Momentum.war /usr/local/tomcat/webapps/ROOT.war

# Expose port 8080 inside the container
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]
