import { useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useRef, useEffect, useState } from "react";

const ProblemSelector = ({
  imageUrl,
  boxes,
  onClick,
}: {
  imageUrl: string;
  boxes: { x1: number; y1: number; x2: number; y2: number }[];
  onClick: (index: number) => unknown;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [ratioBoxes, setRatioBoxes] = useState<
    {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }[]
  >([]);

  const SCALE = 3;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    const image = new Image();

    image.onload = () => {
      const ratio = image.width / image.height;
      const originalWidth = isMobile ? 300 : 700;
      canvas.style.width = originalWidth + "px";
      canvas.style.height = originalWidth / ratio + "px";
      canvas.width = originalWidth * SCALE;
      canvas.height = (originalWidth / ratio) * SCALE;

      let newWidth = canvas.width;
      let newHeight = newWidth / ratio;
      if (newHeight > canvas.height) {
        newHeight = canvas.height;
        newWidth = newHeight * ratio;
      }
      context.drawImage(image, 0, 0, newWidth, newHeight);

      const resizeRatio = image.width / originalWidth;

      setRatioBoxes(
        boxes.map((box) => ({
          x1: box.x1 / resizeRatio,
          y1: box.y1 / resizeRatio,
          x2: box.x2 / resizeRatio,
          y2: box.y2 / resizeRatio,
        }))
      );
    };

    image.src = imageUrl;
  }, [imageUrl, boxes, isMobile]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    ratioBoxes.forEach((ratioBox) => {
      context.beginPath();

      context.roundRect(
        ratioBox.x1 * SCALE,
        ratioBox.y1 * SCALE,
        (ratioBox.x2 - ratioBox.x1) * SCALE,
        (ratioBox.y2 - ratioBox.y1) * SCALE,
        6 * SCALE
      );
      context.lineWidth = 2;
      context.strokeStyle = theme.colors[theme.primaryColor][6];
      context.stroke();
    });
  }, [imageUrl, boxes, ratioBoxes]);

  const handleCanvasClick = (event: { clientX: number; clientY: number; }) => {
    const canvas = canvasRef.current;
    const rect = canvas!.getBoundingClientRect();
    const x = (event.clientX - rect.left) / 1;
    const y = (event.clientY - rect.top) / 1;

    ratioBoxes.forEach((box, index) => {
      if (x >= box.x1 && x <= box.x2 && y >= box.y1 && y <= box.y2) {
        onClick(index);
      }
    });
  };

  return (
    <canvas ref={canvasRef} onClick={handleCanvasClick} width="300px"></canvas>
  );
};

export default ProblemSelector;
