FROM python:3.11-slim

WORKDIR /app

# Install poetry
RUN pip install poetry

# Copy dependency files
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi

# Copy application code
COPY . .

# Default command (can be overridden)
CMD ["flask", "--app", "app:create_app()", "run", "--host", "0.0.0.0", "--port", "5000"]
