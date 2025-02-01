"use client";
import { useAuthStore } from "@/app/store";
import {
  problemDeleteProblemRoute,
  problemGetProblemRoute,
  ProblemPublic,
} from "@/client";
import { Markdown } from "@/components/Markdown";
import { apiConfig } from "@/config";
import { splitStream } from "@/util/stream";
import {
  ActionIcon,
  Badge,
  Button,
  Container,
  Grid,
  Group,
  Image,
  Loader,
  Popover,
  Skeleton,
  Space,
  Text,
  TextProps,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Moment from "react-moment";
import classes from "./style.module.css";
import { IconEdit, IconTrash } from "@tabler/icons-react";

export default function ViewProblemPage() {
  const { problemId } = useParams<{ problemId: string }>();
  const token = useAuthStore((state) => state.token);

  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState<ProblemPublic>();
  const [problemSolution, setProblemSolution] = useState("");
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const fetchProblem = async () => {
    setLoading(true);
    const { data, error } = await problemGetProblemRoute({
      path: {
        problem_id: problemId,
      },
      auth: () => token || "",
    });
    if (error) {
      setLoading(false);
      notifications.show({
        title: "获取题目失败",
        message: error.detail?.toString(),
        color: "red",
      });
      return;
    }
    setProblem(data!);
    setLoading(false);
  };

  const fetchProblemSolution = async () => {
    if (problemSolution) setProblemSolution("");
    const response = await fetch(
      `${apiConfig.baseUrl}/problem/${problemId}/solution`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status !== 200) {
      return;
    }

    const stream = response.body;

    if (!stream) {
      notifications.show({
        title: "错误",
        message: "无法获取题目解答",
        color: "red",
      });
      return;
    }

    for await (const data of splitStream(stream)) {
      setProblemSolution((prev) => prev + data);
    }
  };

  const deleteProblem = async () => {
    setDeleting(true);
    const { error } = await problemDeleteProblemRoute({
      auth: () => token || "",
      path: {
        problem_id: problemId,
      },
    });

    if (error) {
      notifications.show({
        title: "删除题目失败",
        message: JSON.stringify(error.detail),
        color: "red",
      });
      setDeleting(false);
      return;
    }

    notifications.show({
      title: "删除题目成功",
      message: "题目已被删除。",
      color: "green",
    });
    router.push("/problem");
    setDeleting(false);
  };

  useEffect(() => {
    if (!token || problemSolution || !loading) return;
    fetchProblem();
  }, [token]);

  useEffect(() => {
    if (loading || !problem) return;
    fetchProblemSolution();
  }, [loading]);

  const TextOrNull = ({
    children,
    c,
    ...props
  }: TextProps & { children: React.ReactNode }) => {
    if (!children) {
      return (
        <Text c="gray" {...props}>
          暂无信息
        </Text>
      );
    }
    return (
      <Text {...props} c={c}>
        {children}
      </Text>
    );
  };

  return (
    <Container>
      <Group justify="space-between">
        <Title>查看题目</Title>
        <Group gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            size="input-sm"
            component={Link}
            href={`/problem/${problemId}/edit`}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <Popover width={200} position="bottom" shadow="md">
            <Popover.Target>
              <ActionIcon variant="light" color="red" size="input-sm">
                <IconTrash size={16} />
              </ActionIcon>
            </Popover.Target>

            <Popover.Dropdown>
              <Text size="sm">确认删除题目? 操作不可逆。</Text>
              <Group gap="xs" mt="sm">
                <Button
                  color="red"
                  size="xs"
                  fullWidth
                  loading={deleting}
                  onClick={deleteProblem}
                >
                  确认删除
                </Button>
              </Group>
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Group>
      <Space h={60} />
      {loading ? (
        <Skeleton h={300} />
      ) : (
        <div>
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Image
                src={`${apiConfig.baseUrl}/static/${problem?.content}`}
                alt="题目图片"
                w="100%"
                fit="contain"
                className={classes.problemImage}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Group>
                <Badge size="lg" variant="filled">
                  {problem?.subject.name}
                </Badge>
                <Text c="gray">
                  <Moment format="YYYY年MM月DD日 hh:mm:ss">
                    {problem?.created_at}
                  </Moment>{" "}
                  {problem?.owner.name}
                </Text>
              </Group>
            </Grid.Col>
          </Grid>
          <Space h="lg" />
          <Title order={2} size="lg" mt="lg">
            题目分析{" "}
            <Badge size="md" variant="gradient" ml="xs">
              AI
            </Badge>
          </Title>
          <Space mt="md" />
          {problemSolution ? (
            <Markdown content={problemSolution} />
          ) : (
            <Loader size="sm" type="dots" />
          )}
          <Title order={2} size="lg" mt="lg">
            原始作答
          </Title>
          <TextOrNull mt="md">{problem?.original_answer}</TextOrNull>
          <Title order={2} size="lg" mt="lg">
            标准作答
          </Title>
          <TextOrNull mt="md">{problem?.correct_answer}</TextOrNull>
          <Title order={2} size="lg" my="md">
            知识点
          </Title>
          {problem!.tags.map((tag) => (
            <Badge
              variant="light"
              key={tag.id}
              mr="xs"
              component={Link}
              href={`/tag/${tag.id}`}
              style={{ cursor: "pointer" }}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}
    </Container>
  );
}
