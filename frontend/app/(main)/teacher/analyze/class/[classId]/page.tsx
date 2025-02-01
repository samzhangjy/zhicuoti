"use client";
import { useAuthStore } from "@/app/store";
import {
  AnalyzeGetClassOverviewRouteResponse,
  AnalyzeGetPerSubjectOverviewRouteResponse,
  ClassPublic,
  ProblemPublic,
  SubjectPublic,
  TagPublic,
  analyzeGetClassOverviewRoute,
  analyzeGetLatestProblemsRoute,
  analyzeGetPerSubjectOverviewRoute,
  analyzeGetTagProblemsRoute,
  authGetMe,
  classGetClassRoute,
  subjectGetSubject,
} from "@/client";
import { Markdown } from "@/components/Markdown";
import { Problem } from "@/components/Problem";
import { apiConfig, siteConfig } from "@/config";
import { getRandomColorWithSeed } from "@/util/color";
import { splitStream } from "@/util/stream";
import { AreaChart, BarChart, DonutChart, LineChart } from "@mantine/charts";
import {
  Accordion,
  Badge,
  Box,
  Center,
  Container,
  Group,
  Loader,
  Pagination,
  Select,
  SimpleGrid,
  Skeleton,
  Space,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCategory2, IconChartBar } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import classes from "./style.module.css";

