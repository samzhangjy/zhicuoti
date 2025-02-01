import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(prefix="/static", tags=["static"])


@router.get("/{filepath:path}", response_class=FileResponse)
def serve_static(filepath: str):
    """Serve static files."""
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="文件不存在")
    return filepath
