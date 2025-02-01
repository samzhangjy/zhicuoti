"use client";
import { useAuthStore } from "@/app/store";
import {
  ProblemEdit,
  problemEditProblemRoute,
  problemGetProblemRoute,
  ProblemPublic,
} from "@/client";
import { TagSelector } from "@/components/TagSelector";
import { apiConfig } from "@/config";
import {
  Button,
  Container,
  Image,
  Skeleton,
  Space,
  Textarea,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProblemPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState<ProblemPublic>();
  const [editing, setEditing] = useState(false);
  const { problemId } = useParams<{ problemId: string }>();
  const router = useRouter();

  const form = useForm<ProblemEdit>({
    initialValues: {
      correct_answer_type: "text",
      original_answer_type: "text",
      correct_answer: "",
      original_answer: "",
      tags: [],
    },
  });

  const fetchProblem = async () => {
    const { data, error } = await problemGetProblemRoute({
      path: {
        problem_id: problemId,
      },
    });

    if (error) {
      notifications.show({
        title: "获取题目失败",
        message: error.detail?.toString(),
        color: "red",
      });
      setLoading(false);
      return;
    }

    setProblem(data);
    form.setValues({
      correct_answer: data.correct_answer ?? "",
      original_answer: data.original_answer ?? "",
      tags: data.tags.map((tag) => tag.name),
    });
    setLoading(false);
  };

  const handleSubmit = async (val: ProblemEdit) => {
    setEditing(true);
    const { error } = await problemEditProblemRoute({
      auth: () => token || "",
      path: {
        problem_id: problemId,
      },
      body: val,
    });

    if (error) {
      notifications.show({
        title: "编辑题目失败",
        message: error.detail?.toString(),
        color: "red",
      });
      setEditing(false);
      return;
    }
    setEditing(false);

    notifications.show({
      title: "编辑题目成功",
      message: "题目已编辑",
      color: "green",
    });
    router.push(`/problem/${problemId}`);
  };

  useEffect(() => {
    if (!token) return;
    fetchProblem();
  }, [token]);

  return (
    <Container>
      <Title>编辑题目</Title>
      <Space h={60} />
      {loading || !problem ? (
        <Skeleton h={300} />
      ) : (
        <>
          <Image
            src={`${apiConfig.baseUrl}/static/${problem.content}`}
            alt={problem.ocr_result.chosen_box?.detected_text}
            mb="lg"
            radius="md"
          />
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Textarea
              label="原始答案"
              placeholder="可留空"
              {...form.getInputProps("original_answer")}
            />
            <Textarea
              label="正确答案"
              placeholder="可留空"
              mt="lg"
              {...form.getInputProps("correct_answer")}
            />
            <TagSelector
              label="标签"
              mt="lg"
              subjectId={problem?.subject.id || ""}
              {...form.getInputProps("tags")}
            />
            <Button type="submit" w="100%" mt="lg" loading={editing}>
              修改题目
            </Button>
          </form>
        </>
      )}
    </Container>
  );
}
