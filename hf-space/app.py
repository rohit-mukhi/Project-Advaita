import os
import uuid
import shutil
import threading
import numpy as np
from pathlib import Path
from PIL import Image
from imwatermark import WatermarkEncoder, WatermarkDecoder
from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
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


def embed_watermark(image_path: Path, user_id: str) -> Path:
    img = Image.open(image_path).convert("RGB")
    img_array = np.array(img)

    # Encode up to 32 bytes — truncate/pad user_id to fit
    payload = user_id[:32].ljust(32).encode("utf-8")

    encoder = WatermarkEncoder()
    encoder.set_watermark("bytes", payload)
    watermarked = encoder.encode(img_array, "dwtDct")

    out_path = image_path.parent / f"{image_path.stem}_wm.png"
    Image.fromarray(watermarked).save(out_path, "PNG")
    return out_path


@app.post("/extract")
async def extract(file: UploadFile):
    """Extract watermark from a suspect image to identify the source user."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    job_id = str(uuid.uuid4())
    job_dir = UPLOAD_DIR / job_id
    job_dir.mkdir()
    input_path = job_dir / "suspect.png"

    try:
        with open(input_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        img = Image.open(input_path).convert("RGB")
        img_array = np.array(img)

        decoder = WatermarkDecoder("bytes", 32)
        payload = decoder.decode(img_array, "dwtDct")
        user_id = payload.decode("utf-8", errors="ignore").strip()

        return JSONResponse({"user_id": user_id})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        threading.Timer(60, lambda: shutil.rmtree(job_dir, ignore_errors=True)).start()


@app.post("/cloak")
async def cloak(file: UploadFile, user_id: str = Form(default="unknown")):
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

        # Embed user_id as invisible watermark after Fawkes cloaking
        watermarked_path = embed_watermark(cloaked_files[0], user_id)

        return FileResponse(
            path=str(watermarked_path),
            media_type="image/png",
            filename="cloaked.png",
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        threading.Timer(60, lambda: shutil.rmtree(job_dir, ignore_errors=True)).start()
