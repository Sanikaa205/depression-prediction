"""
Pydantic Schema Models for Depression Severity Prediction API

Defines request/response validators and database models.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime


class AnalyzeRequest(BaseModel):
    """
    Request body for /analyze endpoint.
    
    Attributes:
        text (str): Input text for depression severity analysis
                   Must be at least 10 characters
        user_id (Optional[str]): MongoDB user ID for tracking user-specific history
    """
    text: str = Field(
        ...,
        min_length=10,
        max_length=10000,
        description="Text to analyze for depression severity (10-10000 chars)",
        example="I've been feeling really depressed and hopeless lately, unable to find joy in anything"
    )
    user_id: Optional[str] = Field(
        None,
        description="User ID for tracking history"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "I've been feeling really down and having trouble sleeping",
                "user_id": "507f1f77bcf86cd799439011"
            }
        }


class AnalyzeResponse(BaseModel):
    """
    Response body for /analyze endpoint.
    
    Includes database ID and full prediction results.
    """
    id: str = Field(
        ...,
        description="Database record ID (MongoDB ObjectId or SQLite integer)",
        example="507f1f77bcf86cd799439011"
    )
    text: str = Field(
        ...,
        description="Analyzed text",
        example="I've been feeling really down"
    )
    severity: str = Field(
        ...,
        description="Predicted severity level",
        example="Moderate"
    )
    risk_score: float = Field(
        ...,
        description="Risk score (0-100)",
        example=65.43
    )
    confidence_score: float = Field(
        ...,
        description="Model confidence (0-100)",
        example=89.12
    )
    suicidal_risk: bool = Field(
        ...,
        description="Suicidal ideation detected",
        example=False
    )
    coping_suggestions: List[str] = Field(
        ...,
        description="Personalized coping suggestions",
        example=[
            "✓ Consider scheduling sessions with a counselor or therapist",
            "✓ Practice mindfulness meditation (apps like Headspace, Calm)",
            "✓ Strengthen social connections with friends and family",
            "✓ Explore cognitive behavioral therapy (CBT) techniques online"
        ]
    )
    probabilities: Dict[str, float] = Field(
        ...,
        description="Probability distribution across all classes",
        example={
            "Minimal": 0.05,
            "Mild": 0.15,
            "Moderate": 0.60,
            "Severe": 0.20
        }
    )
    created_at: Optional[datetime] = Field(
        default=None,
        description="Timestamp when analysis was saved"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "text": "I've been feeling really down",
                "severity": "Moderate",
                "risk_score": 65.43,
                "confidence_score": 89.12,
                "suicidal_risk": False,
                "coping_suggestions": [
                    "✓ Consider scheduling sessions with a counselor or therapist",
                    "✓ Practice mindfulness meditation (apps like Headspace, Calm)"
                ],
                "probabilities": {
                    "Minimal": 0.05,
                    "Mild": 0.15,
                    "Moderate": 0.60,
                    "Severe": 0.20
                }
            }
        }


class HistoryItem(BaseModel):
    """
    Single analysis record from history.
    
    Used in /history endpoint response.
    """
    id: str = Field(..., description="Record ID (MongoDB ObjectId or SQLite integer)", example="507f1f77bcf86cd799439011")
    text: str = Field(..., description="Analyzed text")
    severity: str = Field(..., description="Predicted severity", example="Moderate")
    risk_score: float = Field(..., description="Risk score", example=65.43)
    confidence_score: float = Field(..., description="Confidence score", example=89.12)
    suicidal_risk: bool = Field(..., description="Suicidal risk flag", example=False)
    suggestions: List[str] = Field(..., description="Coping suggestions")
    created_at: str = Field(..., description="ISO timestamp", example="2026-04-04T15:30:22")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "text": "I've been feeling really down",
                "severity": "Moderate",
                "risk_score": 65.43,
                "confidence_score": 89.12,
                "suicidal_risk": False,
                "suggestions": ["✓ Try counseling", "✓ Practice meditation"],
                "created_at": "2026-04-04T15:30:22"
            }
        }


class LatestResult(BaseModel):
    """
    Latest analysis result (summary).
    
    Used in /latest-result endpoint response.
    """
    id: str = Field(..., description="Record ID (MongoDB ObjectId or SQLite integer)", example="507f1f77bcf86cd799439011")
    severity: str = Field(..., description="Predicted severity", example="Moderate")
    risk_score: float = Field(..., description="Risk score (0-100)", example=65.43)
    confidence_score: float = Field(..., description="Confidence score (0-100)", example=89.12)
    created_at: str = Field(..., description="ISO timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "severity": "Moderate",
                "risk_score": 65.43,
                "confidence_score": 89.12,
                "created_at": "2026-04-04T15:30:22"
            }
        }


class HealthResponse(BaseModel):
    """
    Health check response.
    
    Used in /health endpoint.
    """
    status: str = Field(..., description="API status", example="ok")
    model_loaded: bool = Field(..., description="ML model loaded", example=True)
    database_ready: bool = Field(..., description="Database initialized", example=True)
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "ok",
                "model_loaded": True,
                "database_ready": True
            }
        }


class ErrorResponse(BaseModel):
    """
    Standard error response.
    
    Used for 400, 422, 500 errors.
    """
    detail: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Error code")
    
    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Text must be at least 10 characters",
                "error_code": "VALIDATION_ERROR"
            }
        }


# ===================== AUTHENTICATION MODELS =====================

class SignupRequest(BaseModel):
    """
    User signup/registration request.
    
    Attributes:
        username (str): Unique username (3-50 characters)
        email (str): User email address
        password (str): Password (minimum 6 characters)
    """
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: str = Field(..., description="Email address")
    password: str = Field(..., min_length=6, description="Password (min 6 chars)")


class LoginRequest(BaseModel):
    """
    User login request.
    
    Attributes:
        username (str): Username
        password (str): Password
    """
    username: str = Field(..., description="Username")
    password: str = Field(..., description="Password")


class UserResponse(BaseModel):
    """
    User response (no password included).
    
    Attributes:
        id (str): User ID (MongoDB ObjectId as string)
        username (str): Username
        email (str): Email address
    """
    id: str = Field(..., description="User ID")
    username: str = Field(..., description="Username")
    email: str = Field(..., description="Email address")


class AuthResponse(BaseModel):
    """
    Authentication response (signup/login).
    
    Attributes:
        user (UserResponse): User data
        message (str): Response message
    """
    user: UserResponse = Field(..., description="User data")
    message: str = Field(..., description="Response message")
