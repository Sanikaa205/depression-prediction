"""
Depression Severity Prediction Module

Handles text classification inference with RoBERTa model,
risk scoring, suicidal risk detection, and personalized coping suggestions.
"""

import torch
import numpy as np
from typing import Dict, List, Any
import logging

# Import model loader functions
from model_loader import get_model, get_tokenizer, get_label_map

logger = logging.getLogger(__name__)


def _normalize_label_name(label: str) -> str:
    """Normalize raw model labels to the API's canonical label names."""
    normalized = str(label).strip().lower()
    if normalized == "minimum":
        return "Minimal"
    return normalized.capitalize()

# Suicidal risk keywords
SUICIDAL_KEYWORDS = [
    "suicide",
    "kill myself",
    "end my life",
    "don't want to live",
    "want to die",
    "no reason to live",
    "better off dead",
    "self harm",
]

# Coping suggestions by severity level
COPING_SUGGESTIONS = {
    "Minimal": [
        "✓ Practice daily gratitude and mindfulness",
        "✓ Maintain regular sleep and exercise routine",
        "✓ Spend time with loved ones or in nature",
        "✓ Engage in hobbies and activities you enjoy",
    ],
    "Mild": [
        "✓ Start a daily journaling practice to express feelings",
        "✓ Try morning walks or light exercise for mood boost",
        "✓ Use light therapy or increase time in sunlight",
        "✓ Practice deep breathing or meditation for 10 minutes daily",
    ],
    "Moderate": [
        "✓ Consider scheduling sessions with a counselor or therapist",
        "✓ Practice mindfulness meditation (apps like Headspace, Calm)",
        "✓ Strengthen social connections with friends and family",
        "✓ Explore cognitive behavioral therapy (CBT) techniques online",
    ],
    "Severe": [
        "🚨 Please reach out to a mental health professional immediately",
        "🚨 National Crisis Hotline: 988 (call or text, 24/7)",
        "🚨 Crisis Text Line: Text HOME to 741741",
        "🚨 If in immediate danger, call 911 or go to nearest emergency room",
    ],
}


def _detect_suicidal_risk(text: str, severity: str, confidence: float) -> bool:
    """
    Detect suicidal risk based on keywords and severity/confidence thresholds.
    
    Args:
        text: Input text to analyze
        severity: Predicted severity level
        confidence: Confidence score of prediction
        
    Returns:
        bool: True if suicidal risk detected
    """
    text_lower = text.lower()
    
    # Check for keywords
    for keyword in SUICIDAL_KEYWORDS:
        if keyword in text_lower:
            logger.warning(f"Suicidal keyword detected: '{keyword}'")
            return True
    
    # Flag if Severe prediction with high confidence
    if severity == "Severe" and confidence > 80.0:
        logger.warning(f"High-confidence Severe prediction: {confidence}%")
        return True
    
    return False


def _calculate_risk_score(probabilities: Dict[str, float]) -> float:
    """
    Calculate risk score based on probability of Moderate and Severe classes.
    
    Formula: (P(Moderate) * 60 + P(Severe) * 100)
    
    Args:
        probabilities: Dict with class labels as keys, probabilities as values
        
    Returns:
        float: Risk score (0-100), rounded to 2 decimal places
    """
    p_moderate = probabilities.get("Moderate", 0.0)
    p_severe = probabilities.get("Severe", 0.0)
    
    risk_score = (p_moderate * 60.0) + (p_severe * 100.0)
    risk_score = float(np.clip(risk_score, 0.0, 100.0))
    
    return round(risk_score, 2)


def _calculate_confidence_score(probabilities: Dict[str, float]) -> float:
    """
    Calculate confidence as max probability * 100.
    
    Args:
        probabilities: Dict with class labels as keys, probabilities as values
        
    Returns:
        float: Confidence score (0-100), rounded to 2 decimal places
    """
    max_prob = max(probabilities.values()) if probabilities else 0.0
    confidence = max_prob * 100.0
    
    return round(confidence, 2)


def _get_coping_suggestions(severity: str) -> List[str]:
    """
    Get coping suggestions tailored to severity level.
    
    Args:
        severity: Predicted severity level
        
    Returns:
        list: 4 coping suggestions
    """
    return COPING_SUGGESTIONS.get(severity, COPING_SUGGESTIONS["Minimal"])


