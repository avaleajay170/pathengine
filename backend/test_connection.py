import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

uri = os.getenv("MONGODB_URI")
db_name = os.getenv("MONGODB_DB_NAME")

async def test():
    client = AsyncIOMotorClient(uri)
    try:
        await client.admin.command("ping")
        print("✅ Connected to MongoDB Atlas successfully!")
        print(f"Using database: {db_name}")
    except Exception as e:
        print("❌ Connection failed:")
        print(e)
    finally:
        client.close()

asyncio.run(test())