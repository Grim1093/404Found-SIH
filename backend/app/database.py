"""Database connection and session management."""
import ssl
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.config import settings


def _get_connect_args() -> dict:
    """Build connection arguments with SSL support for Aiven PostgreSQL.
    
    psycopg3 uses 'sslmode' string parameter instead of an ssl.SSLContext object.
    """
    if settings.DATABASE_SSL:
        return {"sslmode": "require"}
    return {}


engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    connect_args=_get_connect_args(),
)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncSession:
    """Dependency that provides an async database session."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
