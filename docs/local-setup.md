# Local Setup

The first-time steps are in the [README](../README.md#run-it). This page is for daily use and details.

Run every command inside the API folder, with Node 24 (`nvm use` reads `.nvmrc`).

## Services

Docker runs only Postgres and Ollama. The API runs directly on your computer.

| Service                   | Port on your computer    | Container                         |
| ------------------------- | ------------------------ | --------------------------------- |
| Postgres 18 with pgvector | `5433` (`POSTGRES_PORT`) | `rag-document-assistant-postgres` |
| Ollama                    | `11434`                  | `rag-document-assistant-ollama`   |
| API                       | `5000` (`PORT`)          | none                              |

The containers don't start by themselves when the computer boots.

## Daily use

```bash
yarn docker:deps
```

```bash
yarn dev
```

When you are done, stop the API with Ctrl+C, then stop the containers:

```bash
docker compose stop
```

## Settings

The API checks `.env` on startup and exits with a list of the missing or invalid values.

| Variable       | What it is                               | Default                  |
| -------------- | ---------------------------------------- | ------------------------ |
| `NODE_ENV`     | `development`, `test` or `production`    | `development`            |
| `PORT`         | Port of the API                          | `5000`                   |
| `DATABASE_URL` | Postgres connection. Required            | None                     |
| `WEB_ORIGIN`   | The only website allowed to call the API | `http://localhost:5001`  |
| `OLLAMA_URL`   | Address of Ollama                        | `http://localhost:11434` |

If you change `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` or `POSTGRES_PORT`, update `DATABASE_URL` to match.

## Changing the documents

Add, change or delete `.md` and `.txt` files in `data/`, then run:

```bash
yarn ingest
```

Ingest deletes all saved chunks and saves them again. Run it again too if you change the chunk size or the embedding model.

## Saved data

Your chunks and the models are kept in Docker volumes, so `docker compose stop` and `docker compose down` don't delete them.

This command deletes both the chunks and the models:

```bash
docker compose down -v
```

## Connect with a database client

| Field    | Value                                |
| -------- | ------------------------------------ |
| Host     | `localhost`                          |
| Port     | `5433` (`POSTGRES_PORT`)             |
| Database | `document-assistant` (`POSTGRES_DB`) |
| User     | `admin` (`POSTGRES_USER`)            |
| Password | `admin` (`POSTGRES_PASSWORD`)        |

Or use this URL: `jdbc:postgresql://localhost:5433/document-assistant`
