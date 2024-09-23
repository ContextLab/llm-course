# Assignment 2: Build a SPAM email classifier

## Overview

In this assignment, you will create a function to classify emails as either "spam" (unwanted, junk mail) or "ham" (wanted mail). Your function will take the contents of a plain text email file as input and return:
- `1` if the email is classified as spam.
- `0` if the email is classified as ham.
No other outputs are allowed.

You have the freedom to design this function using any method you choose, including training a machine learning model, developing heuristics, using computational linguistics tools, or cleaning the email text for better feature extraction. The goal is to maximize the accuracy of your classifier.

## Dataset

A sample dataset is provided ([`training.zip`](training.zip)), consisting of two folders:
- **spam/**: Contains spam emails in plain text format.
- **ham/**: Contains ham emails in plain text format.

You can use this dataset to develop, train, and test your classifier. When evaluating your solution, a new dataset—structured in the same way (with "spam" and "ham" folders)—will be used. You will not have access to this new dataset during development, but your function should generalize well to this unseen data.

## Your Task

You must write a Python function that takes as input the contents of an email (as a plain text string) and returns either a 0 or 1, indicating if the email is ham or spam. Here is the function signature that your code should follow:

```python
def classify_email(email_text: str) -> int:
    """
    Classifies the given email as spam (1) or ham (0).
    
    Parameters:
    email_text (str): The plain text content of the email.
    
    Returns:
    int: 1 if the email is classified as spam, 0 if it is classified as ham.
    """
    # Your code here
```

This function will be tested on unseen data, so it's essential that it generalizes well to new examples.

### Constraints
- **Input**: A plain text email as a string.
- **Output**: Either `1` (spam) or `0` (ham). No other outputs are allowed.
- **External Libraries**: You may use any Python library you think is appropriate for text classification, such as `scikit-learn`, `nltk`, `spaCy`, etc.

### Methods You Might Consider
Here are some possible approaches, but you are free to explore any method you believe will work:
- **Text Preprocessing**: Cleaning and normalizing the email text by removing special characters, stop words, and normalizing the casing.
- **Feature Extraction**: Using techniques like TF-IDF, bag of words, or word embeddings to convert text into numerical features.
- **Machine Learning Models**: Training a classification model (e.g., logistic regression, decision trees, Naive Bayes, or even a deep learning model) using the labeled dataset.
- **Heuristics**: Creating custom rules for detecting spam based on word frequency, certain phrases, or patterns in the email (e.g., detecting URLs, certain domains, etc.).

### Dataset Usage
You can use the sample dataset provided in any way you see fit. You may split the dataset into training and test sets, apply cross-validation, or use other methods to validate your model. Be sure to try different approaches and optimize your classifier for accuracy.

## Evaluation

Your solution will be evaluated based on the following criteria:
- **85%** of your grade will be based on the performance of your classifier on a held-out dataset (not available to you).
- **15%** of your grade will be determined by your percentile rank relative to other submissions in the class. If two or more submissions have the same performance (rounded to the nearest 0.001), the percentile rank will be rounded up.

You will receive a higher grade if your classifier outperforms other submissions. Consider trying multiple strategies to improve your classifier's performance and generalization ability.

The following code will be used to evaluate the performance of your `classify_emails` function; you can use it on the [`training.zip`](training.zip) dataset, or any other dataset you choose, to help you develop and debug your approach:

```python
import os
import zipfile
import shutil
from pathlib import Path
from sklearn.metrics import roc_auc_score

def evaluate_classifier(zip_path: str, classify_email_fn) -> float:
    """
    Evaluate a classifier's performance on a dataset contained in a zip archive.

    Parameters:
    zip_path (str): Path to the zip archive containing "spam" and "ham" folders.
    classify_email_fn (function): A function handle to classify_email(email_text: str) -> int.

    Returns:
    float: The AUC (Area Under the Curve) score of the classifier.
    """
    # Step 1: Set up paths and directories
    dataset_dir = Path(zip_path).with_suffix('')  # Create a directory name based on the zip name (without .zip)
    temp_extracted = False  # Track if we extracted the zip (for cleanup)

    # Step 2: Check if the dataset is already extracted
    if not dataset_dir.exists():
        print(f"Extracting {zip_path}...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(dataset_dir)
        temp_extracted = True  # Mark that we extracted files

    # Step 3: Prepare to collect the data
    emails = []
    labels = []

    # Traverse the spam folder
    spam_folder = dataset_dir / "spam"
    for file_path in spam_folder.iterdir():
        if file_path.is_file():
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
                email_text = file.read()
                emails.append(email_text)
                labels.append(1)  # Spam is labeled as 1

    # Traverse the ham folder
    ham_folder = dataset_dir / "ham"
    for file_path in ham_folder.iterdir():
        if file_path.is_file():
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
                email_text = file.read()
                emails.append(email_text)
                labels.append(0)  # Ham is labeled as 0

    # Step 4: Classify all emails
    predictions = [classify_email_fn(email) for email in emails]

    # Step 5: Calculate AUC score
    auc_score = roc_auc_score(labels, predictions)

    # Step 6: Clean up if necessary
    if temp_extracted:
        print(f"Cleaning up extracted files from {dataset_dir}...")
        shutil.rmtree(dataset_dir)

    return auc_score
```

You can call this function in your notebook using:
```python
evaluate_classifier('training.zip', classify_email)
```

## Submission

Submit a **single Jupyter notebook** that:
1. Contains your full Python implementation of the `classify_email` function.
2. Is formatted and runnable in a clean **Google Colaboratory** instance.  If you need to download mdoel weights or any other data, that should happen inside of your notebook's code.
3. Includes **markdown cells** explaining your approach to the problem, the preprocessing steps you took, and why you chose your specific method.
4. Demonstrates the steps you took to train, test, and evaluate your classifier using the provided dataset.

Make sure your notebook is well-organized, with clear explanations in markdown cells, and that it runs without errors in Google Colaboratory.

Good luck!