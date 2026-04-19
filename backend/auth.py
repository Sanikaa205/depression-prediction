"""
User Authentication Module

Handles user registration, login, and MongoDB operations.
Uses plain-text password storage (no hashing).
"""

import logging
from typing import Dict, Optional
from dotenv import load_dotenv
import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError

logger = logging.getLogger(__name__)

# MongoDB client instance (global)
_mongo_client: Optional[AsyncIOMotorClient] = None
_auth_db: Optional[AsyncIOMotorDatabase] = None

# Load environment variables
load_dotenv()


async def init_auth_db(mongo_url: Optional[str] = None) -> None:
    """
    Initialize MongoDB connection for authentication.
    
    Args:
        mongo_url (Optional[str]): MongoDB connection string.
                                   If None, reads from MONGO_URL env var.
    
    Raises:
        ValueError: If MONGO_URL env var not set and mongo_url not provided.
        Exception: If MongoDB connection fails.
    """
    global _mongo_client, _auth_db
    
    # Get MongoDB URL from parameter or environment
    if mongo_url is None:
        mongo_url = os.getenv("MONGO_URL")
    
    if not mongo_url:
        raise ValueError("MONGO_URL environment variable not set")
    
    try:
        logger.info("📦 Initializing MongoDB for user authentication...")
        
        # Create async MongoDB client
        _mongo_client = AsyncIOMotorClient(mongo_url)
        
        # Test connection
        await _mongo_client.admin.command("ping")
        logger.info("✓ MongoDB connection successful")
        
        # Get database
        _auth_db = _mongo_client["depression_predictor"]
        
        # Create unique index on username
        users_collection = _auth_db["users"]
        await users_collection.create_index("username", unique=True)
        logger.info("✓ MongoDB initialized successfully")
        
    except Exception as e:
        logger.error(f"❌ MongoDB initialization failed: {str(e)}")
        raise


async def close_auth_db() -> None:
    """
    Close MongoDB connection.
    
    Called on application shutdown.
    """
    global _mongo_client
    
    if _mongo_client:
        _mongo_client.close()
        logger.info("✓ MongoDB connection closed")


async def get_user_by_username(username: str) -> Optional[Dict]:
    """
    Get user by username from database.
    
    Args:
        username (str): Username to search for
        
    Returns:
        Optional[Dict]: User document or None if not found
    """
    if _auth_db is None:
        raise RuntimeError("Auth DB not initialized")
    
    users_collection = _auth_db["users"]
    user = await users_collection.find_one({"username": username})
    return user


async def register_user(username: str, email: str, password: str) -> Dict:
    """
    Register a new user.
    
    Args:
        username (str): Unique username
        email (str): Email address
        password (str): Plain-text password (stored as-is, no hashing)
        
    Returns:
        Dict: User data without password {id, username, email}
        
    Raises:
        ValueError: If username already exists
        Exception: If database insert fails
    """
    global _auth_db
    
    if _auth_db is None:
        logger.error(f"Auth DB is None! _mongo_client: {_mongo_client}, _auth_db: {_auth_db}")
        raise RuntimeError("Auth DB not initialized")
    
    try:
        users_collection = _auth_db["users"]
        logger.debug(f"Got users collection: {users_collection}")
        
        # Create user document
        user_doc = {
            "username": username,
            "email": email,
            "password": password,  # Plain text, no hashing
        }
        
        logger.debug(f"Attempting to insert user: {username}")
        
        # Insert into database
        result = await users_collection.insert_one(user_doc)
        
        logger.info(f"✓ User registered: {username}")
        
        # Return user data without password
        return {
            "id": str(result.inserted_id),
            "username": username,
            "email": email,
        }
    
    except DuplicateKeyError as e:
        logger.error(f"Duplicate key error: {str(e)}")
        raise ValueError(f"Username '{username}' already exists")
    except Exception as e:
        logger.error(f"❌ Registration error: {type(e).__name__}: {str(e)}", exc_info=True)
        raise


async def login_user(username: str, password: str) -> Dict:
    """
    Authenticate a user.
    
    Args:
        username (str): Username
        password (str): Plain-text password
        
    Returns:
        Dict: User data without password {id, username, email}
        
    Raises:
        ValueError: If username not found or password incorrect
    """
    if _auth_db is None:
        raise RuntimeError("Auth DB not initialized")
    
    try:
        user = await get_user_by_username(username)
        
        if not user:
            raise ValueError(f"Username '{username}' not found")
        
        # Check password (plain text comparison)
        if user["password"] != password:
            raise ValueError("Invalid password")
        
        logger.info(f"✓ User logged in: {username}")
        
        # Return user data without password
        return {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
        }
    
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise
