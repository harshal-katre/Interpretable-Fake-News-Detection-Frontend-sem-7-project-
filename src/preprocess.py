"""
Preprocessing pipelines for fake news detection.

Two pipelines:
  - classical: for TF-IDF based models (lowercases, strips URLs/HTML/non-letters,
    removes stopwords, lemmatizes)
  - transformer: for BERT-style models (strips URLs/HTML/extra whitespace only,
    preserves case and punctuation)
"""

import os
import re
import nltk
import pandas as pd

# Add local nltk_data directory if it exists
_local_nltk = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "nltk_data"))
if os.path.exists(_local_nltk) and _local_nltk not in nltk.data.path:
    nltk.data.path.insert(0, _local_nltk)


def _ensure_nltk_data():
    """Download required NLTK resources if missing."""
    for resource in ["stopwords", "wordnet", "omw-1.4"]:
        try:
            nltk.data.find(f"corpora/{resource}")
        except LookupError:
            try:
                nltk.download(resource, quiet=True)
            except Exception:
                pass
    for resource in ["punkt", "punkt_tab"]:
        try:
            nltk.data.find(f"tokenizers/{resource}")
        except LookupError:
            try:
                nltk.download(resource, quiet=True)
            except Exception:
                pass


_ensure_nltk_data()

from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

STOPWORDS = set(stopwords.words("english"))
LEMMATIZER = WordNetLemmatizer()


def clean_classical(text: str) -> str:
    """Full cleaning for classical ML models."""
    text = text.lower()
    text = re.sub(r"http\S+|www\.\S+", "", text)       # URLs
    text = re.sub(r"<[^>]+>", "", text)                  # HTML tags
    text = re.sub(r"[^a-z\s]", "", text)                 # non-letters
    tokens = text.split()
    tokens = [LEMMATIZER.lemmatize(w) for w in tokens if w not in STOPWORDS]
    return " ".join(tokens)


def clean_transformer(text: str) -> str:
    """Light cleaning for transformer models — keeps case and punctuation."""
    text = re.sub(r"http\S+|www\.\S+", "", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def load_dataset(path: str, pipeline: str = "classical") -> pd.DataFrame:
    """
    Load a CSV with 'text' and 'label' columns.

    Accepts datasets where the label column may contain:
      true / real  -> 0
      false / fake -> 1

    Args:
        path: Path to the CSV file.
        pipeline: 'classical' or 'transformer'.

    Returns:
        DataFrame with cleaned 'text' (str) and 'label' (int) columns.
    """
    df = pd.read_csv(path)

    # Normalise column names to lowercase
    df.columns = [c.strip().lower() for c in df.columns]
    if "text" not in df.columns or "label" not in df.columns:
        raise ValueError("Dataset must have 'text' and 'label' columns")

    df = df.dropna(subset=["text", "label"])
    df = df.drop_duplicates(subset=["text"])

    # Map labels
    label_map = {"true": 0, "real": 0, "false": 1, "fake": 1, "0": 0, "1": 1}
    df["label"] = df["label"].apply(
        lambda x: label_map.get(str(x).strip().lower(), x)
    )
    df["label"] = df["label"].astype(int)

    # Apply cleaning
    cleaner = clean_classical if pipeline == "classical" else clean_transformer
    df["text"] = df["text"].apply(cleaner)

    df = df[df["text"].str.strip().astype(bool)].reset_index(drop=True)
    return df


if __name__ == "__main__":
    import sys
    path = sys.argv[1] if len(sys.argv) > 1 else "data/sample_data.csv"
    df = load_dataset(path)
    print(f"Loaded {len(df)} rows  |  Label distribution:\n{df['label'].value_counts().to_string()}")
    print(f"\nSample:\n{df.head()}")
