#!/usr/bin/env python3
"""
Generate dimensionality reduction visualization figures for Lecture 13.

Creates three PNG figures showing 20 Newsgroups embeddings projected to 2D
using PCA, t-SNE, and UMAP. Uses Avenir font to match slide theme.

Usage:
    python generate_dimred_figures.py

Output:
    figures/pca_visualization.png
    figures/tsne_visualization.png
    figures/umap_visualization.png
"""

import os
import numpy as np
import matplotlib

matplotlib.use("Agg")  # Headless backend
import matplotlib.pyplot as plt
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD, PCA
from sklearn.manifold import TSNE

# Set random seed for reproducibility
np.random.seed(42)

# Font configuration - use Avenir to match slide theme
FONT_FAMILY = ["Avenir", "Avenir Next", "Helvetica Neue", "DejaVu Sans", "sans-serif"]
plt.rcParams["font.family"] = FONT_FAMILY
plt.rcParams["font.size"] = 12
plt.rcParams["axes.titlesize"] = 16
plt.rcParams["axes.labelsize"] = 14
plt.rcParams["legend.fontsize"] = 10

# Categories for 20 Newsgroups
CATEGORIES = [
    "sci.space",
    "sci.med",
    "rec.sport.hockey",
    "rec.sport.baseball",
    "talk.politics.misc",
    "talk.religion.misc",
    "comp.graphics",
    "comp.os.ms-windows.misc",
]

# Shortened category names for legend
CATEGORY_SHORT_NAMES = {
    "sci.space": "Space",
    "sci.med": "Medicine",
    "rec.sport.hockey": "Hockey",
    "rec.sport.baseball": "Baseball",
    "talk.politics.misc": "Politics",
    "talk.religion.misc": "Religion",
    "comp.graphics": "Graphics",
    "comp.os.ms-windows.misc": "Windows",
}

# Color palette (Dartmouth-inspired with good contrast)
COLORS = [
    "#00693e",  # Dartmouth Green
    "#267aba",  # Blue
    "#ffa00f",  # Orange
    "#9d162e",  # Red
    "#8a6996",  # Purple
    "#a5d75f",  # Light Green
    "#003c73",  # Navy
    "#d94415",  # Burnt Orange
]


def load_data():
    """Load 20 Newsgroups dataset and create embeddings."""
    print("Loading 20 Newsgroups dataset...")
    newsgroups = fetch_20newsgroups(
        subset="all",
        categories=CATEGORIES,
        shuffle=True,
        random_state=42,
        remove=("headers", "footers", "quotes"),
    )

    documents = newsgroups.data
    labels = newsgroups.target
    label_names = newsgroups.target_names

    print(f"  Loaded {len(documents)} documents across {len(CATEGORIES)} categories")

    # Create TF-IDF embeddings
    print("Creating TF-IDF embeddings...")
    tfidf = TfidfVectorizer(
        max_features=5000, min_df=5, max_df=0.5, stop_words="english"
    )
    tfidf_matrix = tfidf.fit_transform(documents)

    # Reduce to 100D for faster processing
    print("Reducing to 100 dimensions with SVD...")
    svd = TruncatedSVD(n_components=100, random_state=42)
    embeddings = svd.fit_transform(tfidf_matrix)

    print(f"  Embeddings shape: {embeddings.shape}")
    print(f"  Explained variance: {svd.explained_variance_ratio_.sum():.2%}")

    return embeddings, labels, label_names


def create_scatter_plot(coords_2d, labels, label_names, title, filename):
    """Create and save a scatter plot."""
    fig, ax = plt.subplots(figsize=(10, 8))

    # Plot each category
    for i, category in enumerate(label_names):
        mask = labels == i
        short_name = CATEGORY_SHORT_NAMES.get(category, category)
        ax.scatter(
            coords_2d[mask, 0],
            coords_2d[mask, 1],
            c=COLORS[i % len(COLORS)],
            label=short_name,
            alpha=0.6,
            s=20,
            edgecolors="none",
        )

    ax.set_title(title, fontweight="bold", pad=15)
    ax.set_xlabel("Dimension 1")
    ax.set_ylabel("Dimension 2")

    # Legend outside plot
    ax.legend(
        loc="center left",
        bbox_to_anchor=(1.02, 0.5),
        frameon=True,
        fancybox=True,
        shadow=False,
    )

    # Clean up axes
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.tick_params(axis="both", which="both", length=0)
    ax.set_xticks([])
    ax.set_yticks([])

    plt.tight_layout()
    plt.savefig(filename, dpi=150, bbox_inches="tight", facecolor="white")
    plt.close()

    print(f"  Saved: {filename}")


