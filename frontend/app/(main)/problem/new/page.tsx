"use client";
import { useAuthStore } from "@/app/store";
import {
  OcrResultPublic,
  problemCreateProblemRoute,
  problemEditProblemRoute,
  problemOcrImageRoute,
  ProblemPublic,
  TagPublic,
} from "@/client";
import ProblemSelector from "@/components/ProblemSelector";
import { TagSelector } from "@/components/TagSelector";
import { apiConfig } from "@/config";
import {
  Container,
  Group,
  Space,
  Title,
  Text,
  Stepper,
  Image,
  Center,
  LoadingOverlay,
  Skeleton,
  Textarea,
  Button,
} from "@mantine/core";
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import React, { useRef, useEffect } from "react";

export default function CreateProblemPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [ocrResult, setOcrResult] = useState<OcrResultPublic>();
  const [selectedImage, setSelectedImage] = useState<FileWithPath>();
  const [problem, setProblem] = useState<ProblemPublic>();
  const router = useRouter();

  const form = useForm({
    initialValues: {
      originalAnswer: "",
      correctAnswer: "",
      tags: [] as string[],
    },
  });
  const nextStep = () =>
    setActive((current) => (current < 3 ? current + 1 : current));

  const handleReject = () => {
    notifications.show({
      title: "上传失败",
      message: `文件类型不正确，支持的文件类型为：${IMAGE_MIME_TYPE}`,
      color: "red",
    });
  };

  const handleDrop = async (files: FileWithPath[]) => {
    setSelectedImage(files[0]);
    setLoading(true);
    const { data, error } = await problemOcrImageRoute({
      body: {
        image: files[0],
      },
      auth: () => token || "",
    });
    if (error) {
      setLoading(false);
      notifications.show({
        title: "上传失败",
        message: error.detail?.toString(),
        color: "red",
      });
      return;
    }
    setOcrResult(data);
    setLoading(false);
    nextStep();
  };

  const handleProblemSelect = async (index: number) => {
    setLoading(true);
    const selectedBox = ocrResult!.boxes[index];
    const { data, error } = await problemCreateProblemRoute({
      body: {
        ocr_box_id: selectedBox.id,
        ocr_result_id: ocrResult!.id,
        original_answer: null,
        original_answer_type: null,
        correct_answer: null,
        correct_answer_type: null,
      },
      auth: () => token || "",
    });
    if (error) {
      setLoading(false);
      notifications.show({
        title: "创建失败",
        message: error.detail?.toString(),
        color: "red",
      });
      return;
    }
    nextStep();
    form.setFieldValue(
      "tags",
      data.tags.map((tag) => tag.name)
    );
    setProblem(data);
    setLoading(false);
  };

  const handleEditProblem = async ({
    originalAnswer,
    correctAnswer,
    tags,
  }: {
    originalAnswer: string;
    correctAnswer: string;
    tags: string[];
  }) => {
    setLoading(true);
    const { error } = await problemEditProblemRoute({
      body: {
        original_answer: originalAnswer,
        original_answer_type: "text",
        correct_answer: correctAnswer,
        correct_answer_type: "text",
        tags: tags,
      },
      auth: () => token || "",
      path: {
        problem_id: problem!.id,
      },
    });
    if (error) {
      setLoading(false);
      notifications.show({
        title: "创建失败",
        message: error.detail?.toString(),
        color: "red",
      });
      return;
    }
    notifications.show({
      title: "创建成功",
      message: "题目已成功创建",
      color: "green",
    });
    setLoading(false);
    router.push("/problem")
  };

  return (
    <Container>
      <Title>创建题目</Title>

      <Text c="gray" mt="md">
        请上传一张图片，智错题将会自动识别图片中的文字并生成相关标签
      </Text>
      <Space h={60} />
      <Stepper
        active={active}
        onStepClick={(step) => {
          if (step <= active) setActive(step);
        }}
      >
        <Stepper.Step label="上传图片" description="智错题将自动识别">
          <Dropzone
            onDrop={handleDrop}
            onReject={handleReject}
            accept={IMAGE_MIME_TYPE}
            maxFiles={1}
            loading={loading}
          >
            <Group
              justify="center"
              gap="xl"
              mih={220}
              style={{ pointerEvents: "none" }}
            >
              <Dropzone.Accept>
                <IconUpload
                  size={52}
                  color="var(--mantine-color-blue-6)"
                  stroke={1.5}
                />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX
                  size={52}
                  color="var(--mantine-color-red-6)"
                  stroke={1.5}
                />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconPhoto
                  size={52}
                  color="var(--mantine-color-dimmed)"
                  stroke={1.5}
                />
              </Dropzone.Idle>

              <div>
                <Text size="xl" inline>
                  拖动图片至此或点击上传
                </Text>
                <Text size="sm" c="dimmed" inline mt={7}>
                  智错题将会自动识别图片中的文字并生成相关标签
                </Text>
              </div>
            </Group>
          </Dropzone>
          {selectedImage && (
            <Image
              src={URL.createObjectURL(selectedImage as Blob)}
              onLoad={() =>
                URL.revokeObjectURL(URL.createObjectURL(selectedImage as Blob))
              }
              alt="上传的图片"
              mt="xl"
              radius="lg"
            />
          )}
        </Stepper.Step>
        <Stepper.Step label="选择题目" description="选择需要加入错题的单个题目">
          <Text mt="md">请选择需要加入错题的单个题目，点击题目即可选择。</Text>
          <Center mt="lg">
            {loading ? (
              <Skeleton w="100%" h={800} />
            ) : (
              <ProblemSelector
                imageUrl={`${apiConfig.baseUrl}/static/${ocrResult?.content}`}
                boxes={ocrResult?.boxes || []}
                onClick={handleProblemSelect}
              />
            )}
          </Center>
        </Stepper.Step>
        <Stepper.Step label="确认信息" description="智错题将自动生成题目信息">
          <form onSubmit={form.onSubmit(handleEditProblem)}>
            <Textarea
              label="原始答案"
              placeholder="可留空"
              {...form.getInputProps("originalAnswer")}
            />
            <Textarea
              label="正确答案"
              placeholder="可留空"
              mt="lg"
              {...form.getInputProps("correctAnswer")}
            />
            <TagSelector
              label="标签"
              mt="lg"
              subjectId={problem?.subject.id || ""}
              {...form.getInputProps("tags")}
            />
            <Button type="submit" w="100%" mt="lg">
              创建题目
            </Button>
          </form>
        </Stepper.Step>
        <Stepper.Completed>
          Completed, click back button to get to previous step
        </Stepper.Completed>
      </Stepper>
    </Container>
  );
}
