import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def list_users():
    mongodb_url = os.getenv("MONGODB_URL")
    db_name = os.getenv("MONGODB_DB_NAME")
    
    print(f"Connecting to {db_name}...")
    client = AsyncIOMotorClient(mongodb_url)
    db = client[db_name]
    
    users = await db.users.find().to_list(10)
    print(f"Found {len(users)} users.")
    for u in users:
        print(f"Email: {u.get('email')}, Role: {u.get('role')}, Verified: {u.get('is_verified')}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(list_users())
