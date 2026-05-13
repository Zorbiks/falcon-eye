"""
Scheduler — runs the RSS fetcher once immediately, then every 10 minutes.
Starts the FastAPI server in the same process via uvicorn.

Usage:
    python main.py
"""

import logging
import threading
import time

import uvicorn

from fetcher import run_once
from server import app

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

INTERVAL_SECONDS = 10 * 60   # 10 minutes


def scheduler_loop() -> None:
    """Run the fetcher immediately, then on a fixed interval."""
    while True:
        try:
            run_once()
        except Exception:
            logger.exception("Unhandled error in fetcher — will retry next cycle")
        logger.info("Next fetch in %d minutes.", INTERVAL_SECONDS // 60)
        time.sleep(INTERVAL_SECONDS)


if __name__ == "__main__":
    # Start the scheduler in a daemon thread so it dies with the main process.
    t = threading.Thread(target=scheduler_loop, name="rss-scheduler", daemon=True)
    t.start()

    # Start the API server (blocks until Ctrl-C).
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8081,
        log_level="info",
    )
