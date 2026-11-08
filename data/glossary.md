# Glossary

## What is RAG?

RAG means Retrieval-Augmented Generation. The app first finds useful information in your documents, then adds it to the question, and then an AI writes the answer from it. It is like an open-book exam.

## What is an LLM?

An LLM, or large language model, is an AI model that reads text and writes new text. In this project, the LLM is `llama3.2`.

## What is an embedding?

An embedding is a text's meaning written as a list of numbers. Texts with similar meaning get similar numbers, even if they use different words. In this project, each embedding has 768 numbers.

## What is a vector?

A vector is a list of numbers. An embedding is a vector.

## What is a vector database?

A vector database stores vectors and finds the ones closest to the vector you give it. A normal search looks for the same words. A vector search looks for similar meaning.

## What is pgvector?

pgvector is an add-on for Postgres. It adds the `vector` column type and the `<=>` operator, which measures how far apart two embeddings are. It lets Postgres work as a vector database.

## What is Postgres?

Postgres is a database that stores data in tables. In this project, it stores the chunks and their embeddings in the `chunks` table.

## What is Ollama?

Ollama is a free tool that runs AI models on your own computer. In this project, it runs in Docker and gives the API access to two models. No API key or paid account is needed, and your data stays on your computer.

## What is nomic-embed-text?

`nomic-embed-text` is the model this project uses to turn text into embeddings. It only creates lists of numbers. It does not write answers.

## What is llama3.2?

`llama3.2` is the model this project uses to write answers. It reads the question and the chunks that search found, and it writes the answer in plain text.

## What is ingest?

Ingest is the step that prepares your documents so the app can search them. It reads each file, splits it into chunks, creates embeddings, and saves them in Postgres.

## What is a chunk?

A chunk is a small piece of a document. In this project, a chunk is about 500 characters long. Documents are split into chunks so the app can find and send only the parts that matter.

## What is overlap?

Overlap is the text that two chunks next to each other share. In this project, it is 50 characters. It stops an idea from being lost when a chunk ends in the middle of it.

## What is top-k?

Top-k is how many of the closest chunks the search returns. In this project, top-k is 4.

## What is context?

Context is the set of chunks given to the LLM together with the question. The LLM is told to answer only from the context, and to say it doesn't know if the answer is not there.
