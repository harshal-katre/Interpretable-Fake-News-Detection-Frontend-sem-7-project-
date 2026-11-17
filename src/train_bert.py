"""
Fine-tune bert-base-uncased for binary fake news classification.

This script requires a GPU and the full torch/transformers stack.
Run it separately after installing those dependencies.

Usage:
    python src/train_bert.py --data data/sample_data.csv --epochs 3 --batch_size 16
"""

import argparse
import os
import sys

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

import torch
from datasets import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
)

sys.path.insert(0, os.path.dirname(__file__))
from preprocess import load_dataset

SEED = 42
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models", "bert")
MODEL_NAME = "bert-base-uncased"


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, preds, average="binary"
    )
    acc = accuracy_score(labels, preds)
    return {"accuracy": acc, "precision": precision, "recall": recall, "f1": f1}


def main(data_path: str, epochs: int = 3, batch_size: int = 16):
    # Load and split data using the transformer pipeline (light cleaning)
    df = load_dataset(data_path, pipeline="transformer")
    train_df, val_df = train_test_split(
        df, test_size=0.2, stratify=df["label"], random_state=SEED
    )

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    def tokenize(batch):
        return tokenizer(
            batch["text"], padding="max_length", truncation=True, max_length=256
        )

    train_ds = Dataset.from_pandas(train_df[["text", "label"]]).map(tokenize, batched=True)
    val_ds = Dataset.from_pandas(val_df[["text", "label"]]).map(tokenize, batched=True)

    train_ds.set_format("torch", columns=["input_ids", "attention_mask", "label"])
    val_ds.set_format("torch", columns=["input_ids", "attention_mask", "label"])

    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME, num_labels=2
    )

    training_args = TrainingArguments(
        output_dir=MODELS_DIR,
        num_train_epochs=epochs,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        logging_steps=10,
        seed=SEED,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=val_ds,
        compute_metrics=compute_metrics,
    )

    trainer.train()

    # Save final model and tokenizer
    os.makedirs(MODELS_DIR, exist_ok=True)
    model.save_pretrained(MODELS_DIR)
    tokenizer.save_pretrained(MODELS_DIR)
    print(f"\nBERT model and tokenizer saved to {MODELS_DIR}/")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default="data/sample_data.csv")
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch_size", type=int, default=16)
    args = parser.parse_args()
    main(args.data, args.epochs, args.batch_size)
