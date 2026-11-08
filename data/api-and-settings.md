# API and settings

## The API at a glance

The API has three endpoints: `GET /health`, `POST /search`, and `POST /ask`.

## GET /health

`GET /health` checks that the API is running. It returns status 200 and the message `API is up`. It does not check Postgres or Ollama.

## POST /search

`POST /search` finds the chunks closest in meaning to a question, and it does not use `llama3.2`. Send a JSON body with one field, for example `{ "question": "What is ingest?" }`. It returns the 4 closest chunks, each with its text and source file name.

## POST /ask

`POST /ask` answers a question from your documents. Send a JSON body with one field, for example `{ "question": "What is ingest?" }`. It returns the answer written by `llama3.2`, plus the source chunks used to write it.

## The response shape

Every API response has the same shape: `status`, `message`, and sometimes `data`. The result of a request is inside `data`. When a request fails, the response has an error status and a message.

## API documentation page

The Swagger page at `/docs` lists every endpoint, and you can try them from the browser. It has a custom left sidebar, and you can pin the groups of endpoints you use most.

## Chunk size setting

The chunk size is 500 characters. A smaller chunk size makes each chunk more focused, but it can cut an idea in half. A larger chunk size keeps more context, but search becomes less exact. After changing it, run ingest again.

## Chunk overlap setting

The chunk overlap is 50 characters. Each chunk repeats the last 50 characters of the chunk before it, so an idea at the edge of a chunk is not lost.

## Top-k setting

Top-k is the number of chunks the search returns. In this project, top-k is 4. A larger top-k gives the model more context, but it also adds text that may not be related to the question.

## Models

The embedding model is `nomic-embed-text`, and each embedding has 768 numbers. The model that writes answers is `llama3.2`. If you change the embedding model, you must run ingest again, because old and new embeddings can't be compared.

## Environment values

The API reads its settings from the `.env` file. `DATABASE_URL` is the Postgres connection and is required. `PORT` defaults to 5000. `OLLAMA_URL` defaults to `http://localhost:11434`. `WEB_ORIGIN` defaults to `http://localhost:5001`.

## Database table

The database has one table for documents, named `chunks`. It has four columns: `id`, `content` for the text, `source` for the file name, and `embedding` for the `vector(768)` value.

## Supported files

Ingest reads only `.md` and `.txt` files in the `data` folder. PDF, Word, and image files are not supported, because they would need extra code to pull out the text.
