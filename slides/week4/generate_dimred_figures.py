#!/usr/bin/env python3
"""
Generate dimensionality reduction visualization figures for Lecture 13.

Creates PNG figures showing 20 Newsgroups embeddings projected to 2D
using various dimensionality reduction techniques. Uses Avenir font to match slide theme.

Usage:
    python generate_dimred_figures.py

Output:
    figures/pca_visualization.png
    figures/tsne_visualization.png
    figures/umap_visualization.png
    figures/matrix_factorization_grid.png
    figures/manifold_learning_grid.png
"""

import os
import numpy as np
import matplotlib

matplotlib.use("Agg")  # Headless backend
import matplotlib.pyplot as plt
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import (
    TruncatedSVD,
    PCA,
    FastICA,
    FactorAnalysis,
    NMF,
    DictionaryLearning,
)
from sklearn.manifold import TSNE, MDS, Isomap, SpectralEmbedding
import warnings

warnings.filterwarnings("ignore")

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

    return embeddings, labels, label_names, tfidf_matrix


def create_scatter_plot(coords_2d, labels, label_names, title, filename):
    """Create and save a scatter plot with transparent background."""
    fig, ax = plt.subplots(figsize=(10, 8))

    # Set transparent background
    fig.patch.set_alpha(0.0)
    ax.patch.set_alpha(0.0)

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
    legend = ax.legend(
        loc="center left",
        bbox_to_anchor=(1.02, 0.5),
        frameon=True,
        fancybox=True,
        shadow=False,
    )
    legend.get_frame().set_alpha(0.8)
    legend.get_frame().set_facecolor("white")

    # Clean up axes
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.tick_params(axis="both", which="both", length=0)
    ax.set_xticks([])
    ax.set_yticks([])

    plt.tight_layout()
    plt.savefig(filename, dpi=150, bbox_inches="tight", transparent=True)
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
        max_iter=1000,
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

    # Set environment variable to avoid numba threading issues
    os.environ["NUMBA_NUM_THREADS"] = "1"

    import umap

    reducer = umap.UMAP(
        n_components=2,
        n_neighbors=15,
        min_dist=0.1,
        metric="cosine",
        random_state=42,
        n_jobs=1,  # Single-threaded to avoid numba issues
    )
    coords_2d = reducer.fit_transform(embeddings)

    title = "UMAP: 20 Newsgroups Embeddings\n(n_neighbors=15, min_dist=0.1)"
    filename = os.path.join(output_dir, "umap_visualization.png")
    create_scatter_plot(coords_2d, labels, label_names, title, filename)


def create_matrix_factorization_grid(
    embeddings, labels, label_names, tfidf_matrix, output_dir
):
    """Create a grid showing different matrix factorization methods."""
    print("\nCreating matrix factorization comparison grid...")

    # Use smaller subset for computational efficiency
    n_samples = min(500, len(embeddings))
    indices = np.random.choice(len(embeddings), n_samples, replace=False)
    X = embeddings[indices]
    X_nonneg = np.abs(X)  # For NMF which requires non-negative input
    y = labels[indices]

    methods = [
        ("PCA", PCA(n_components=2, random_state=42)),
        ("ICA", FastICA(n_components=2, random_state=42, max_iter=500)),
        ("Factor Analysis", FactorAnalysis(n_components=2, random_state=42)),
        ("NMF", NMF(n_components=2, random_state=42, max_iter=500, init="nndsvd")),
        (
            "Dictionary Learning",
            DictionaryLearning(
                n_components=2,
                random_state=42,
                max_iter=500,
                transform_algorithm="lasso_lars",
            ),
        ),
    ]

    fig, axes = plt.subplots(2, 3, figsize=(14, 9))
    fig.patch.set_alpha(0.0)
    axes = axes.flatten()

    for idx, (name, model) in enumerate(methods):
        ax = axes[idx]
        ax.patch.set_alpha(0.0)

        try:
            if name == "NMF":
                coords_2d = model.fit_transform(X_nonneg)
            else:
                coords_2d = model.fit_transform(X)

            for i, category in enumerate(label_names):
                mask = y == i
                if mask.sum() > 0:
                    short_name = CATEGORY_SHORT_NAMES.get(category, category)
                    ax.scatter(
                        coords_2d[mask, 0],
                        coords_2d[mask, 1],
                        c=COLORS[i % len(COLORS)],
                        label=short_name,
                        alpha=0.6,
                        s=15,
                        edgecolors="none",
                    )

            ax.set_title(name, fontweight="bold", fontsize=12)
            ax.set_xticks([])
            ax.set_yticks([])
            ax.spines["top"].set_visible(False)
            ax.spines["right"].set_visible(False)

        except Exception as e:
            ax.text(
                0.5,
                0.5,
                f"Error:\n{str(e)[:30]}",
                transform=ax.transAxes,
                ha="center",
                va="center",
            )
            ax.set_title(name, fontweight="bold", fontsize=12)

    # Hide the 6th subplot and add legend there
    axes[5].axis("off")
    handles, labels_legend = axes[0].get_legend_handles_labels()
    axes[5].legend(handles, labels_legend, loc="center", frameon=True, fontsize=10)
    axes[5].set_title("Categories", fontweight="bold", fontsize=12)

    fig.suptitle(
        "Matrix Factorization Methods: Y ≈ WF", fontsize=16, fontweight="bold", y=0.98
    )
    plt.tight_layout(rect=[0, 0, 1, 0.95])

    filename = os.path.join(output_dir, "matrix_factorization_grid.png")
    plt.savefig(filename, dpi=150, bbox_inches="tight", transparent=True)
    plt.close()
    print(f"  Saved: {filename}")


