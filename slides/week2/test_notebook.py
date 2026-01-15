#!/usr/bin/env python3
"""Test script to verify notebook functionality."""

import numpy as np
import pandas as pd
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from collections import Counter
import re
import warnings

warnings.filterwarnings("ignore")

np.random.seed(42)
print("✓ All imports successful!")

# Load 20 Newsgroups
from sklearn.datasets import fetch_20newsgroups

categories = ["sci.space", "rec.sport.hockey", "comp.graphics", "misc.forsale"]

print("\nLoading 20 Newsgroups dataset...")
train_data = fetch_20newsgroups(
    subset="train",
    categories=categories,
    shuffle=True,
    random_state=42,
    remove=("headers", "footers", "quotes"),
)

test_data = fetch_20newsgroups(
    subset="test",
    categories=categories,
    shuffle=True,
    random_state=42,
    remove=("headers", "footers", "quotes"),
)

print(f"✓ Loaded {len(train_data.data)} training documents")
print(f"✓ Loaded {len(test_data.data)} test documents")
print(f"Categories: {train_data.target_names}")

# Check class distribution
train_labels = [train_data.target_names[i] for i in train_data.target]
label_counts = Counter(train_labels)
print("\nClass distribution:")
for label, count in label_counts.items():
    print(f"  {label}: {count} documents")

# Check for empty/near-empty documents
empty_train = sum(1 for doc in train_data.data if len(doc.strip()) < 10)
empty_test = sum(1 for doc in test_data.data if len(doc.strip()) < 10)
print(f"\nNear-empty documents (<10 chars) - train: {empty_train}, test: {empty_test}")

# Check document 0 (used in examples)
print(f"\nDocument 0 length: {len(train_data.data[0])} chars")
print(f'Document 0 preview: "{train_data.data[0][:100]}"')

# Find a good example document (not empty)
good_doc_idx = None
for i, doc in enumerate(train_data.data):
    if len(doc.strip()) > 100:
        good_doc_idx = i
        break
print(f"First good document index: {good_doc_idx}")

# BoW Vectorizer
bow_vectorizer = CountVectorizer(
    max_features=5000, min_df=2, max_df=0.8, stop_words="english"
)

X_train_bow = bow_vectorizer.fit_transform(train_data.data)
X_test_bow = bow_vectorizer.transform(test_data.data)

print(f"\n=== BoW Vectorizer ===")
print(f"Vocabulary size: {len(bow_vectorizer.vocabulary_)}")
print(f"Training matrix shape: {X_train_bow.shape}")
print(
    f"Matrix sparsity: {(1 - X_train_bow.nnz / np.prod(X_train_bow.shape)) * 100:.1f}%"
)

# Check for all-zero rows
zero_rows_bow = sum(1 for i in range(X_train_bow.shape[0]) if X_train_bow[i].sum() == 0)
print(f"All-zero rows in training: {zero_rows_bow}")

# TF-IDF Vectorizer
tfidf_vectorizer = TfidfVectorizer(
    max_features=5000,
    min_df=2,
    max_df=0.8,
    stop_words="english",
    use_idf=True,
    sublinear_tf=True,
)

X_train_tfidf = tfidf_vectorizer.fit_transform(train_data.data)
X_test_tfidf = tfidf_vectorizer.transform(test_data.data)

print(f"\n=== TF-IDF Vectorizer ===")
print(f"Vocabulary size: {len(tfidf_vectorizer.vocabulary_)}")

# Check for NaN values
tfidf_array = X_train_tfidf.toarray()
has_nan = np.isnan(tfidf_array).any()
has_inf = np.isinf(tfidf_array).any()
print(f"Has NaN: {has_nan}, has Inf: {has_inf}")

zero_rows_tfidf = sum(
    1 for i in range(X_train_tfidf.shape[0]) if X_train_tfidf[i].sum() == 0
)
print(f"All-zero rows: {zero_rows_tfidf}")

# Train Naive Bayes with BoW
print("\n=== Model Training ===")
nb_bow = MultinomialNB()
nb_bow.fit(X_train_bow, train_data.target)
y_pred_nb_bow = nb_bow.predict(X_test_bow)
acc_nb_bow = accuracy_score(test_data.target, y_pred_nb_bow)
print(f"NB (BoW) Accuracy: {acc_nb_bow:.4f}")

