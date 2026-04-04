"""
Depression Severity Prediction API

A FastAPI application for analyzing text and predicting depression severity
using a pre-trained RoBERTa model with risk scoring and personalized suggestions.

Endpoints:
    GET  /health              - Health check
    POST /analyze             - Analyze text and predict severity
    GET  /history             - Get all analysis history
    GET  /latest-result       - Get most recent analysis
    
Documentation:
    Swagger UI: http://localhost:8000/docs
    ReDoc:      http://localhost:8000/redoc
"""

import logging
import uvicorn
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Import our modules
from model_loader import initialize_model, get_model
from predictor import predict
from database import init_db, save_analysis, get_all_analyses, get_latest_analysis
from schema import (
    AnalyzeRequest,
    AnalyzeResponse,
    HistoryItem,
    LatestResult,
    HealthResponse,
    ErrorResponse,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Track initialization state
startup_complete = {"model": False, "database": False}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan context manager.
    
    Handles startup and shutdown tasks:
    - Startup: Initialize database and load ML model
    - Shutdown: Cleanup (optional)
    """
    # ================= STARTUP =================
    try:
        logger.info("=" * 70)
        logger.info("Depression Severity Prediction API - Startup Sequence")
        logger.info("=" * 70)
        
        # Initialize database
        logger.info("📦 Initializing database...")
        await init_db()
        startup_complete["database"] = True
        logger.info("✓ Database initialized successfully")
        
        # Load ML model
        logger.info("🧠 Loading ML model...")
        initialize_model()
        startup_complete["model"] = True
        logger.info("✓ Model loaded successfully")
        
        logger.info("=" * 70)
        logger.info("🚀 API Ready! All systems operational.")
        logger.info("=" * 70)
        logger.info("📚 Documentation available at:")
        logger.info("   - Swagger UI: http://localhost:8000/docs")
        logger.info("   - ReDoc:      http://localhost:8000/redoc")
        logger.info("=" * 70)
    
    except Exception as e:
        logger.error(f"❌ Startup failed: {str(e)}", exc_info=True)
        raise
    
    # Yield control to app
    yield
    
    # ================= SHUTDOWN =================
    logger.info("🛑 API Shutdown")


# Create FastAPI app with lifespan
app = FastAPI(
    title="Depression Severity Prediction API",
    description="Analyze text to predict depression severity with risk scores and personalized coping strategies",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Add CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

logger.info("CORSMiddleware configured: allowing all origins")


# ===================== HEALTH CHECK ENDPOINT =====================
@app.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    tags=["System"],
    summary="Health Check",
    description="Check API health status and component availability",
    responses={
        200: {
            "description": "API is healthy",
            "model": HealthResponse,
        },
        503: {
            "description": "Service unavailable - components not ready",
        },
    },
)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.
    
    Returns:
        HealthResponse: Status and component readiness
    """
    model_ready = get_model() is not None and startup_complete.get("model", False)
    database_ready = startup_complete.get("database", False)
    
    if not (model_ready and database_ready):
        logger.warning("Health check failed: not all components ready")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="API components not ready",
        )
    
    logger.debug("Health check passed")
    return HealthResponse(
        status="ok",
        model_loaded=model_ready,
        database_ready=database_ready,
    )


# ===================== ANALYZE ENDPOINT =====================
@app.post(
    "/analyze",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Analysis"],
    summary="Analyze Depression Severity",
    description="Analyze text input to predict depression severity and receive personalized recommendations",
    responses={
        201: {
            "description": "Analysis successful",
            "model": AnalyzeResponse,
        },
        422: {
            "description": "Validation error",
            "model": ErrorResponse,
        },
        500: {
            "description": "Internal server error",
            "model": ErrorResponse,
        },
    },
)
async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    """
    Analyze text for depression severity.
    
    This endpoint:
    1. Validates input text (10+ characters)
    2. Runs ML prediction model
    3. Saves result to database
    4. Returns analysis with ID and recommendations
    
    Args:
        request (AnalyzeRequest): Text input to analyze
        
    Returns:
        AnalyzeResponse: Full analysis results with suggestions
        
    Raises:
        HTTPException: 422 on invalid input, 500 on prediction error
    """
    try:
        logger.info(f"📝 Analyzing text: {request.text[:50]}...")
        
        # Run prediction
        prediction_result = predict(request.text)
        
        # Check for prediction errors
        if "error" in prediction_result:
            logger.error(f"Prediction error: {prediction_result['error']}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Prediction failed: {prediction_result['error']}",
            )
        
        # Save to database
        logger.info("💾 Saving analysis to database...")
        analysis_id = await save_analysis(
            text=request.text,
            severity=prediction_result["severity"],
            risk_score=prediction_result["risk_score"],
            confidence_score=prediction_result["confidence_score"],
            suicidal_risk=prediction_result["suicidal_risk"],
            suggestions=prediction_result["coping_suggestions"],
        )
        
        logger.info(f"✓ Analysis saved with ID: {analysis_id}")
        
        # Prepare response
        response = AnalyzeResponse(
            id=analysis_id,
            text=request.text,
            severity=prediction_result["severity"],
            risk_score=prediction_result["risk_score"],
            confidence_score=prediction_result["confidence_score"],
            suicidal_risk=prediction_result["suicidal_risk"],
            coping_suggestions=prediction_result["coping_suggestions"],
            probabilities=prediction_result["probabilities"],
        )
        
        logger.info("✓ Analysis completed successfully")
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error in /analyze: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during analysis",
        )


