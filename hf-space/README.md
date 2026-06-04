---
title: Fawkes Face Cloaking API
emoji: 🛡️
colorFrom: purple
colorTo: indigo
sdk: docker
pinned: false
---

# Fawkes Face Cloaking API

FastAPI wrapper around [Fawkes](https://sandlab.cs.uchicago.edu/fawkes/) for Sueno app.

## Endpoints

- `GET /ping` — health check / wake-up
- `POST /cloak` — accepts `multipart/form-data` with `file` field, returns cloaked PNG

## Protection Level
Runs at `--mode high` — strongest ArcFace embedding attack.
