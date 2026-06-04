import os
import uuid
import shutil
import threading
from pathlib import Path
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("/tmp/fawkes")
UPLOAD_DIR.mkdir(exist_ok=True)


@app.get("/ping")
def ping():
    return {"status": "ok"}


@app.post("/cloak")
async def cloak(file: UploadFile):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    job_id = str(uuid.uuid4())
    job_dir = UPLOAD_DIR / job_id
    job_dir.mkdir()

    ext = Path(file.filename or "image.jpg").suffix or ".jpg"
    input_path = job_dir / f"input{ext}"

    try:
        with open(input_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # --mode mid: balanced ArcFace embedding attack (~1-2 min on CPU Basic)
        # --no-align: skip dlib alignment (faster, still effective)
        exit_code = os.system(
            f"python -m fawkes.protection "
            f"--directory {job_dir} "
            f"--mode mid "
            f"--no-align"
        )

        if exit_code != 0:
            raise HTTPException(status_code=500, detail="Fawkes process failed")

        # Fawkes names output as originalname_cloaked.ext
        cloaked_files = list(job_dir.glob("*_cloaked*"))
        if not cloaked_files:
            raise HTTPException(
                status_code=422,
                detail="No face detected in image — cloaking skipped"
            )

        return FileResponse(
            path=str(cloaked_files[0]),
            media_type="image/png",
            filename="cloaked.png",
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        threading.Timer(60, lambda: shutil.rmtree(job_dir, ignore_errors=True)).start()
