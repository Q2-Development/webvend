FROM python:3-slim

WORKDIR /backend

# Install curl for in-container testing
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

COPY ./ /backend

RUN pip install --no-cache-dir --upgrade -r ./app/requirements.txt

CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]