# Train Naive Bayes with TF-IDF
nb_tfidf = MultinomialNB()
nb_tfidf.fit(X_train_tfidf, train_data.target)
y_pred_nb_tfidf = nb_tfidf.predict(X_test_tfidf)
acc_nb_tfidf = accuracy_score(test_data.target, y_pred_nb_tfidf)
print(f"NB (TF-IDF) Accuracy: {acc_nb_tfidf:.4f}")

# Train Logistic Regression
lr = LogisticRegression(max_iter=1000, C=1.0, random_state=42)
lr.fit(X_train_tfidf, train_data.target)
y_pred_lr = lr.predict(X_test_tfidf)
acc_lr = accuracy_score(test_data.target, y_pred_lr)
print(f"Logistic Regression Accuracy: {acc_lr:.4f}")

# Check predictions
unique_preds = {
    "NB_BoW": len(np.unique(y_pred_nb_bow)),
    "NB_TFIDF": len(np.unique(y_pred_nb_tfidf)),
    "LR": len(np.unique(y_pred_lr)),
}
print(f"\nUnique classes predicted: {unique_preds}")

# Test PyTorch
print("\n=== Neural Network ===")
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

X_train_tensor = torch.FloatTensor(X_train_tfidf.toarray()).to(device)
y_train_tensor = torch.LongTensor(train_data.target).to(device)
X_test_tensor = torch.FloatTensor(X_test_tfidf.toarray()).to(device)
y_test_tensor = torch.LongTensor(test_data.target).to(device)

train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)


class TextClassifier(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim, dropout=0.3):
        super(TextClassifier, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim // 2)
        self.fc3 = nn.Linear(hidden_dim // 2, output_dim)
        self.dropout = nn.Dropout(dropout)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.fc3(x)
        return x


input_dim = X_train_tfidf.shape[1]
hidden_dim = 256
output_dim = len(train_data.target_names)

model = TextClassifier(input_dim, hidden_dim, output_dim).to(device)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Train
model.train()
for epoch in range(10):
    total_loss = 0
    correct = 0
    total = 0
    for batch_x, batch_y in train_loader:
        outputs = model(batch_x)
        loss = criterion(outputs, batch_y)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
        _, predicted = torch.max(outputs.data, 1)
        total += batch_y.size(0)
        correct += (predicted == batch_y).sum().item()
    if (epoch + 1) % 5 == 0:
        print(
            f"Epoch {epoch + 1}: Loss={total_loss / len(train_loader):.4f}, Acc={correct / total:.4f}"
        )

# Evaluate
model.eval()
with torch.no_grad():
    outputs = model(X_test_tensor)
    _, predicted = torch.max(outputs.data, 1)
    y_pred_nn = predicted.cpu().numpy()

acc_nn = accuracy_score(test_data.target, y_pred_nn)
print(f"Neural Network Test Accuracy: {acc_nn:.4f}")

# Summary
print("\n" + "=" * 50)
print("VALIDATION SUMMARY")
print("=" * 50)
issues = []

if acc_nb_bow < 0.6:
    issues.append(f"⚠️ NB (BoW) accuracy low: {acc_nb_bow:.4f}")
if acc_nb_tfidf < 0.6:
    issues.append(f"⚠️ NB (TF-IDF) accuracy low: {acc_nb_tfidf:.4f}")
if acc_lr < 0.7:
    issues.append(f"⚠️ LR accuracy low: {acc_lr:.4f}")
if acc_nn < 0.6:
    issues.append(f"⚠️ NN accuracy low: {acc_nn:.4f}")
if zero_rows_bow > 50:
    issues.append(f"⚠️ Too many zero-row documents: {zero_rows_bow}")
if empty_train > 100:
    issues.append(f"⚠️ Too many empty documents: {empty_train}")
if has_nan or has_inf:
    issues.append(f"⚠️ NaN/Inf in TF-IDF matrix")

if issues:
    for issue in issues:
        print(issue)
else:
    print("✓ All checks passed!")

print(f"\nFinal accuracies:")
print(f"  NB (BoW):    {acc_nb_bow:.4f}")
print(f"  NB (TF-IDF): {acc_nb_tfidf:.4f}")
print(f"  LR:          {acc_lr:.4f}")
print(f"  NN:          {acc_nn:.4f}")