def predict(text: str) -> Dict[str, Any]:
    """
    Predict depression severity and generate personalized insights.
    
    This function:
    1. Tokenizes input text
    2. Runs inference with RoBERTa model
    3. Calculates probabilities via softmax
    4. Maps to severity label
    5. Computes risk and confidence scores
    6. Detects suicidal ideation
    7. Generates coping suggestions
    
    Args:
        text (str): Input text to analyze for depression severity
        
    Returns:
        Dict with keys:
            - severity (str): Predicted severity level (Minimal, Mild, Moderate, Severe)
            - risk_score (float): Risk score 0-100 (2 decimals)
            - confidence_score (float): Model confidence 0-100 (2 decimals)
            - suicidal_risk (bool): True if suicidal ideation detected
            - coping_suggestions (list): 4 personalized suggestions
            - probabilities (dict): Class probabilities
            - error (str, optional): Error message if inference failed
    """
    
    print("=" * 70)
    print("PREDICT FUNCTION CALLED")
    print("=" * 70)
    print(f"Input: {text[:100]}...")
    
    # Validate inputs
    if not text or not isinstance(text, str):
        error_msg = "Input text must be a non-empty string"
        logger.error(error_msg)
        print(f"❌ {error_msg}")
        return {
            "severity": None,
            "risk_score": None,
            "confidence_score": None,
            "suicidal_risk": False,
            "coping_suggestions": [],
            "probabilities": {},
            "error": error_msg,
        }
    
    # Get model components using getters
    model = get_model()
    tokenizer = get_tokenizer()
    label_map = get_label_map()
    
    # Check if model is loaded
    if model is None or tokenizer is None or label_map is None:
        error_msg = "Model not initialized. Please run model_loader.py first."
        logger.error(error_msg)
        print(f"❌ {error_msg}")
        return {
            "severity": None,
            "risk_score": None,
            "confidence_score": None,
            "suicidal_risk": False,
            "coping_suggestions": [],
            "probabilities": {},
            "error": error_msg,
        }
    
    print("✓ Model components loaded")
    print(f"  - Model: {type(model).__name__}")
    print(f"  - Tokenizer: {type(tokenizer).__name__}")
    print(f"  - Labels: {list(label_map.values())}")
    
    try:
        # ==================== TOKENIZATION ====================
        print("\n📝 Tokenizing input...")
        logger.info(f"Tokenizing text: {text[:100]}...")
        
        inputs = tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True,
        )
        
        print(f"  - Tokens: {inputs['input_ids'].shape[1]}")
        
        # Move tensors to model device
        device = next(model.parameters()).device
        inputs = {key: value.to(device) for key, value in inputs.items()}
        print(f"  - Device: {device}")
        logger.debug(f"Inputs moved to device: {device}")
        
        # ==================== INFERENCE ====================
        print("\n🧠 Running inference...")
        logger.info("Running inference...")
        
        with torch.no_grad():
            outputs = model(**inputs)
        
        logits = outputs.logits
        logger.debug(f"Logits shape: {logits.shape}")
        print("  ✓ Inference complete")
        
        # ==================== PROBABILITIES ====================
        probabilities_tensor = torch.softmax(logits, dim=1)
        probabilities_list = probabilities_tensor.cpu().numpy().flatten().tolist()
        
        logger.debug(f"Raw probabilities: {probabilities_list}")
        print(f"  - Probabilities: {[f'{p:.4f}' for p in probabilities_list]}")
        
        # ==================== SEVERITY LABEL ====================
        predicted_class_idx = torch.argmax(logits, dim=1).item()
        severity = _normalize_label_name(
            label_map.get(predicted_class_idx, label_map.get(str(predicted_class_idx), "Unknown"))
        )
        
        logger.info(f"Predicted severity: {severity} (class {predicted_class_idx})")
        print(f"  - Predicted class: {predicted_class_idx} ({severity})")
        
        # ==================== CREATE PROBABILITY DICT ====================
        probabilities_dict = {}
        for class_idx, prob in enumerate(probabilities_list):
            raw_label = label_map.get(class_idx, label_map.get(str(class_idx), str(class_idx)))
            label = _normalize_label_name(raw_label)
            probabilities_dict[label] = float(prob)
        
        logger.debug(f"Probability dict: {probabilities_dict}")
        
        # ==================== RISK SCORE ====================
        risk_score = _calculate_risk_score(probabilities_dict)
        logger.info(f"Risk score: {risk_score}")
        print(f"  - Risk score: {risk_score}")
        
        # ==================== CONFIDENCE SCORE ====================
        confidence_score = _calculate_confidence_score(probabilities_dict)
        logger.info(f"Confidence score: {confidence_score}")
        print(f"  - Confidence: {confidence_score}%")
        
        # ==================== SUICIDAL RISK DETECTION ====================
        suicidal_risk = _detect_suicidal_risk(text, severity, confidence_score)
        logger.info(f"Suicidal risk detected: {suicidal_risk}")
        print(f"  - Suicidal risk: {suicidal_risk}")
        
        # ==================== COPING SUGGESTIONS ====================
        coping_suggestions = _get_coping_suggestions(severity)
        logger.info(f"Generated {len(coping_suggestions)} coping suggestions")
        print(f"  - Suggestions: {len(coping_suggestions)} generated")
        
        # ==================== RETURN RESULT ====================
        result = {
            "severity": severity,
            "risk_score": risk_score,
            "confidence_score": confidence_score,
            "suicidal_risk": suicidal_risk,
            "coping_suggestions": coping_suggestions,
            "probabilities": probabilities_dict,
        }
        
        logger.info("Prediction completed successfully")
        print("\n✅ PREDICTION COMPLETE")
        print(f"Output: {result}")
        print("=" * 70)
        
        return result
    
    except torch.cuda.OutOfMemoryError as e:
        error_msg = f"GPU out of memory: {str(e)}"
        logger.error(error_msg, exc_info=True)
        print(f"❌ {error_msg}")
        return {
            "severity": None,
            "risk_score": None,
            "confidence_score": None,
            "suicidal_risk": False,
            "coping_suggestions": [],
            "probabilities": {},
            "error": error_msg,
        }
    
    except RuntimeError as e:
        error_msg = f"Runtime error during inference: {str(e)}"
        logger.error(error_msg, exc_info=True)
        print(f"❌ {error_msg}")
        return {
            "severity": None,
            "risk_score": None,
            "confidence_score": None,
            "suicidal_risk": False,
            "coping_suggestions": [],
            "probabilities": {},
            "error": error_msg,
        }
    
    except Exception as e:
        error_msg = f"Unexpected error during prediction: {str(e)}"
        logger.error(error_msg, exc_info=True)
        print(f"❌ {error_msg}")
        return {
            "severity": None,
            "risk_score": None,
            "confidence_score": None,
            "suicidal_risk": False,
            "coping_suggestions": [],
            "probabilities": {},
            "error": error_msg,
        }


