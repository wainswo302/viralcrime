FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# No CMD: Railway runs this as a triggered/cron job, not a long-lived server.
# Invoke explicitly, e.g. via Railway's "Run Command":
#   python monitor.py --slugs <slug> ...
