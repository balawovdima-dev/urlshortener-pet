FROM python:3.13-slim AS build

RUN apt-get update

RUN apt-get install -y --no-install-recommends \
	      build-essential gcc


WORKDIR /usr/app

RUN python -m venv /usr/app/venv

ENV PATH="/usr/app/venv/bin:$PATH"

COPY requirements.txt .

RUN pip install -r requirements.txt


FROM build AS test

COPY requirements-dev.txt .

RUN pip install -r requirements-dev.txt

COPY . .

CMD [ "pytest", "-q", "-p", "no:cacheprovider" ]


FROM python:3.13-slim@sha256:8d9d0b8bcf6506481eae4907c18f5e3e7902e629f5f6d684f9e7c32e85e3ddf0

RUN groupadd -g 999 python && \
    useradd -r -m -u 999 -g python python


RUN mkdir /usr/app && chown python:python /usr/app

WORKDIR /usr/app


COPY --chown=python:python --from=build /usr/app/venv ./venv

RUN rm -rf /usr/local/lib/python3.13/site-packages/pip* /usr/local/lib/python3.13/site-packages/setuptools*

COPY --chown=python:python . .


USER 999


ENV PATH="/usr/app/venv/bin:$PATH"

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/healthz', timeout=3)" || exit 1

# ASGI: gunicorn manages processes, uvicorn workers run the async app
CMD [ "gunicorn", "app.main:app", "-k", "uvicorn_worker.UvicornWorker", "--bind", "0.0.0.0:8000", "--workers", "2" ]