def batch_predict(texts: List[str]) -> List[Dict[str, Any]]:
    """
    Predict severity for multiple texts.
    
    Args:
        texts (List[str]): List of texts to analyze
        
    Returns:
        List[Dict]: List of prediction results
    """
    logger.info(f"Starting batch prediction for {len(texts)} texts")
    results = [predict(text) for text in texts]
    logger.info(f"Batch prediction completed: {len(results)} results")
    return results


if __name__ == "__main__":
    # Configure logging for testing
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    
    # Test examples
    test_texts = [
        "I feel great today and looking forward to the week ahead",
        "I've been feeling down lately and having trouble sleeping",
        "I can't stop thinking about ending everything, nothing matters anymore",
        "The pain is unbearable, I want to hurt myself to feel something",
    ]
    
    print("🧠 Depression Severity Predictor - Test Mode\n")
    print("=" * 70)
    
    for i, text in enumerate(test_texts, 1):
        print(f"\nTest {i}: {text[:60]}...")
        result = predict(text)
        
        if "error" in result:
            print(f"❌ Error: {result['error']}")
        else:
            print(f"  Severity: {result['severity']}")
            print(f"  Risk Score: {result['risk_score']}/100")
            print(f"  Confidence: {result['confidence_score']}%")
            print(f"  Suicidal Risk: {'⚠️ YES' if result['suicidal_risk'] else '✓ No'}")
            print(f"  Probabilities: {result['probabilities']}")
            print(f"  Suggestions:")
            for suggestion in result["coping_suggestions"]:
                print(f"    {suggestion}")
    
    print("\n" + "=" * 70)
    print("Test completed!")
