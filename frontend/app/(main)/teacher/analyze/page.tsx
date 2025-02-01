import { Anchor, Container, Space, Text, Title } from "@mantine/core";
import Link from "next/link";

export default function ViewAnalyzePage() {
  return (
    <Container>
      <Title>学情分析</Title>
      <Space h={60} />
      <Text>
        请前往{" "}
        <Anchor component={Link} href="/teacher/class">
          班级管理
        </Anchor>{" "}
        选择班级查看。
      </Text>
    </Container>
  );
}
