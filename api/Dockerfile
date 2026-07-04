# ---- build ----
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw 2>/dev/null || true; ./mvnw -q dependency:go-offline || mvn -q dependency:go-offline
COPY src ./src
RUN ./mvnw -q clean package -DskipTests || mvn -q clean package -DskipTests

# ---- run ----
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
