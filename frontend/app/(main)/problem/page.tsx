"use client";
import { useAuthStore } from "@/app/store";
import { problemGetMyProblemsRoute, ProblemPublic } from "@/client";
import { Problem } from "@/components/Problem";
import {
  Button,
  Center,
  Container,
  Group,
  Pagination,
  SimpleGrid,
  Skeleton,
  Space,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ViewProblemsPage() {
  const token = useAuthStore((state) => state.token);
  const [pages, setPages] = useState(0);
  const [problems, setProblems] = useState<ProblemPublic[]>();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProblems = async () => {
    const { data, error } = await problemGetMyProblemsRoute({
      auth: () => token || "",
      query: {
        page: currentPage || 1,
      },
    });
    if (error) {
      console.error(error);
      return;
    }
    setProblems(data.problems);
    setPages(data.total_pages);
    setLoading(false);
  };

  useEffect(() => {
    if (!token) return;
    fetchProblems();
  }, [token, currentPage]);

  return (
    <Container size="md">
      <Group justify="space-between">
        <Title>我的题目</Title>
        <Button variant="filled" component={Link} href="/problem/new">
          创建题目
        </Button>
      </Group>
      <Space h={80} />
      {loading ? (
        <Skeleton w="100%" h={300} />
      ) : (
        <>
          <SimpleGrid cols={{ md: 2, lg: 3 }} spacing="md">
            {problems!.map((problem) => (
              <Problem problem={problem} key={problem.id} />
            ))}
          </SimpleGrid>
          <Center mt="xl">
            <Pagination
              total={pages}
              value={currentPage}
              onChange={setCurrentPage}
            />
          </Center>
        </>
      )}
    </Container>
  );
}
