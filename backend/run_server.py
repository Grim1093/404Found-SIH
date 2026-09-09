"""Development server runner with Windows event loop fix."""
import asyncio
import sys
import uvicorn

if __name__ == "__main__":
    # Fix for psycopg async mode on Windows
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    # Run the FastAPI app
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
