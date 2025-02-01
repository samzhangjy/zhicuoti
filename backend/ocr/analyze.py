import os
import uuid

from paddlex import create_model, create_pipeline
from PIL import Image
from backend.ocr.preprocess import Preprocessor


class ProblemOCRAnalyzer:
    """Core OCR analyzer for detecting and recognizing problem descriptions."""

    TMP_DIR = "tmp"
    PROBLEM_TYPE_ONE_COLUMN = "one_column"
    PROBLEM_TYPE_TWO_COLUMN = "two_column"

    def __init__(
        self,
        problem_type_detector_path: str = "data/ocr/models/PP-LCNet_x1-problem-type/inference",
        one_column_detector_path: str = "data/ocr/models/PicoDet-L-problem-one_column/inference",
        two_column_detector_path: str = "data/ocr/models/PicoDet-L-problem-two_column/inference",
        ocr_pipeline_config: str = "data/ocr/models/OCR.yaml",
        remove_tmp: bool = False,
    ):
        """Initialize the analyzer.

        Args:
            problem_type_detector_path (str, optional):
                Pretrained, finetuned PaddleX model for problem recognization.
                Defaults to "data/ocr/models/PP-LCNet_x1-problem-type/inference".
            one_column_detector_path (str, optional):
                Pretrained, finetuned PaddleX model for **one-column** problem box detection.
                Defaults to "data/ocr/models/PicoDet-L-problem-one_column/inference".
            two_column_detector_path (str, optional):
                Pretrained, finetuned PaddleX model for **two-column** problem box detection.
                Defaults to "data/ocr/models/PicoDet-L-problem-two_column/inference".
            ocr_pipeline_config (str, optional):
                PaddleX pipeline configuration file for OCR.
                Defaults to "data/ocr/models/OCR.yaml".
            remove_tmp (bool, optional):
                Whether to remove temporary files after processing.
                Defaults to False.
        """
        self.one_column_detector = create_model(one_column_detector_path)
        self.two_column_detector = create_model(two_column_detector_path)
        self.problem_type_detector = create_model(problem_type_detector_path)
        self.ocr_pipeline = create_pipeline(pipeline=ocr_pipeline_config)
        self.preprocessor = Preprocessor()
        self.remove_tmp = remove_tmp

    def _remove_tmp(self, filepath: str):
        """Remove temporary files."""
        if not self.remove_tmp:
            return
        os.remove(filepath)

    def identify_type(self, image_path: str) -> str:
        """Identify the type of the image, either one-column or two-column.

        Args:
            image_path (str): Path to the image file.

        Returns:
            str: Type of the image.
        """
        output = self.problem_type_detector.predict(image_path, batch_size=1)
        result = next(output)
        if result["class_ids"][0] == 1:
            return self.PROBLEM_TYPE_TWO_COLUMN
        return self.PROBLEM_TYPE_ONE_COLUMN

    def predict_box(self, image_path: str):
        """Predict bounding boxes of problem descriptions.

        Args:
            image_path (str): Path to the image file.

        Returns:
            Generator: Generator of the prediction results.
        """
        problem_type = self.identify_type(image_path)
        detector = (
            self.two_column_detector
            if problem_type == self.PROBLEM_TYPE_TWO_COLUMN
            else self.one_column_detector
        )
        result = detector.predict(image_path, batch_size=1)
        return result

    def crop_image_and_save(
        self, input_img: str, output_img: str, cord: tuple[int, int, int, int]
    ) -> str:
        """Crop the image with the given coordinates and save it.

        Args:
            input_img (str): Path to the input image.
            output_img (str): Path to the output image.
            cord (tuple[int, int, int, int]): Coordinates of the box to crop.

        Returns:
            str: Path to the output image.
        """
        img = Image.open(input_img)
        img = img.crop(cord)
        img.save(output_img)
        return output_img

    def predict_text(self, image_path: str) -> str:
        """Predict the text in the image.

        Args:
            image_path (str): Path to the image file.

        Returns:
            str: Detected text in the image.
        """
        output = self.ocr_pipeline.predict(image_path)
        result = next(output).json
        detected = ""
        for text in result["rec_text"]:
            detected += text
        return detected

    def predict_problems(self, image_path: str) -> list:
        """Predict the problems in the image.

        This predictor will first detect the bounding boxes of the problem descriptions,
        then crop the image with the bounding boxes, and finally recognize the text in the cropped
        image.

        Due to the lack of finetuned model for the text recognition, the OCR model is not as
        accurate. However, when combining with `predictor.py`, the final prediction result will be
        less likely false-positive.

        Args:
            image_path (str): Path to the image file.

        Returns:
            list: Prediction result, in forms of `{"box": tuple[int, int, int, int], "text": str}`.
        """
        preprocessed = self.preprocessor.preprocess_image(
            image_path, os.path.join(self.TMP_DIR, f"preprocessed_{uuid.uuid4()}.jpg")
        )
        output = self.predict_box(preprocessed)
        result = next(output).json
        ret = []
        for box in result["boxes"]:
            output_path = self.crop_image_and_save(
                result["input_path"],
                os.path.join(self.TMP_DIR, f"cropped_{uuid.uuid4()}.jpg"),
                tuple(box["coordinate"]),
            )
            text = self.predict_text(output_path)
            # remove the cropped image
            self._remove_tmp(output_path)
            ret.append(
                {"box": tuple(box["coordinate"]), "text": text, "img": output_path}
            )
        self._remove_tmp(preprocessed)
        return ret, preprocessed


if __name__ == "__main__":
    analyzer = ProblemOCRAnalyzer()
    print(analyzer.identify_type("data/ocr/1.jpg"))
    print(analyzer.predict_problems("data/ocr/10.jpg"))