export default function ClassAnalyzeOverviewPage() {
  const { classId } = useParams<{ classId: string }>();
  const token = useAuthStore((state) => state.token);

  const [loading, setLoading] = useState(true);
  const [loadingAnalyze, setLoadingAnalyze] = useState(true);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [loadingMyAnalysis, setLoadingMyAnalysis] = useState(true);
  const [cls, setCls] = useState<ClassPublic>();
  const [problems, setProblems] = useState<ProblemPublic[]>([]);
  const [analysis, setAnalysis] =
    useState<AnalyzeGetClassOverviewRouteResponse>();
  const [mySubjectAnalysis, setMySubjectAnalysis] =
    useState<AnalyzeGetPerSubjectOverviewRouteResponse>();
  const [mySubject, setMySubject] = useState<SubjectPublic>();
  const [aiMySubjectAnalysis, setAIMySubjectAnalysis] = useState<string>();
  const [mySubjectTagSelected, setMySubjectTagSelected] = useState<string>();
  const [mySubjectTagProblems, setMySubjectTagProblems] = useState<
    ProblemPublic[]
  >([]);
  const [mySubjectTagProblemPages, setMySubjectTagProblemPages] = useState(0);
  const [mySubjectTagProblemCurrPage, setMySubjectTagProblemCurrPage] =
    useState(0);
  const [tags, setTags] = useState<TagPublic[]>([]);
  const [mySubjectTagAIAnalysis, setMySubjectTagAIAnalysis] = useState<
    Record<string, string>
  >({});
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const fetchClass = async () => {
    setLoading(true);
    const { data, error } = await classGetClassRoute({
      auth: () => token || "",
      path: {
        class_id: classId,
      },
    });

    if (error) {
      notifications.show({
        title: "获取班级失败",
        message: JSON.stringify(error.detail),
        color: "red",
      });
      setLoading(false);
      return;
    }
    setCls(data);
    setLoading(false);
  };

  const fetchProblems = async () => {
    setLoadingProblems(true);
    const { data, error } = await analyzeGetLatestProblemsRoute({
      auth: () => token || "",
      path: {
        class_id: classId,
      },
    });

    if (error) {
      notifications.show({
        title: "获取题目失败",
        message: JSON.stringify(error.detail),
        color: "red",
      });
      setLoadingProblems(false);
      return;
    }

    setProblems(data);
    setLoadingProblems(false);
  };

  const fetchAnalysis = async () => {
    setLoadingAnalyze(true);
    const { data, error } = await analyzeGetClassOverviewRoute({
      auth: () => token || "",
      path: {
        class_id: classId,
      },
    });

    if (error) {
      notifications.show({
        title: "获取分析失败",
        message: JSON.stringify(error.detail),
        color: "red",
      });
      setLoadingAnalyze(false);
      return;
    }

    setAnalysis(data);
    setLoadingAnalyze(false);
  };

  const fetchMySubjectAnalysis = async () => {
    setLoadingMyAnalysis(true);
    const { data: me, error: errorMe } = await authGetMe({
      auth: () => token || "",
    });
    if (errorMe) {
      notifications.show({
        title: "获取用户信息失败",
        message: JSON.stringify(errorMe),
        color: "red",
      });
      return;
    }

    setMySubject(me!.subject! as SubjectPublic);

    const { data, error } = await analyzeGetPerSubjectOverviewRoute({
      auth: () => token || "",
      path: {
        class_id: classId,
        subject_id: me!.subject!.id!,
      },
    });

    if (error) {
      notifications.show({
        title: "获取分析失败",
        message: JSON.stringify(error.detail),
        color: "red",
      });
      setLoadingMyAnalysis(false);
      return;
    }

    setMySubjectAnalysis(data);
    setLoadingMyAnalysis(false);
  };

  const fetchMySubjectAIAnalysis = async () => {
    if (aiMySubjectAnalysis) return;
    const response = await fetch(
      `${apiConfig.baseUrl}/analyze/${cls!.id}/subject/${mySubject!.id}/ai`,
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
        message: "无法获取科目分析",
        color: "red",
      });
      return;
    }

    for await (const data of splitStream(stream)) {
      setAIMySubjectAnalysis((prev) => (!prev ? data : prev + data));
    }
  };

  const fetchTags = async () => {
    const { data, error } = await subjectGetSubject({
      auth: () => token || "",
      path: {
        subject_id: mySubject!.id,
      },
    });

    if (error) {
      notifications.show({
        title: "获取知识点失败",
        message: JSON.stringify(error.detail),
        color: "red",
      });
      setLoadingMyAnalysis(false);
      return;
    }

    setTags(data.tags as unknown as TagPublic[]);
  };

  const handleMySubjectTagChange = async (tagId: string | null) => {
    if (!tagId) return;
    setMySubjectTagSelected(tagId);
    const { data, error } = await analyzeGetTagProblemsRoute({
      auth: () => token || "",
      path: {
        tag_id: tagId,
        class_id: classId,
      },
    });

    if (error) {
      notifications.show({
        title: "获取知识点题目失败",
        message: JSON.stringify(error.detail),
        color: "red",
      });
      return;
    }

    setMySubjectTagProblems(data.problems);
    setMySubjectTagProblemPages(data.total_pages);
    setMySubjectTagProblemCurrPage(1);
    fetchMySubjectTagAIAnalysis(tagId);
  };

  const fetchMySubjectTagAIAnalysis = async (tagId: string) => {
    if (mySubjectTagAIAnalysis[tagId]) return;
    const response = await fetch(
      `${apiConfig.baseUrl}/analyze/${cls!.id}/tag/${tagId}/ai`,
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
        message: "无法获取标签分析",
        color: "red",
      });
      return;
    }

    for await (const data of splitStream(stream)) {
      setMySubjectTagAIAnalysis((prev) => ({
        ...prev,
        [tagId]: !prev[tagId] ? data : prev[tagId] + data,
      }));
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchClass();
  }, [token]);

  useEffect(() => {
    if (!cls) return;
    fetchAnalysis();
    fetchProblems();
    fetchMySubjectAnalysis();
  }, [cls]);

  useEffect(() => {
    if (!mySubject) return;
    fetchTags();
  }, [mySubject]);

  return (
    <Container>
      <Title>班级 「{cls?.name}」 分析</Title>
      <Space h={60} />
      {loading ? (
        <Skeleton h={300} />
      ) : (
        <>
          <Title order={2}>综合分析</Title>
          <Space h="xl" />
          {loadingAnalyze || !analysis ? (
            <Skeleton h={300} />
          ) : (
            <>
              <Group justify="space-between" gap="xl">
                <div className={classes.ringContainer}>
                  <DonutChart
                    data={Object.keys(analysis.subjects_cnt).map((subject) => ({
                      value: analysis.subjects_cnt[subject],
                      color:
                        siteConfig.analyze.subjectColors[
                          subject as keyof typeof siteConfig.analyze.subjectColors
                        ] ?? "gray",
                      name: subject,
                    }))}
                    chartLabel="学科分布"
                    classNames={{ label: classes.ringLabel }}
                    strokeWidth={6}
                  />
                </div>
                <div>
                  <Text fw={600} size="lg">
                    7 天内错题总量：
                  </Text>
                  <Space h="xl" />
                  <LineChart
                    h={150}
                    w={!isMobile ? 600 : 300}
                    data={Object.keys(analysis.date_cnt)
                      .sort()
                      .map((date) => ({
                        date,
                        总数: analysis.date_cnt[date],
                      }))}
                    dataKey="date"
                    series={[{ name: "总数", color: "indigo.6" }]}
                    curveType="monotone"
                  />
                </div>
              </Group>
            </>
          )}
          <Space h={60} />
          <Title order={2}>我的学科</Title>
          <Space h="xl" />

          {loadingMyAnalysis || !mySubject || !mySubjectAnalysis ? (
            <Skeleton h={300} />
          ) : (
            <Box p="xl" className={classes.card}>
              <div className={classes.inner}>
                <div>
                  <Text fz="xl" className={classes.label}>
                    {mySubject.name}
                  </Text>
                  <div>
                    <Text className={classes.lead} mt={30}>
                      {mySubjectAnalysis.problems_cnt}
                    </Text>
                    <Text fz="xs" c="dimmed">
                      题
                    </Text>
                  </div>
                  <Space h={50} />
                  <LineChart
                    h={100}
                    w={!isMobile ? 600 : 300}
                    data={Object.keys(mySubjectAnalysis.date_cnt)
                      .sort()
                      .map((date) => ({
                        date,
                        [mySubject.name]: mySubjectAnalysis.date_cnt[date],
                      }))}
                    dataKey="date"
                    series={[
                      {
                        name: mySubject.name,
                        color:
                          siteConfig.analyze.subjectColors[
                            mySubject.name as keyof typeof siteConfig.analyze.subjectColors
                          ] ?? "gray",
                      },
                    ]}
                    curveType="monotone"
                  />
                </div>

                <div className={classes.ring}>
                  <DonutChart
                    data={Object.keys(mySubjectAnalysis.tags_cnt).map(
                      (tag) => ({
                        value: mySubjectAnalysis.tags_cnt[tag].cnt,
                        color: getRandomColorWithSeed(tag),
                        name: tag,
                      })
                    )}
                    chartLabel={
                      mySubjectAnalysis.problems_cnt ? "知识点" : "暂无数据"
                    }
                    size={160}
                    thickness={20}
                    tooltipProps={{
                      allowEscapeViewBox: { x: true, y: true },
                    }}
                    classNames={{
                      label:
                        mySubjectAnalysis.problems_cnt === 0
                          ? classes.subjectRingLabelNoData
                          : undefined,
                    }}
                  />
                </div>
              </div>

              <Space h="xl" />
              <Accordion variant="separated" radius="md" multiple>
                <Accordion.Item value="analysis">
                  <Accordion.Control
                    icon={<IconChartBar size={16} />}
                    onClick={() => fetchMySubjectAIAnalysis()}
                  >
                    <Group gap={6}>
                      <Text size="sm">详细分析</Text>
                      <Badge variant="gradient" size="sm">
                        AI
                      </Badge>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <AreaChart
                      h={200}
                      w="100%"
                      data={Object.keys(mySubjectAnalysis.date_cnt)
                        .sort()
                        .map((date) => {
                          const ret: Record<string, string | number> = {
                            date,
                          };
                          Object.keys(mySubjectAnalysis.tags_cnt).forEach(
                            (tag) => {
                              const curr = mySubjectAnalysis.tags_cnt[tag];
                              ret[tag] = curr.date[date];
                            }
                          );
                          return ret;
                        })}
                      dataKey="date"
                      series={Object.keys(mySubjectAnalysis.tags_cnt).map(
                        (tag) => ({
                          name: tag,
                          color: getRandomColorWithSeed(tag),
                        })
                      )}
                      curveType="monotone"
                      withLegend
                      legendProps={{
                        verticalAlign: "bottom",
                        height: 50,
                      }}
                    />
                    <Space
                      h={
                        (Object.keys(mySubjectAnalysis.tags_cnt).length / 8) *
                        30
                      }
                    />
                    <Space h={40} />
                    {!aiMySubjectAnalysis ? (
                      <Center>
                        <Loader type="dots" />
                      </Center>
                    ) : (
                      <>
                        <Markdown content={aiMySubjectAnalysis} />
                        <Space h="md" />
                        <Text size="sm" c="gray">
                          内容由 AI 生成，仅供参考
                        </Text>
                      </>
                    )}
                  </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="tags">
                  <Accordion.Control icon={<IconCategory2 size={16} />}>
                    <Group gap={6}>
                      <Text size="sm">知识点分析</Text>
                      <Badge variant="gradient" size="sm">
                        AI
                      </Badge>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Select
                      value={mySubjectTagSelected}
                      onChange={handleMySubjectTagChange}
                      data={tags.map((tag) => ({
                        label: tag.name,
                        value: tag.id,
                      }))}
                      placeholder="请选择知识点"
                    />
                    <Space h="lg" />
                    <BarChart
                      h={200}
                      w="100%"
                      data={Object.keys(mySubjectAnalysis.tags_cnt).map((tag) => {
                        let cnt = 0;
                        Object.keys(mySubjectAnalysis.date_cnt).forEach((date) => {
                          cnt += mySubjectAnalysis.tags_cnt[tag].date[date];
                        });
                        return {
                          tag,
                          cnt,
                        };
                      })}
                      dataKey="tag"
                      series={[{name: "cnt", color: "indigo.6", label: "题数"}]}
                      getBarColor={(value) => {
                        let total = 0;
                        Object.keys(mySubjectAnalysis.tags_cnt).forEach((tag) => {
                          total += mySubjectAnalysis.tags_cnt[tag].cnt;
                        });
                        return value / total >= 0.3 ? "red.6" : "teal.6";
                      }}
                    />
                    <Space h="lg" />
                    {mySubjectTagSelected ? (
                      !mySubjectTagAIAnalysis[mySubjectTagSelected] ? (
                        <Center>
                          <Loader type="dots" />
                        </Center>
                      ) : (
                        <>
                          <Markdown
                            content={
                              mySubjectTagAIAnalysis[mySubjectTagSelected]
                            }
                          />
                          <Space h="md" />
                          <Text size="sm" c="gray">
                            内容由 AI 生成，仅供参考
                          </Text>
                        </>
                      )
                    ) : null}
                    <Space h="lg" />
                    <SimpleGrid cols={{ md: 2, lg: 3 }}>
                      {mySubjectTagProblems.map((problem) => (
                        <Problem key={problem.id} problem={problem} />
                      ))}
                    </SimpleGrid>
                    <Space h="lg" />
                    <Center>
                      <Pagination
                        total={mySubjectTagProblemPages}
                        value={mySubjectTagProblemCurrPage}
                        onChange={setMySubjectTagProblemCurrPage}
                      />
                    </Center>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Box>
          )}
          <Space h={60} />
          <Title order={2}>最新错题</Title>
          <Space h="xl" />
          {loadingProblems ? (
            <Skeleton h={300} />
          ) : (
            <SimpleGrid cols={{ md: 2, lg: 3 }}>
              {problems.map((problem) => (
                <Problem problem={problem} key={problem.id} />
              ))}
            </SimpleGrid>
          )}
        </>
      )}
    </Container>
  );
}
