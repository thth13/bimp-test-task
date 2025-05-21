# Test task for [Bimp](https://bimpsoft.com/)

## Running with Docker

- **Start the project in Docker:**

  ```sh
  yarn compose:start
  ```

  Builds and starts all Docker containers (app and database).

- **Stop Docker containers:**

  ```sh
  yarn compose:stop
  ```

  Stops all running Docker containers for the project.

- **Remove Docker containers and volumes:**
  ```sh
  yarn compose:delete
  ```
  Removes all containers and deletes the database volume (all data will be lost).

---

## Running in Development Mode (without Docker)

- **Start the app in development mode:**
  ```sh
  yarn dev
  ```
  Runs the app locally using `ts-node-dev` for hot-reloading.

---

## API Documentation

After starting the project, Swagger UI will be available at:  
[http://localhost:3000/docs](http://localhost:3000/docs)

---

## Environment Variables

The following environment variables are used (see `docker-compose.yml`):

- `POSTGRES_HOST`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `NODE_ENV`

---

## Useful Scripts

- **Build TypeScript:**
  ```sh
  yarn build
  ```
- **Start production build:**
  ```sh
  yarn start
  ```
