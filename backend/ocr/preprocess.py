import cv2
import numpy as np
import paddle
import paddleclas
from paddlex import create_model

# IMPORTANT: Disable future flag to avoid conflicts with PaddleClas
paddle.set_flags({"FLAGS_enable_pir_api": False})


class Preprocessor:
    """Preprocessor for correcting the orientation and geometric distortion of problem images."""

    def __init__(self):
        # not using create_model here because model in paddlex provides low accuracy
        self.document_orientation_model = paddleclas.PaddleClas(
            model_name="text_image_orientation"
        )
        self.document_correction_model = create_model("UVDoc")

    def _rotate_image(self, image: np.ndarray, angle: int) -> np.ndarray:
        """Rotate the image by the given angle.

        Args:
            image (np.ndarray): Loaded image.
            angle (int): Angle to rotate the image.

        Returns:
            np.ndarray: Rotated image.
        """
        image_center = tuple(np.array(image.shape[1::-1]) / 2)
        rot_mat = cv2.getRotationMatrix2D(image_center, angle, 1.0)
        result = cv2.warpAffine(
            image, rot_mat, image.shape[1::-1], flags=cv2.INTER_LINEAR
        )
        return result

    def correct_orientation(self, image_path: str, output_path: str) -> str:
        """Correct the orientation of the image.

        Args:
            image_path (str): Path to the input image.
            output_path (str): Path to the output image.

        Returns:
            str: Path to the output image.
        """
        output = self.document_orientation_model.predict(image_path)
        result = next(output)
        angle = int(result[0]["label_names"][0])
        rotated = self._rotate_image(cv2.imread(image_path), angle)
        cv2.imwrite(output_path, rotated)
        return output_path

    def correct_geometric(self, image_path: str, output_path: str) -> str:
        """Correct the geometric distortion of the image.

        Args:
            image_path (str): Path to the input image.
            output_path (str): Path to the output image.

        Returns:
            str: Path to the output image.
        """
        output = self.document_correction_model.predict(image_path, batch_size=1)
        result = next(output)
        result.save_to_img(output_path)
        return output_path

    def preprocess_image(self, image_path: str, output_path: str) -> str:
        """Preprocess the image by correcting the orientation and geometric distortion.

        Args:
            image_path (str): Path to the input image.
            output_path (str): Path to the output image.

        Returns:
            str: Path to the output image.
        """
        corrected_orientation = self.correct_orientation(image_path, output_path)
        corrected_geometric = self.correct_geometric(corrected_orientation, output_path)
        return corrected_geometric


if __name__ == "__main__":
    preprocessor = Preprocessor()
    preprocessor.correct_orientation("data/ocr/1.jpg", "output/2.jpg")
    preprocessor.correct_geometric("output/2.jpg", "output/2.jpg")
