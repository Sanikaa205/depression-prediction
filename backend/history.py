"""
MongoDB History Management Module

Handles storage and retrieval of depression severity analyses from MongoDB.
Each analysis record is linked to a user via user_id.
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import DESCENDING

logger = logging.getLogger(__name__)

# Global MongoDB connection
_history_db: Optional[AsyncIOMotorDatabase] = None


async def init_history_db(mongo_url: str) -> None:
    """
    Initialize MongoDB connection and ensure indices are created.
    
    Args:
        mongo_url (str): MongoDB connection string
    """
    global _history_db
    
    logger.info("📦 Initializing MongoDB for history storage...")
    
    try:
        client = AsyncIOMotorClient(mongo_url)
        _history_db = client["depression_predictor"]
        
        # Get analyses collection
        analyses_collection = _history_db["analyses"]
        
        # Create indices for better query performance
        await analyses_collection.create_index("user_id")
        await analyses_collection.create_index([("created_at", DESCENDING)])
        await analyses_collection.create_index([("user_id", 1), ("created_at", -1)])
        logger.info("✓ MongoDB history database initialized successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize history database: {str(e)}")
        raise


async def close_history_db() -> None:
    """Close MongoDB connection on shutdown."""
    try:
        if _history_db is not None:
            # The client is managed by motor, just log the closure
            logger.info("✓ MongoDB history connection closed")
    except Exception as e:
        logger.error(f"Error closing history database: {str(e)}")


async def save_analysis(
    user_id: str,
    text: str,
    severity: str,
    risk_score: float,
    confidence_score: float,
    suicidal_risk: bool,
    suggestions: List[str],
) -> str:
    """
    Save a depression severity analysis to MongoDB.
    
    Args:
        user_id (str): MongoDB user ID (from authentication)
        text (str): Input text analyzed
        severity (str): Predicted severity level
        risk_score (float): Risk score (0-100)
        confidence_score (float): Model confidence (0-100)
        suicidal_risk (bool): Suicidal risk detected
        suggestions (List[str]): Coping suggestions
    
    Returns:
        str: ID of the inserted document
    """
    try:
        if _history_db is None:
            raise RuntimeError("History database not initialized")
        
        analyses_collection = _history_db["analyses"]
        
        # Create analysis document
        analysis_doc = {
            "user_id": user_id,
            "text": text,
            "severity": severity,
            "risk_score": risk_score,
            "confidence_score": confidence_score,
            "suicidal_risk": suicidal_risk,
            "suggestions": suggestions,
            "created_at": datetime.utcnow(),
        }
        
        logger.debug(f"Saving analysis for user {user_id}")
        
        # Insert document
        result = await analyses_collection.insert_one(analysis_doc)
        
        logger.info(f"✓ Analysis saved with ID: {result.inserted_id}")
        return str(result.inserted_id)
        
    except Exception as e:
        logger.error(f"❌ Error saving analysis: {str(e)}")
        raise


async def get_analyses_by_user(user_id: str) -> List[Dict[str, Any]]:
    """
    Fetch all analyses for a specific user from MongoDB.
    
    Args:
        user_id (str): MongoDB user ID to filter by
    
    Returns:
        List[Dict]: List of analysis documents ordered by newest first
    """
    try:
        if _history_db is None:
            raise RuntimeError("History database not initialized")
        
        analyses_collection = _history_db["analyses"]
        
        logger.debug(f"Fetching analyses for user: {user_id}")
        
        # Query analyses for this user, ordered by most recent first
        cursor = analyses_collection.find(
            {"user_id": user_id}
        ).sort("created_at", DESCENDING)
        
        analyses = []
        async for doc in cursor:
            # Convert MongoDB _id to string and reformat for response
            analysis = {
                "id": str(doc["_id"]),
                "user_id": doc["user_id"],
                "text": doc["text"],
                "severity": doc["severity"],
                "risk_score": doc["risk_score"],
                "confidence_score": doc["confidence_score"],
                "suicidal_risk": doc["suicidal_risk"],
                "suggestions": doc["suggestions"],
                "created_at": doc["created_at"].isoformat() if isinstance(doc["created_at"], datetime) else doc["created_at"],
            }
            analyses.append(analysis)
        
        logger.info(f"✓ Retrieved {len(analyses)} analyses for user: {user_id}")
        return analyses
        
    except Exception as e:
        logger.error(f"❌ Error fetching user analyses: {str(e)}")
        raise


async def get_all_analyses() -> List[Dict[str, Any]]:
    """
    Fetch all analyses from MongoDB (for admin purposes).
    
    Returns:
        List[Dict]: All analysis documents ordered by newest first
    """
    try:
        if _history_db is None:
            raise RuntimeError("History database not initialized")
        
        analyses_collection = _history_db["analyses"]
        
        logger.debug("Fetching all analyses from database")
        
        cursor = analyses_collection.find({}).sort("created_at", DESCENDING)
        
        analyses = []
        async for doc in cursor:
            analysis = {
                "id": str(doc["_id"]),
                "user_id": doc["user_id"],
                "text": doc["text"],
                "severity": doc["severity"],
                "risk_score": doc["risk_score"],
                "confidence_score": doc["confidence_score"],
                "suicidal_risk": doc["suicidal_risk"],
                "suggestions": doc["suggestions"],
                "created_at": doc["created_at"].isoformat() if isinstance(doc["created_at"], datetime) else doc["created_at"],
            }
            analyses.append(analysis)
        
        logger.info(f"✓ Retrieved {len(analyses)} total analyses from database")
        return analyses
        
    except Exception as e:
        logger.error(f"❌ Error fetching all analyses: {str(e)}")
        raise


async def delete_analysis(analysis_id: str, user_id: str) -> bool:
    """
    Delete an analysis (only if it belongs to the user).
    
    Args:
        analysis_id (str): Analysis document ID to delete
        user_id (str): User ID (for authorization check)
    
    Returns:
        bool: True if deleted, False if not found
    """
    try:
        if _history_db is None:
            raise RuntimeError("History database not initialized")
        
        from bson.objectid import ObjectId
        
        analyses_collection = _history_db["analyses"]
        
        # Delete only if it belongs to this user
        result = await analyses_collection.delete_one({
            "_id": ObjectId(analysis_id),
            "user_id": user_id
        })
        
        if result.deleted_count > 0:
            logger.info(f"✓ Analysis {analysis_id} deleted")
            return True
        else:
            logger.warning(f"Analysis {analysis_id} not found or doesn't belong to user {user_id}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error deleting analysis: {str(e)}")
        raise
