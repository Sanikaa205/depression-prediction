"""
SQLite Database Management Module

Handles async database operations for depression severity analysis records.
Uses aiosqlite for non-blocking database access with FastAPI.
"""

import aiosqlite
import json
import logging
from typing import List, Dict, Optional, Any
from pathlib import Path

logger = logging.getLogger(__name__)

# Database file path (will be created in backend/ directory)
DATABASE_URL = "depression.db"


async def init_db() -> None:
    """
    Initialize the database and create the 'analyses' table if it doesn't exist.
    
    This function:
    1. Creates depression.db if it doesn't exist
    2. Creates 'analyses' table with schema
    3. Logs success or error
    
    Called on FastAPI app startup via lifespan context manager.
    Safe to call multiple times (uses IF NOT EXISTS).
    
    Raises:
        aiosqlite.Error: If database operations fail
    """
    try:
        async with aiosqlite.connect(DATABASE_URL) as db:
            # Create analyses table with user_id column
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS analyses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    text TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    risk_score REAL,
                    confidence_score REAL,
                    suicidal_risk INTEGER DEFAULT 0,
                    suggestions TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            
            # Try to add user_id column if it doesn't exist (migration for existing databases)
            try:
                cursor = await db.execute("PRAGMA table_info(analyses)")
                columns = await cursor.fetchall()
                column_names = [col[1] for col in columns]
                
                if 'user_id' not in column_names:
                    logger.info("Adding user_id column to analyses table")
                    await db.execute("ALTER TABLE analyses ADD COLUMN user_id TEXT")
            except aiosqlite.Error:
                # Column might already exist, continue
                pass
            
            # Create index on created_at for faster queries
            await db.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_analyses_created_at 
                ON analyses(created_at DESC)
                """
            )
            
            await db.commit()
            logger.info(f"Database initialized successfully: {DATABASE_URL}")
    
    except aiosqlite.Error as e:
        logger.error(f"Database initialization error: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during database initialization: {str(e)}")
        raise


async def save_analysis(
    text: str,
    severity: str,
    risk_score: float,
    confidence_score: float,
    suicidal_risk: bool,
    suggestions: List[str],
    user_id: Optional[str] = None,
) -> int:
    """
    Save a depression severity analysis record to the database.
    
    This function:
    1. Converts suggestions list to JSON string
    2. Converts boolean suicidal_risk to integer (0/1)
    3. Inserts record into analyses table
    4. Returns the new row's ID
    
    Args:
        text (str): Input text analyzed
        severity (str): Predicted severity level (Minimal, Mild, Moderate, Severe)
        risk_score (float): Risk score (0-100)
        confidence_score (float): Model confidence (0-100)
        suicidal_risk (bool): True if suicidal ideation detected
        suggestions (List[str]): List of coping suggestions
        
    Returns:
        int: ID of the inserted row
        
    Raises:
        aiosqlite.Error: If database insertion fails
        ValueError: If invalid input parameters
    """
    try:
        # Validate inputs
        if not isinstance(text, str) or not text.strip():
            raise ValueError("Text must be a non-empty string")
        
        if not isinstance(severity, str):
            raise ValueError("Severity must be a string")
        
        if not isinstance(suggestions, list):
            raise ValueError("Suggestions must be a list")
        
        # Convert suicidal_risk boolean to integer (0 or 1)
        suicidal_risk_int = 1 if suicidal_risk else 0
        
        # Convert suggestions list to JSON string
        suggestions_json = json.dumps(suggestions)
        
        logger.debug(f"Saving analysis: severity={severity}, risk_score={risk_score}, user_id={user_id}")
        
        async with aiosqlite.connect(DATABASE_URL) as db:
            cursor = await db.execute(
                """
                INSERT INTO analyses 
                (user_id, text, severity, risk_score, confidence_score, suicidal_risk, suggestions)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (user_id, text, severity, risk_score, confidence_score, suicidal_risk_int, suggestions_json),
            )
            
            await db.commit()
            
            # Get the ID of the inserted row
            row_id = cursor.lastrowid
            logger.info(f"Analysis saved successfully with ID: {row_id}")
            
            return row_id
    
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise
    except aiosqlite.Error as e:
        logger.error(f"Database error during save: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during save: {str(e)}")
        raise


