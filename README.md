# Grazioso Salvare - Rescue Dashboard Enhancement

## Project Overview
This project is an enhancement of the Final Project from CS 340 (Advanced Programming Concepts). Originally, the artifact consisted of a Python-based local dashboard designed to interface with a MongoDB database using a custom Python CRUD module and a JupyterDash frontend.

The goal of this enhancement is to port the local Python script into a production-grade, distributed web application, demonstrating a total technology stack migration:
- **Back-end:** Migrated to a .NET (C#) Web API utilizing the Repository Pattern and Entity Framework Core.
- **Front-end:** Replaced JupyterDash with a modern, responsive React application built with Vite and TailwindCSS.
- **Database:** Transitioned from NoSQL (MongoDB) to a relational database (PostgreSQL) for stricter data integrity and normalization.
- **Infrastructure:** Containerized using Docker and orchestrated via Docker Compose.

---

## Code Review
### [Watch the video code review here](https://youtu.be/Bdr496AjpVI)

---

## Architectural Highlights & Code Snippets

### 1. Architecture & Infrastructure
The application has been restructured into a loosely coupled, three-service pattern, consisting of the React UI, ASP.NET API, and PostgreSQL database. 
- **Containerization:** Both the React UI and ASP.NET API have dedicated Dockerfiles to ensure deployment consistency and avoid local environment version mismatches.
- **Orchestration:** The services are managed seamlessly together. The database starts first, followed by the API, and finally the UI, with built-in health checks to prevent crashes. An Nginx reverse proxy routes requests to the correct service.

**Highlighted File:** 
- [docker-compose.yml](Hawkins-Updates/docker-compose.yml): Demonstrates the orchestration, environment variable passing, and startup sequence of the three major components.

### 2. Backend API & Data Management
Moving from a monolithic architecture to a RESTful API required managing client-server communication and statelessness.
- **Database Initialization:** The application parses over 10,000 records from a CSV file. To avoid memory overflow and startup delays, the data is batched into groups of 100 before saving to the database.
- **RESTful Endpoints:** The API handles Create, Read, Update, and Delete operations with comprehensive exception handling and validation.
- **Pagination:** To prevent overloading HTTP requests, the API implements pagination logic to return specific batches of Animal records based on page size and page number.

**Highlighted Files:**
- [DbInitializer.cs](Hawkins-Updates/GraziosoSalvare-API/Data/DbInitializer.cs): Showcases the batch-processing logic used to seed the PostgreSQL database from a CSV file efficiently.
- [AnimalController.cs](Hawkins-Updates/GraziosoSalvare-API/Controllers/AnimalController.cs): Highlights the implementation of RESTful CRUD operations, exception handling, and pagination functionality.

### 3. Frontend React UI
The user interface has been completely reimagined to improve user experience, maintainability, and data visualization.
- **Component-Based Architecture:** The application uses isolated React components to organize the UI and logic.
- **Data Tables & State Management:** The `AnimalTable` component balances local memory and API load by fetching paginated records from the backend while managing sorting and filtering on the client side.
- **Interactive Visualizations:** Leveraging Leaflet for interactive maps and Recharts for breed distribution pie charts, the dashboard provides a rich visual experience.

**Highlighted Files:**
- [AnimalTable.tsx](Hawkins-Updates/GraziosoSalvare-UI/src/components/AnimalTable.tsx): Demonstrates advanced client-side logic for pagination, sorting, and integrating dynamic filter options from the API.
- [MapDisplay.tsx](Hawkins-Updates/GraziosoSalvare-UI/src/components/MapDisplay.tsx): Showcases the integration of the Leaflet module to display dynamic geographic data based on the selected rescue animal.