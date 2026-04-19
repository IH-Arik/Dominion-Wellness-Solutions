import asyncio
import sys
import os

# Add root directory to path
sys.path.append(os.getcwd())

from app.db.mongodb import init_db
from app.models.user import User
from app.core.security import get_password_hash

async def create_superadmin():
    await init_db()
    existing = await User.find_one({"email": "superadmin@dominion.ai"})
    if existing:
        print("Superadmin already exists")
        return
    
    user = User(
        email="superadmin@dominion.ai",
        hashed_password=get_password_hash("Admin@123"),
        name="System Admin",
        role="superadmin",
        is_active=True,
        is_verified=True,
        onboarding_completed=True
    )
    await user.insert()
    print("Superadmin created successfully!")

if __name__ == "__main__":
    asyncio.run(create_superadmin())