async def get_all_analyses() -> List[Dict[str, Any]]:
    """
    Fetch all depression severity analysis records from the database.
    
    This function:
    1. Queries all rows from analyses table
    2. Orders by created_at DESC (newest first)
    3. Converts JSON suggestions back to Python lists
    4. Converts suicidal_risk integer (0/1) to boolean
    5. Returns list of dictionaries
    
    Returns:
        List[Dict]: List of analysis records, each with keys:
            - id (int): Record ID
            - text (str): Analyzed text
            - severity (str): Predicted severity
            - risk_score (float): Risk score
            - confidence_score (float): Confidence
            - suicidal_risk (bool): Suicidal risk flag
            - suggestions (List[str]): Coping suggestions
            - created_at (str): Timestamp
        
        Returns empty list if no records exist.
        
    Raises:
        aiosqlite.Error: If database query fails
    """
    try:
        logger.debug("Fetching all analyses from database")
        
        async with aiosqlite.connect(DATABASE_URL) as db:
            # Enable row factory to get rows as dictionaries
            db.row_factory = aiosqlite.Row
            
            cursor = await db.execute(
                """
                SELECT id, text, severity, risk_score, confidence_score, 
                       suicidal_risk, suggestions, created_at
                FROM analyses
                ORDER BY created_at DESC
                """
            )
            
            rows = await cursor.fetchall()
            
            if not rows:
                logger.info("No analyses found in database")
                return []
            
            # Convert rows to list of dicts and parse JSON suggestions
            analyses = []
            for row in rows:
                analysis = {
                    "id": row["id"],
                    "text": row["text"],
                    "severity": row["severity"],
                    "risk_score": row["risk_score"],
                    "confidence_score": row["confidence_score"],
                    "suicidal_risk": bool(row["suicidal_risk"]),  # Convert 0/1 to bool
                    "suggestions": json.loads(row["suggestions"]) if row["suggestions"] else [],
                    "created_at": row["created_at"],
                }
                analyses.append(analysis)
            
            logger.info(f"Retrieved {len(analyses)} analyses from database")
            return analyses
    
    except aiosqlite.Error as e:
        logger.error(f"Database error during fetch all: {str(e)}")
        raise
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during fetch all: {str(e)}")
        raise


async def get_analyses_by_user(user_id: str) -> List[Dict[str, Any]]:
    """
    Fetch depression severity analysis records for a specific user.
    
    This function:
    1. Queries all rows from analyses table where user_id matches EXACTLY
    2. Orders by created_at DESC (newest first)
    3. Converts JSON suggestions back to Python lists
    4. Converts suicidal_risk integer (0/1) to boolean
    5. Returns list of dictionaries
    
    Args:
        user_id (str): MongoDB user ID to filter by
    
    Returns:
        List[Dict]: List of analysis records for ONLY that user, each with keys:
            - id (int): Record ID
            - user_id (str): User ID
            - text (str): Analyzed text
            - severity (str): Predicted severity
            - risk_score (float): Risk score
            - confidence_score (float): Confidence
            - suicidal_risk (bool): Suicidal risk flag
            - suggestions (List[str]): Coping suggestions
            - created_at (str): Timestamp
        
        Returns empty list if no records exist for this user.
        
    Raises:
        aiosqlite.Error: If database query fails
    """
    try:
        logger.debug(f"Fetching analyses for user: {user_id}")
        
        async with aiosqlite.connect(DATABASE_URL) as db:
            # Enable row factory to get rows as dictionaries
            db.row_factory = aiosqlite.Row
            
            cursor = await db.execute(
                """
                SELECT id, user_id, text, severity, risk_score, confidence_score, 
                       suicidal_risk, suggestions, created_at
                FROM analyses
                WHERE user_id = ?
                ORDER BY created_at DESC
                """,
                (user_id,)
            )
            
            rows = await cursor.fetchall()
            
            if not rows:
                logger.info(f"No analyses found for user: {user_id}")
                return []
            
            # Convert rows to list of dicts and parse JSON suggestions
            analyses = []
            for row in rows:
                analysis = {
                    "id": row["id"],
                    "user_id": row["user_id"],
                    "text": row["text"],
                    "severity": row["severity"],
                    "risk_score": row["risk_score"],
                    "confidence_score": row["confidence_score"],
                    "suicidal_risk": bool(row["suicidal_risk"]),  # Convert 0/1 to bool
                    "suggestions": json.loads(row["suggestions"]) if row["suggestions"] else [],
                    "created_at": row["created_at"],
                }
                analyses.append(analysis)
            
            logger.info(f"Retrieved {len(analyses)} analyses for user: {user_id}")
            return analyses
    
    except aiosqlite.Error as e:
        logger.error(f"Database error during fetch user analyses: {str(e)}")
        raise
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during fetch user analyses: {str(e)}")
        raise


