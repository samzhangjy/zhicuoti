from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute

from app.api import api_router
from app.config import settings
from app.errors import InvalidPayloadError


def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)


@app.exception_handler(InvalidPayloadError)
async def invalid_payload_error_handler(_request: Request, exc: InvalidPayloadError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.message, "type": "InvalidPayloadError"},
    )


app.include_router(api_router, prefix=settings.API_V1_STR)
