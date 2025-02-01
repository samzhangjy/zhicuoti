"use client";
import { useAuthStore } from "@/app/store";
import { tagGetTagRoute, TagPublicWithRelations } from "@/client";
import { Markdown } from "@/components/Markdown";
import { Problem } from "@/components/Problem";
import { apiConfig } from "@/config";
import { splitStream } from "@/util/stream";
import {
  Accordion,
  Badge,
  Container,
  Group,
  SimpleGrid,
  Skeleton,
  Space,
  Title,
  Text,
  Loader,
  Center,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconChartBar } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import React from "react";
import { useEffect, useState } from "react";

export default function ViewTagPage() {
  const token = useAuthStore((state) => state.token);
  const [tag, setTag] = useState<TagPublicWithRelations>();
  const [loading, setLoading] = useState(true);
  const { tagId } = useParams<{ tagId: string }>();
  const [tagAnalysis, setTagAnalysis] = useState<string>("");

  const fetchProblems = async () => {
    const { data, error } = await tagGetTagRoute({
      auth: () => token || "",
      path: {
        tag_id: tagId,
      },
    });
    if (error) {
      console.error(error);
      return;
    }
    setTag(data);
    setLoading(false);
  };

  const fetchTagAnalysis = async () => {
    if (tagAnalysis) return;
    const response = await fetch(
      `${apiConfig.baseUrl}/analyze/me/tag/${tagId}/ai`,
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
        message: "无法获取标签",
        color: "red",
      });
      return;
    }

    for await (const data of splitStream(stream)) {
      setTagAnalysis((prev) => prev + data);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchProblems();
  }, [token]);

  return (
    <Container size="md">
      <Group justify="space-between">
        <Title>标签「{tag?.name}」</Title>
        <Badge size="lg">{tag?.subject.name}</Badge>
      </Group>
      <Space h={60} />
      <Accordion variant="separated" radius="md">
        <Accordion.Item value="analysis">
          <Accordion.Control
            icon={<IconChartBar size={16} />}
            onClick={() => fetchTagAnalysis()}
          >
            <Group gap={6}>
              <Text size="sm">知识点分析</Text>
              <Badge variant="gradient" size="sm">
                AI
              </Badge>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            {!tagAnalysis ? (
              <Center>
                <Loader type="dots" />
              </Center>
            ) : (
              <Markdown content={tagAnalysis} />
            )}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Space h="xl" />
      {loading ? (
        <Skeleton w="100%" h={300} />
      ) : (
        <>
          <SimpleGrid cols={{ md: 2, lg: 3 }} spacing="md">
            {tag?.problems!.map((problem) => (
              <Problem problem={problem} key={problem.id} />
            ))}
          </SimpleGrid>
        </>
      )}
    </Container>
  );
}