# ===================== HISTORY ENDPOINT =====================
@app.get(
    "/history",
    response_model=List[HistoryItem],
    status_code=status.HTTP_200_OK,
    tags=["History"],
    summary="Get Analysis History",
    description="Retrieve all previous depression severity analyses, ordered by most recent",
    responses={
        200: {
            "description": "History retrieved successfully",
            "model": List[HistoryItem],
        },
        500: {
            "description": "Database error",
            "model": ErrorResponse,
        },
    },
)
async def get_history() -> List[HistoryItem]:
    """
    Get analysis history.
    
    Returns:
        List[HistoryItem]: All analyses ordered by creation date (newest first)
    """
    try:
        logger.info("📚 Fetching analysis history...")
        analyses = await get_all_analyses()
        
        # Convert to HistoryItem format
        history_items = [
            HistoryItem(
                id=analysis["id"],
                text=analysis["text"],
                severity=analysis["severity"],
                risk_score=analysis["risk_score"],
                confidence_score=analysis["confidence_score"],
                suicidal_risk=analysis["suicidal_risk"],
                suggestions=analysis["suggestions"],
                created_at=analysis["created_at"],
            )
            for analysis in analyses
        ]
        
        logger.info(f"✓ Retrieved {len(history_items)} history items")
        return history_items
    
    except Exception as e:
        logger.error(f"❌ Error fetching history: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve history",
        )


# ===================== LATEST RESULT ENDPOINT =====================
@app.get(
    "/latest-result",
    response_model=LatestResult,
    status_code=status.HTTP_200_OK,
    tags=["History"],
    summary="Get Latest Analysis",
    description="Retrieve the most recent depression severity analysis",
    responses={
        200: {
            "description": "Latest result retrieved",
            "model": LatestResult,
        },
        404: {
            "description": "No analysis available",
            "model": ErrorResponse,
        },
        500: {
            "description": "Database error",
            "model": ErrorResponse,
        },
    },
)
async def get_latest() -> LatestResult:
    """
    Get latest analysis result.
    
    Returns:
        LatestResult: Most recent analysis or 404 if no data
        
    Raises:
        HTTPException: 404 if no analyses exist
    """
    try:
        logger.info("📊 Fetching latest analysis...")
        latest = await get_latest_analysis()
        
        if not latest:
            logger.warning("No analyses found in database")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No analyses available",
            )
        
        result = LatestResult(
            id=latest["id"],
            severity=latest["severity"],
            risk_score=latest["risk_score"],
            confidence_score=latest["confidence_score"],
            created_at=latest["created_at"],
        )
        
        logger.info(f"✓ Retrieved latest result: ID {result.id}")
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching latest result: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve latest result",
        )


# ===================== GLOBAL EXCEPTION HANDLERS =====================
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle validation errors"""
    logger.error(f"Validation error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": str(exc),
            "error_code": "VALIDATION_ERROR",
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle unexpected errors"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "error_code": "INTERNAL_ERROR",
        },
    )


# ===================== ROOT ENDPOINT =====================
@app.get("/", tags=["System"])
async def root():
    """
    Root endpoint - API information.
    
    Returns:
        dict: API metadata and documentation links
    """
    return {
        "name": "Depression Severity Prediction API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "http://localhost:8000/docs",
        "redoc": "http://localhost:8000/redoc",
        "endpoints": {
            "health": "/health",
            "analyze": "/analyze (POST)",
            "history": "/history",
            "latest": "/latest-result",
        },
    }


# ===================== MAIN =====================
if __name__ == "__main__":
    logger.info("Starting Depression Severity Prediction API...")
    logger.info("🌐 Server will be available at http://0.0.0.0:8000")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
