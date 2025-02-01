from fastapi import APIRouter, Request

router = APIRouter(prefix="/utils", tags=["utilities"])


@router.get("/endpoints/")
def list_endpoints(request: Request):
    """List all available endpoints."""
    url_list = [
        {"path": route.path, "name": route.name} for route in request.app.routes
    ]
    return url_list