async def get_latest_analysis() -> Optional[Dict[str, Any]]:
    """
    Fetch the most recent depression severity analysis record.
    
    This function:
    1. Queries the latest row from analyses table
    2. Converts JSON suggestions back to Python list
    3. Converts suicidal_risk integer to boolean
    4. Returns dict or None if no records exist
    
    Returns:
        Dict or None: Latest analysis record with keys:
            - id (int): Record ID
            - text (str): Analyzed text
            - severity (str): Predicted severity
            - risk_score (float): Risk score
            - confidence_score (float): Confidence
            - suicidal_risk (bool): Suicidal risk flag
            - suggestions (List[str]): Coping suggestions
            - created_at (str): Timestamp
        
        Returns None if no records exist in database.
        
    Raises:
        aiosqlite.Error: If database query fails
    """
    try:
        logger.debug("Fetching latest analysis from database")
        
        async with aiosqlite.connect(DATABASE_URL) as db:
            db.row_factory = aiosqlite.Row
            
            cursor = await db.execute(
                """
                SELECT id, text, severity, risk_score, confidence_score,
                       suicidal_risk, suggestions, created_at
                FROM analyses
                ORDER BY created_at DESC
                LIMIT 1
                """
            )
            
            row = await cursor.fetchone()
            
            if not row:
                logger.info("No analyses found in database")
                return None
            
            # Convert row to dict and parse JSON suggestions
            analysis = {
                "id": row["id"],
                "text": row["text"],
                "severity": row["severity"],
                "risk_score": row["risk_score"],
                "confidence_score": row["confidence_score"],
                "suicidal_risk": bool(row["suicidal_risk"]),  # Convert 0/1 to bool
                "suggestions": json.loads(row["suggestions"]) if row["suggestions"] else [],
                "created_at": row["created_at"],
            }
            
            logger.info(f"Retrieved latest analysis: ID {analysis['id']}")
            return analysis
    
    except aiosqlite.Error as e:
        logger.error(f"Database error during fetch latest: {str(e)}")
        raise
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during fetch latest: {str(e)}")
        raise


async def delete_analysis(analysis_id: int) -> bool:
    """
    Delete an analysis record by ID.
    
    Args:
        analysis_id (int): ID of the analysis to delete
        
    Returns:
        bool: True if deletion successful, False if not found
        
    Raises:
        aiosqlite.Error: If database operation fails
    """
    try:
        logger.debug(f"Deleting analysis with ID: {analysis_id}")
        
        async with aiosqlite.connect(DATABASE_URL) as db:
            cursor = await db.execute(
                "DELETE FROM analyses WHERE id = ?",
                (analysis_id,),
            )
            
            await db.commit()
            
            deleted_count = cursor.rowcount
            
            if deleted_count > 0:
                logger.info(f"Analysis {analysis_id} deleted successfully")
                return True
            else:
                logger.warning(f"Analysis {analysis_id} not found")
                return False
    
    except aiosqlite.Error as e:
        logger.error(f"Database error during delete: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during delete: {str(e)}")
        raise