def create_manifold_learning_grid(embeddings, labels, label_names, output_dir):
    """Create a grid showing different manifold learning methods."""
    print("\nCreating manifold learning comparison grid...")

    # Use smaller subset for computational efficiency
    n_samples = min(300, len(embeddings))
    indices = np.random.choice(len(embeddings), n_samples, replace=False)
    X = embeddings[indices]
    y = labels[indices]

    # Pre-compute distance matrix for methods that need it
    from sklearn.metrics import pairwise_distances

    # Set environment variable for UMAP
    os.environ["NUMBA_NUM_THREADS"] = "1"
    import umap

    methods = [
        (
            "MDS",
            MDS(
                n_components=2, random_state=42, normalized_stress="auto", max_iter=300
            ),
        ),
        ("Isomap", Isomap(n_components=2, n_neighbors=10)),
        (
            "Spectral Embedding",
            SpectralEmbedding(n_components=2, random_state=42, n_neighbors=10),
        ),
        (
            "t-SNE",
            TSNE(
                n_components=2,
                perplexity=30,
                random_state=42,
                init="pca",
                method="exact",
            ),
        ),
        (
            "UMAP",
            umap.UMAP(
                n_components=2, n_neighbors=15, min_dist=0.1, random_state=42, n_jobs=1
            ),
        ),
    ]

    fig, axes = plt.subplots(2, 3, figsize=(14, 9))
    fig.patch.set_alpha(0.0)
    axes = axes.flatten()

    for idx, (name, model) in enumerate(methods):
        ax = axes[idx]
        ax.patch.set_alpha(0.0)

        try:
            print(f"  Computing {name}...")
            coords_2d = model.fit_transform(X)

            for i, category in enumerate(label_names):
                mask = y == i
                if mask.sum() > 0:
                    short_name = CATEGORY_SHORT_NAMES.get(category, category)
                    ax.scatter(
                        coords_2d[mask, 0],
                        coords_2d[mask, 1],
                        c=COLORS[i % len(COLORS)],
                        label=short_name,
                        alpha=0.6,
                        s=15,
                        edgecolors="none",
                    )

            ax.set_title(name, fontweight="bold", fontsize=12)
            ax.set_xticks([])
            ax.set_yticks([])
            ax.spines["top"].set_visible(False)
            ax.spines["right"].set_visible(False)

        except Exception as e:
            print(f"    Warning: {name} failed with {e}")
            ax.text(
                0.5,
                0.5,
                f"Error:\n{str(e)[:30]}",
                transform=ax.transAxes,
                ha="center",
                va="center",
            )
            ax.set_title(name, fontweight="bold", fontsize=12)

    # Hide the 6th subplot and add legend there
    axes[5].axis("off")
    handles, labels_legend = axes[0].get_legend_handles_labels()
    axes[5].legend(handles, labels_legend, loc="center", frameon=True, fontsize=10)
    axes[5].set_title("Categories", fontweight="bold", fontsize=12)

    fig.suptitle("Manifold Learning Methods", fontsize=16, fontweight="bold", y=0.98)
    plt.tight_layout(rect=[0, 0, 1, 0.95])

    filename = os.path.join(output_dir, "manifold_learning_grid.png")
    plt.savefig(filename, dpi=150, bbox_inches="tight", transparent=True)
    plt.close()
    print(f"  Saved: {filename}")


def main():
    """Main function to generate all figures."""
    # Get script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "figures")

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    print(f"Output directory: {output_dir}\n")

    # Load data and create embeddings
    embeddings, labels, label_names, tfidf_matrix = load_data()

    # Apply each dimensionality reduction technique
    apply_pca(embeddings, labels, label_names, output_dir)
    apply_tsne(embeddings, labels, label_names, output_dir)
    apply_umap(embeddings, labels, label_names, output_dir)

    # Create comparison grids
    create_matrix_factorization_grid(
        embeddings, labels, label_names, tfidf_matrix, output_dir
    )
    create_manifold_learning_grid(embeddings, labels, label_names, output_dir)

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