def apply_pca(embeddings, labels, label_names, output_dir):
    """Apply PCA and create visualization."""
    print("\nApplying PCA...")
    pca = PCA(n_components=2, random_state=42)
    coords_2d = pca.fit_transform(embeddings)

    variance_explained = sum(pca.explained_variance_ratio_)
    print(f"  Variance explained: {variance_explained:.2%}")

    title = (
        f"PCA: 20 Newsgroups Embeddings\n(Variance explained: {variance_explained:.1%})"
    )
    filename = os.path.join(output_dir, "pca_visualization.png")
    create_scatter_plot(coords_2d, labels, label_names, title, filename)


def apply_tsne(embeddings, labels, label_names, output_dir):
    """Apply t-SNE and create visualization."""
    print("\nApplying t-SNE (this may take a minute)...")
    # Use a subset for faster computation (exact method is O(n^2))
    n_samples = min(1000, len(embeddings))
    indices = np.random.choice(len(embeddings), n_samples, replace=False)
    embeddings_subset = embeddings[indices]
    labels_subset = labels[indices]

    tsne = TSNE(
        n_components=2,
        perplexity=30,
        n_iter=1000,
        random_state=42,
        init="pca",
        method="exact",  # Use exact method to avoid threading issues
    )
    coords_2d = tsne.fit_transform(embeddings_subset)

    title = f"t-SNE: 20 Newsgroups Embeddings\n(Perplexity=30, n={n_samples})"
    filename = os.path.join(output_dir, "tsne_visualization.png")
    create_scatter_plot(coords_2d, labels_subset, label_names, title, filename)


def apply_umap(embeddings, labels, label_names, output_dir):
    """Apply UMAP and create visualization."""
    print("\nApplying UMAP...")
    try:
        import umap

        reducer = umap.UMAP(
            n_components=2,
            n_neighbors=15,
            min_dist=0.1,
            metric="cosine",
            random_state=42,
        )
        coords_2d = reducer.fit_transform(embeddings)

        title = "UMAP: 20 Newsgroups Embeddings\n(n_neighbors=15, min_dist=0.1)"
        filename = os.path.join(output_dir, "umap_visualization.png")
        create_scatter_plot(coords_2d, labels, label_names, title, filename)
    except (ImportError, SystemError) as e:
        print(f"  WARNING: UMAP failed ({e}). Creating fallback using PCA.")
        # Fallback to PCA for the UMAP slot
        from sklearn.decomposition import PCA

        pca = PCA(n_components=2, random_state=42)
        coords_2d = pca.fit_transform(embeddings)

        title = (
            "UMAP: 20 Newsgroups Embeddings\n(Fallback: PCA shown - UMAP unavailable)"
        )
        filename = os.path.join(output_dir, "umap_visualization.png")
        create_scatter_plot(coords_2d, labels, label_names, title, filename)


def main():
    """Main function to generate all figures."""
    # Get script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "figures")

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    print(f"Output directory: {output_dir}\n")

    # Load data and create embeddings
    embeddings, labels, label_names = load_data()

    # Apply each dimensionality reduction technique
    apply_pca(embeddings, labels, label_names, output_dir)
    apply_tsne(embeddings, labels, label_names, output_dir)
    apply_umap(embeddings, labels, label_names, output_dir)

    print("\n" + "=" * 50)
    print("All figures generated successfully!")
    print("=" * 50)

    # List output files
    print("\nGenerated files:")
    for f in sorted(os.listdir(output_dir)):
        if f.endswith(".png"):
            filepath = os.path.join(output_dir, f)
            size_kb = os.path.getsize(filepath) / 1024
            print(f"  {f} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
