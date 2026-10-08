# Read by gunicorn at start (--config in the Dockerfile).
import os
import shutil

from prometheus_client import multiprocess

# Access log on stdout: every request (status, path, latency) reaches Loki.
accesslog = "-"


def on_starting(server):
    # Each worker keeps its metrics in files here and /metrics merges them, so a
    # scrape sees all workers, not whichever one answered. Start from empty:
    # stale files from a previous run would be counted again.
    path = os.environ.get("PROMETHEUS_MULTIPROC_DIR")
    if path:
        shutil.rmtree(path, ignore_errors=True)
        os.makedirs(path)


def child_exit(server, worker):
    # Drop a dead worker's live gauges; its counters stay in the totals.
    if os.environ.get("PROMETHEUS_MULTIPROC_DIR"):
        multiprocess.mark_process_dead(worker.pid)