async def get_statistics() -> Dict[str, Any]:
    """
    Get aggregate statistics from all analyses.
    
    Returns:
        Dict with keys:
            - total_analyses (int): Total number of records
            - severe_count (int): Number of Severe predictions
            - moderate_count (int): Number of Moderate predictions
            - mild_count (int): Number of Mild predictions
            - minimal_count (int): Number of Minimal predictions
            - suicidal_risk_count (int): Number with suicidal risk detected
            - avg_risk_score (float): Average risk score
            - avg_confidence_score (float): Average confidence
            
    Raises:
        aiosqlite.Error: If database query fails
    """
    try:
        logger.debug("Fetching statistics from database")
        
        async with aiosqlite.connect(DATABASE_URL) as db:
            cursor = await db.execute(
                """
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN severity = 'Severe' THEN 1 ELSE 0 END) as severe_count,
                    SUM(CASE WHEN severity = 'Moderate' THEN 1 ELSE 0 END) as moderate_count,
                    SUM(CASE WHEN severity = 'Mild' THEN 1 ELSE 0 END) as mild_count,
                    SUM(CASE WHEN severity = 'Minimal' THEN 1 ELSE 0 END) as minimal_count,
                    SUM(CASE WHEN suicidal_risk = 1 THEN 1 ELSE 0 END) as suicidal_count,
                    AVG(risk_score) as avg_risk,
                    AVG(confidence_score) as avg_confidence
                FROM analyses
                """
            )
            
            row = await cursor.fetchone()
            
            stats = {
                "total_analyses": row[0] or 0,
                "severe_count": row[1] or 0,
                "moderate_count": row[2] or 0,
                "mild_count": row[3] or 0,
                "minimal_count": row[4] or 0,
                "suicidal_risk_count": row[5] or 0,
                "avg_risk_score": round(row[6], 2) if row[6] else 0.0,
                "avg_confidence_score": round(row[7], 2) if row[7] else 0.0,
            }
            
            logger.info(f"Retrieved statistics: {stats['total_analyses']} total analyses")
            return stats
    
    except aiosqlite.Error as e:
        logger.error(f"Database error during statistics query: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during statistics query: {str(e)}")
        raise


async def clear_all_analyses() -> int:
    """
    Clear all analysis records from the database.
    
    ⚠️  WARNING: This is irreversible!
    
    Returns:
        int: Number of records deleted
        
    Raises:
        aiosqlite.Error: If database operation fails
    """
    try:
        logger.warning("Clearing all analyses from database - THIS IS IRREVERSIBLE")
        
        async with aiosqlite.connect(DATABASE_URL) as db:
            cursor = await db.execute("DELETE FROM analyses")
            await db.commit()
            
            deleted_count = cursor.rowcount
            logger.warning(f"Deleted {deleted_count} analyses from database")
            
            return deleted_count
    
    except aiosqlite.Error as e:
        logger.error(f"Database error during clear: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during clear: {str(e)}")
        raise


if __name__ == "__main__":
    # Test mode - run with: python database.py
    import asyncio
    
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    
    async def test_database():
        """Test database operations"""
        print("🗄️  Depression Severity Database - Test Mode\n")
        print("=" * 70)
        
        # Initialize database
        print("\n1️⃣  Initializing database...")
        await init_db()
        print("✓ Database initialized")
        
        # Save some test analyses
        print("\n2️⃣  Saving test analyses...")
        test_data = [
            ("I feel great", "Minimal", 10.0, 95.0, False, ["Stay positive", "Keep exercising"]),
            ("I'm feeling down", "Mild", 35.0, 85.0, False, ["Try journaling", "Get sunlight"]),
            ("I can't take it anymore", "Severe", 95.0, 92.0, True, ["Call 988", "Go to ER"]),
        ]
        
        ids = []
        for text, severity, risk, confidence, suicidal, suggestions in test_data:
            analysis_id = await save_analysis(text, severity, risk, confidence, suicidal, suggestions)
            ids.append(analysis_id)
            print(f"  ✓ Saved analysis ID: {analysis_id}")
        
        # Fetch all analyses
        print("\n3️⃣  Fetching all analyses...")
        all_analyses = await get_all_analyses()
        print(f"  ✓ Retrieved {len(all_analyses)} analyses")
        for analysis in all_analyses:
            print(f"    - ID {analysis['id']}: {analysis['severity']} (Risk: {analysis['risk_score']})")
        
        # Fetch latest analysis
        print("\n4️⃣  Fetching latest analysis...")
        latest = await get_latest_analysis()
        if latest:
            print(f"  ✓ Latest: ID {latest['id']}, Severity: {latest['severity']}")
        
        # Get statistics
        print("\n5️⃣  Fetching statistics...")
        stats = await get_statistics()
        print(f"  ✓ Total analyses: {stats['total_analyses']}")
        print(f"  ✓ Severe: {stats['severe_count']}, Moderate: {stats['moderate_count']}")
        print(f"  ✓ Average risk score: {stats['avg_risk_score']}")
        
        print("\n" + "=" * 70)
        print("✓ All tests completed successfully!")
    
    # Run test
    asyncio.run(test_database())
