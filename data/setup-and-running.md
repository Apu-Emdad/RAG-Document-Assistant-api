# Setup and running

## What you need

To run this project you need Node 24, Yarn 4 through `corepack`, and Docker. Node 24 is required. If your terminal uses an older Node version, run `nvm use 24` inside the API folder first.

## Docker services

Docker runs two services for this project: Postgres with pgvector, and Ollama. Postgres uses the image `pgvector/pgvector:pg18`, which is Postgres 18 with pgvector already installed. Ollama uses the image `ollama/ollama`.

## Ports

The API uses port 5000. Postgres uses port 5433 on your computer. Ollama uses port 11434. The web app uses port 5001, and it is the only website allowed to call the API through CORS.

## Container names

The Postgres container is named `rag-document-assistant-postgres`. The Ollama container is named `rag-document-assistant-ollama`.

## Starting Docker

Run `corepack yarn docker:deps` inside the API folder to start Postgres and Ollama. The containers do not start by themselves when the computer boots, so you must start them each time you want to use the app.

## Downloading the models

The models are downloaded once, and a Docker volume keeps them. Run these two commands after Docker has started:

`docker exec rag-document-assistant-ollama ollama pull nomic-embed-text`

`docker exec rag-document-assistant-ollama ollama pull llama3.2`

## Creating the database table

Run `corepack yarn migrate:dev` to apply the Prisma migrations. They turn on pgvector and create the `chunks` table. You only need to do this once.

## Loading your documents

Run `corepack yarn ingest` to read the files in the `data` folder and save their chunks. Run it again after you add, change, or delete a file in the `data` folder.

## Starting the API

Run `corepack yarn dev` to start the API on port 5000. You can then open the API documentation at `http://localhost:5000/docs`, and check that the API is running at `http://localhost:5000/health`.

## Stopping everything

Run `docker compose stop` inside the API folder when you are done. This frees the memory used by Postgres and Ollama. It does not delete your saved chunks or downloaded models.

## How much memory it needs

Ollama and Postgres use about 400 MB of memory while idle. The `llama3.2` model needs about 3 to 4 GB more while it is loaded. Ollama removes a model from memory about 5 minutes after its last use.

## Speed

Creating embeddings is fast. Writing an answer with `llama3.2` is much slower when the computer has no supported GPU, and it can take up to about a minute.
