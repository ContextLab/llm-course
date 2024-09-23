# Assignment 3: Modeling the structure and organization of Wikipedia

## Overview

In this assignment, you will explore various methods for generating text embeddings from a collection of Wikipedia articles, cluster these embeddings, and evaluate which method provides the best representation of the articles. You will also develop a method for automatically generating labels for clusters and visualize your results.

## Dataset

You can automatically download the dataset from Dropbox if it doesn't already exist in your working directory. The following code will handle downloading the dataset, checking if it's present, and loading it into your notebook:

```python
import os
import urllib.request
import pickle

# Define the file name and URL
dataset_url = 'https://www.dropbox.com/s/v4juxkc5v2rd0xr/wikipedia.pkl?dl=1'
dataset_path = 'wikipedia.pkl'

# Download the dataset if it doesn't exist
if not os.path.exists(dataset_path):
    print("Downloading dataset...")
    urllib.request.urlretrieve(dataset_url, dataset_path)
    print("Download complete.")

# Load the dataset
with open(dataset_path, 'rb') as f:
    wikipedia = pickle.load(f)
```

The dataset is formatted as a `list` of dictionary (`dict`) objects, each with the following keys/values:
- **'title'**: The title of the article (string).
- **'text'**: The full text of the article (string).
- **'id'**: A unique identifier for the article (string).
- **'url'**: The link to the Wikipedia page (string).

There are 250K articles in all, randomly selected from [this dataset](https://huggingface.co/datasets/legacy-datasets/wikipedia).


## Your Tasks

### 1. Compute Text Embeddings
You will compute text embeddings for each article using the following four methods:
- **Latent Dirichlet Allocation (LDA)** (from `sklearn`):
  - [LDA Documentation](https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.LatentDirichletAllocation.html)
- **BERT embeddings** (from Hugging Face):
  - [Hugging Face BERT](https://huggingface.co/transformers/model_doc/bert.html)
  - Use the pre-trained model `bert-base-uncased` from Hugging Face.
- **GPT-2 embeddings** (from Hugging Face):
  - [Hugging Face GPT-2](https://huggingface.co/transformers/model_doc/gpt2.html)
  - Use the pre-trained model `gpt2` from Hugging Face.
- **Llama 3 8B embeddings** (using `llm2vec`):
  - [Llama Embeddings via LLM2Vec](https://github.com/McGill-NLP/llm2vec)

For each method, generate an embedding for the text of every article in the dataset. Be sure to handle cases where the article text is particularly long (e.g., by truncating or summarizing).

### 2. Cluster the Articles
Using the embeddings generated from each model, apply **KMeans clustering** to group the articles. You will need to:
- Develop a metric for choosing the number of clusters and justify your choice.
- Explain your methodology for determining the number of clusters.
- Perform clustering for each type of embedding (LDA, BERT, GPT-2, Llama 3 7B).

### 3. Automatically Generate Cluster Labels
Using **Llama 3 7B** via **ollama**, develop a procedure for automatically generating descriptive labels for each cluster. Your procedure should aim to summarize the content of articles in each cluster and produce a meaningful, concise label.
- Describe your method for generating labels and justify why it works well.

### 4. Visualize the Embeddings
Visualize the article embeddings using **Plotly**. You will:
- Project the embeddings into 3D space using **UMAP** and **PCA**.
- Each article should be represented as a dot, and the dot colors should reflect the clusters.
- The hover text for each dot should display the **title** of the article.

### 5. Evaluate the Embedding Methods
Develop and run metrics to assess which model's embeddings work best for this dataset. You should:
- Create metrics that assess the quality of the clusters and the embeddings themselves.
- Explain the metrics, run them for each embedding model, and use statistical analyses and figures to justify which model produces the best embeddings for this dataset.

### Guidelines for the Notebook

- **Markdown cells** should be used to explain your approach, decisions, and results.
- Ensure that your notebook runs all the code necessary to download and load the relevant models and datasets. The notebook must be runnable in **Google Colaboratory**.
- Be sure to include relevant visualizations and statistical analyses to support your conclusions.

## Submission

Submit a **Google Colaboratory notebook** that:
1. Loads the dataset, models, and any other necessary files or data.
2. Includes clear markdown cells explaining your approach, decisions, and justifications for each task.
3. Contains all code needed to replicate your results, including downloading and setting up any external models.
4. Visualizes the embeddings and clusters as described above.

Your notebook must run without errors in Google Colaboratory. Be sure to clearly explain your reasoning for choosing the number of clusters, evaluating the quality of the embeddings, and generating labels for clusters.

Good luck!
