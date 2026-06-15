# Grazioso Salvare - Technical Documentation

This repository contains the source code for the Grazioso Salvare rescue dashboard. It includes both the original monolithic Python application and the enhanced, cloud-ready microservices architecture (React UI, C# .NET Web API, PostgreSQL).

*For a comprehensive overview of the design decisions, architectural migration, code review, and portfolio deliverables, please see the [Professional Self-Assessment](https://hawkinsr.github.io/) or the `SelfAssessment.md` file.*

---

## Local Development & Startup Instructions

The enhanced application is fully containerized. You can run the entire stack locally using Docker without needing to install Node.js, .NET SDKs, or PostgreSQL directly on your machine.

### Prerequisites
- [Docker Engine or Docker Desktop](https://docs.docker.com/get-docker/) installed and running.

### Running the Application

1. **Navigate to the source directory:**
   Open a terminal and navigate to the folder containing the orchestration files.
   ```bash
   cd Hawkins-Updates
   ```

2. **Build and start the containers:**
   Use Docker Compose to build the images and start the services.
   ```bash
   docker-compose up --build -d
   ```
   *Note: On startup, the API initializes the database and seeds it using the provided `aac_shelter_outcomes.csv` file. This batches over 10,000 records and may take a few moments.*

3. **Access the application:**
   Once the containers are healthy, the Nginx reverse proxy will route the traffic appropriately.
   - **Frontend UI:** Open your browser and navigate to `http://localhost`
   - **Backend API:** The API is accessible directly at `http://localhost:8080`
   - **Database:** The PostgreSQL database is exposed on port `5432` with the credentials found in the `docker-compose.yml`.

4. **Stopping the application:**
   To stop the services and gracefully spin down the containers, run:
   ```bash
   docker-compose down
   ```

---

## Repository Structure

- `Hawkins-7-2/`
  - Contains the original Python script (`CRUD_Python_Module.py`) and JupyterDash front-end from CS 340.
- `Hawkins-Updates/`
  - **`GraziosoSalvare-API/`**: The C# .NET backend utilizing Entity Framework Core and the Repository Pattern.
  - **`GraziosoSalvare-UI/`**: The React Vite front-end built with Tailwind CSS.
  - **`docker-compose.yml`**: The orchestration file that links the UI, API, Database, and Nginx proxy.