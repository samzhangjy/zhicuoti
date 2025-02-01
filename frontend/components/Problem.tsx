import { ProblemPublic } from "@/client";
import { apiConfig } from "@/config";
import { Badge, Button, Card, Group, Image, Stack, Text } from "@mantine/core";
import Link from "next/link";
import Moment from "react-moment";

export function Problem({ problem }: { problem: ProblemPublic }) {
  const truncate = (s: string) =>
    s.length > 50 ? s.substring(0, 50) + "..." : s;

  return (
    <Card withBorder padding="lg" key={problem.id}>
      <Card.Section>
        <Image
          src={`${apiConfig.baseUrl}/static/${problem.content}`}
          alt={problem.ocr_result.chosen_box?.detected_text}
          w="100%"
        />
      </Card.Section>

      <Stack justify="space-between" mt="md">
        <Group gap="sm" justify="space-between">
          <Badge variant="filled" size="lg">
            {problem.subject.name}
          </Badge>
          <Text c="gray" size="sm">
            <Moment format="YYYY/MM/DD">{problem.created_at}</Moment>
            {" "}{problem.owner.name}
          </Text>
        </Group>
        <Text fz="sm" fw={700}>
          {truncate(problem.ocr_result.chosen_box!.detected_text)}
        </Text>
      </Stack>
      <Card.Section px="md" mt="md">
        <Group gap={7} mt={5}>
          {problem.tags.map((tag) => (
            <Badge
              variant="light"
              key={tag.id}
              component={Link}
              href={`/tag/${tag.id}`}
              style={{ cursor: "pointer" }}
            >
              {tag.name}
            </Badge>
          ))}
          {problem.tags.length === 0 && (
            <Text c="gray" size="xs">
              暂无标签
            </Text>
          )}
        </Group>
      </Card.Section>
      <Group mt="lg">
        <Button
          radius="md"
          style={{ flex: 1 }}
          component={Link}
          href={`/problem/${problem.id}`}
          variant="filled"
        >
          查看题目
        </Button>
      </Group>
    </Card>
  );
}
