"""
Model Loader Module

Loads pre-trained RoBERTa model from local folder for depression severity classification.
"""

import torch
import logging
import os
import json
from transformers import AutoTokenizer, AutoModelForSequenceClassification

logger = logging.getLogger(__name__)

# Global model and tokenizer variables
MODEL = None
TOKENIZER = None
LABEL_MAP = None

# Model configuration
BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "model")


def _normalize_label_name(label: str) -> str:
    """Convert raw model labels to API-facing label names."""
    normalized = str(label).strip().lower()
    if normalized == "minimum":
        return "Minimal"
    return normalized.capitalize()


def _normalize_label_map(raw_mapping: dict) -> dict:
    """Return a flat int->label map from either flat or nested label mapping JSON."""
    if not isinstance(raw_mapping, dict):
        raise ValueError("Invalid label mapping format: expected JSON object")

    id2label = raw_mapping.get("id2label", raw_mapping)
    normalized = {}

    for key, value in id2label.items():
        try:
            class_idx = int(key)
        except (TypeError, ValueError):
            continue
        normalized[class_idx] = _normalize_label_name(value)

    if not normalized:
        raise ValueError("Label mapping does not contain valid id2label entries")

    return normalized


def initialize_model() -> bool:
    global MODEL, TOKENIZER, LABEL_MAP

    try:
        logger.info("=" * 70)
        logger.info("Initializing Depression Severity Prediction Model")
        logger.info("=" * 70)

        # ✅ Check model directory
        if not os.path.exists(MODEL_DIR):
            raise FileNotFoundError(f"Model directory not found: {MODEL_DIR}")

        print(f"Loading model from: {MODEL_DIR}")

        # ✅ Load tokenizer (LOCAL)
        logger.info("Loading tokenizer...")
        TOKENIZER = AutoTokenizer.from_pretrained(
            MODEL_DIR,
            local_files_only=True,
        )
        logger.info("✓ Tokenizer loaded")

        # ✅ Load model (LOCAL)
        logger.info("Loading model...")
        MODEL = AutoModelForSequenceClassification.from_pretrained(
            MODEL_DIR,
            local_files_only=True
        )
        logger.info("✓ Model loaded")

        # ✅ Eval mode
        MODEL.eval()
        logger.info("✓ Model in evaluation mode")

        # ✅ Load label mapping (from file)
        label_path = os.path.join(MODEL_DIR, "label_mapping.json")
        with open(label_path, "r", encoding="utf-8") as f:
            LABEL_MAP = _normalize_label_map(json.load(f))

        logger.info(f"✓ Label mapping loaded: {LABEL_MAP}")

        # ✅ Move to device
        device = torch.device("cpu")
        MODEL.to(device)
        logger.info(f"✓ Model moved to device: {device}")

        logger.info("=" * 70)
        logger.info("✓ Model initialization complete!")
        logger.info("=" * 70)

        return True

    except Exception as e:
        logger.error(f"Model initialization failed: {str(e)}", exc_info=True)
        raise


def get_model():
    return MODEL


def get_tokenizer():
    return TOKENIZER


def get_label_map():
    return LABEL_MAP