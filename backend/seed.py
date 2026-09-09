import asyncio
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from app.database import async_session
from app.models.user import User, UserRole
from app.models.configuration import Configuration
from app.services.auth_service import hash_password
from sqlalchemy import select


async def seed():
    async with async_session() as session:
        # Check if admin already exists
        result = await session.execute(
            select(User).where(User.email == "admin@voxguard.com")
        )
        if result.scalar_one_or_none():
            print("Admin user already exists, skipping seed.")
            return

        admin = User(
            email="admin@voxguard.com",
            password_hash=hash_password("admin123"),
            full_name="VoxGuard Admin",
            role=UserRole.ADMIN,
            organization="VoxGuard",
        )
        session.add(admin)
        await session.flush()

        config = Configuration(user_id=admin.id)
        session.add(config)

        await session.commit()
        print(f"Admin user created: admin@voxguard.com / admin123")
        print(f"Default configuration created for admin user.")


if __name__ == "__main__":
    asyncio.run(seed())
