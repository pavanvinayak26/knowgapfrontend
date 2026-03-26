# Use Java 21
FROM openjdk:21-jdk-slim

# Copy jar file
COPY target/*.jar app.jar

# Run app
ENTRYPOINT ["java","-jar","/app.jar"]