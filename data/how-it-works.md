# How the RAG Document Assistant works

The RAG Document Assistant answers questions using only the documents in the `data` folder. It works in two parts: Part 1 prepares the documents, and Part 2 answers each question.

## Part 1: Ingest

Ingest prepares the documents so the app can search them. You start it with the command `yarn ingest`. It does not run when the API starts. Run it once at the start, and again whenever the files in the `data` folder change.

### Ingest step 1: Read the files

The ingest script reads every `.md` and `.txt` file in the `data` folder. It ignores all other file types, such as PDF files and images.

### Ingest step 2: Split the text into chunks

Each file is split into small pieces called chunks. A chunk is about 500 characters long. Each chunk repeats the last 50 characters of the chunk before it. The repeated part is called the overlap, and it stops an idea from being lost at the edge of a chunk.

### Ingest step 3: Create embeddings

During ingest, each chunk is sent to the `nomic-embed-text` model, which runs in Ollama. The model returns an embedding, which is a list of 768 numbers that represents the meaning of the chunk.

### Ingest step 4: Save in Postgres

Each chunk is saved in the `chunks` table in Postgres, with its text, its source file name, and its embedding. Before saving, ingest deletes all old chunks, so running it again does not create duplicates. If saving fails, the old chunks stay.

## Part 2: Answering a question

Part 2 runs every time a user asks a question through the `POST /ask` endpoint.

### Question step 1: Embed the question

The question is sent to `nomic-embed-text`, the same model used during ingest. The same model must be used in both parts, because embeddings from different models can't be compared.

### Question step 2: Find similar chunks

Postgres compares the question's embedding with every saved chunk, using the pgvector `<=>` operator. It returns the 4 closest chunks. A smaller distance means the meanings are closer. This is why a question can find a chunk even when they use different words.

### Question step 3: Write the answer

The question and the 4 chunks are sent to the `llama3.2` model in Ollama. The model is told: "Answer only from the context. If it's not there, say you don't know."

### Question step 4: Return the response

The API returns the answer together with the source chunks. The source chunks show which text the answer came from, so a user can check it.

## The difference between /search and /ask

`POST /search` stops after finding the similar chunks, and it does not use `llama3.2`. `POST /ask` does the full flow and writes an answer. Use `/search` to check what the app finds before the AI writes anything.
