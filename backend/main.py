from contextlib import asynccontextmanager

import joblib
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from openai import OpenAI

from backend.api import api_router
from backend.classifier import ProblemClassifier
from backend.config import settings
from backend.errors import ForbiddenError, InvalidPayloadError, PredictionError
from backend.ocr import ProblemOCRAnalyzer
from backend.predictor import ProblemPredictor  # noqa


def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


@asynccontextmanager
async def lifespan(current_app: FastAPI):
    current_app.state.ocr_model = ProblemOCRAnalyzer()
    current_app.state.predictor_models = {
        "英语": joblib.load("./data/pre-trained/ZCT-Predictor-ENG.pkl"),
        "数学": joblib.load("./data/pre-trained/ZCT-Predictor-MATH.pkl"),
        "政治": joblib.load("./data/pre-trained/ZCT-Predictor-ZHENGZHI.pkl"),
        "生物": joblib.load("./data/pre-trained/ZCT-Predictor-BIOLOGY.pkl"),
    }
    current_app.state.classifier_model = joblib.load(
        "./data/pre-trained/ZCT-Classifier.pkl"
    )
    current_app.state.openai_client = OpenAI(
        api_key=settings.OPENAI_API_KEY, base_url=settings.OPENAI_API_URL
    )
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
    lifespan=lifespan,
)


@app.exception_handler(InvalidPayloadError)
async def invalid_payload_error_handler(_request: Request, exc: InvalidPayloadError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.message, "type": "InvalidPayloadError"},
    )


@app.exception_handler(PredictionError)
async def prediction_error_handler(_request: Request, exc: PredictionError):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": exc.message, "type": "PredictionError"},
    )


@app.exception_handler(ForbiddenError)
async def forbidden_error_handler(_request: Request, exc: ForbiddenError):
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"detail": exc.message, "type": "ForbiddenError"},
    )


app.include_router(api_router, prefix=settings.API_V1_STR)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
