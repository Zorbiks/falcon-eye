"""
API server — serves the pre-generated news.json at GET /api/news.
The file is written by the fetcher and served as a static response so the
server never blocks on feed I/O.
"""

import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

logger = logging.getLogger(__name__)

DATA_FILE = Path(__file__).parent / "data" / "news.json"

app = FastAPI(title="Middle East News API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/news")
async def get_news():
    """
    Return the latest aggregated news as JSON.
    The file is regenerated every 10 minutes by the background scheduler;
    this endpoint just streams it to the client without any processing.
    """
    if not DATA_FILE.exists():
        raise HTTPException(
            status_code=503,
            detail="News feed not yet available — fetcher may still be running.",
        )
    # FileResponse streams the file directly; no Python JSON parsing overhead.
    return FileResponse(
        path=DATA_FILE,
        media_type="application/json",
        filename=None,          # inline, not attachment
    )


@app.get("/api/health")
async def health():
    """Quick liveness + data-freshness check."""
    if not DATA_FILE.exists():
        return JSONResponse({"status": "no_data"}, status_code=503)
    import json, datetime
    payload = json.loads(DATA_FILE.read_text())
    return {
        "status":    "ok",
        "updatedAt": payload.get("updatedAt"),
        "count":     payload.get("count"),
    }


@app.get("/")
async def root():
    return {"message": "Middle East News API", "docs": "/docs", "news": "/api/news"}
