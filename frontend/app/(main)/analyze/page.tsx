"use client";
import { useAuthStore } from "@/app/store";
import {
  analyzeGetMyOverviewRoute,
  analyzeGetMyPerSubjectOverviewRoute,
  GetAnalyzeOverviewResponse,
  GetAnalyzePerSubjectResponse,
  subjectGetSubjectsRoute,
  SubjectPublic,
} from "@/client";
import { Markdown } from "@/components/Markdown";
import { apiConfig, siteConfig } from "@/config";
import { getRandomColorWithSeed } from "@/util/color";
import { splitStream } from "@/util/stream";
import { AreaChart, DonutChart, LineChart } from "@mantine/charts";
import {
  Accordion,
  Badge,
  Box,
  Center,
  Container,
  Group,
  Loader,
  SimpleGrid,
  Skeleton,
  Space,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconChartBar } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import classes from "./style.module.css";

export default function ViewAnalyzePage() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [analysis, setAnalysis] = useState<GetAnalyzeOverviewResponse>();
  const [subjects, setSubjects] = useState<SubjectPublic[]>([]);
  const [subjectAnalysis, setSubjectAnalysis] = useState<{
    [key: string]: GetAnalyzePerSubjectResponse;
  }>();
  const [aiSubjectAnalysis, setAISubjectAnalysis] = useState<{
    [key: string]: string;
  }>({});

  const fetchAnalysis = async () => {
    const { data, error } = await analyzeGetMyOverviewRoute({
      auth: () => token || "",
    });

    if (error) {
      notifications.show({
        title: "获取学情分析失败",
        message: (error as { detail: string }).detail?.toString(),
        color: "red",
      });
      return;
    }

    setAnalysis(data);
    setLoading(false);
  };

  const fetchSubjects = async () => {
    const { data, error } = await subjectGetSubjectsRoute({
      auth: () => token || "",
    });

    if (error) {
      notifications.show({
        title: "获取学科信息失败",
        message: (error as { detail: string }).detail?.toString(),
        color: "red",
      });
      return;
    }

    setSubjects(data!);
  };

  const fetchPerSubjectAnalysis = async (subjectId: string) => {
    const { data, error } = await analyzeGetMyPerSubjectOverviewRoute({
      auth: () => token || "",
      path: {
        subject_id: subjectId,
      },
    });

    if (error) {
      notifications.show({
        title: "获取学科分析失败",
        message: error.detail?.toString(),
        color: "red",
      });
      return;
    }

    setSubjectAnalysis((prev) => ({
      ...prev,
      [subjectId]: data,
    }));
    setLoadingSubjects(false);
  };

  const fetchPerSubjectAIAnalysis = async (subjectId: string) => {
    if (subjectId in aiSubjectAnalysis) return;
    const response = await fetch(
      `${apiConfig.baseUrl}/analyze/me/subject/${subjectId}/ai`,
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
      setAISubjectAnalysis((prev) => ({
        ...prev,
        [subjectId]:
          (prev[subjectId] === undefined ? "" : prev[subjectId]) + data,
      }));
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchAnalysis();
    fetchSubjects();
  }, [token]);

  useEffect(() => {
    if (!subjects) return;
    subjects.forEach((subject) => fetchPerSubjectAnalysis(subject.id));
  }, [subjects]);

  return (
    <Container>
      <Title>学情分析</Title>
      <Space h={60} />
      {loading || !analysis ? (
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
                strokeColor="var(--card-bg)"
                chartLabel="学科分布"
                classNames={{ label: classes.ringLabel }}
                strokeWidth={6}
              />
            </div>
            <div>
              <Text fw={600} size="lg">7 天内错题总量：</Text>
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
          <Space h={60} />
          {loadingSubjects || !subjectAnalysis ? (
            <Skeleton h={300} />
          ) : (
            <SimpleGrid cols={{ sm: 1, md: 2 }} spacing="xl">
              {subjects.map((subject) => {
                if (!(subject.id in subjectAnalysis)) {
                  return <Skeleton h={200} key={subject.id} />;
                }
                const analysisDetailDates = Object.keys(
                  subjectAnalysis[subject.id].date_cnt
                ).sort();

                return (
                  <Box p="xl" className={classes.card} key={subject.id}>
                    <div className={classes.inner}>
                      <div>
                        <Text fz="xl" className={classes.label}>
                          {subject.name}
                        </Text>
                        <div>
                          <Text className={classes.lead} mt={30}>
                            {subjectAnalysis[subject.id].problems_cnt}
                          </Text>
                          <Text fz="xs" c="dimmed">
                            题
                          </Text>
                        </div>
                        <Space h="xl" />
                        <LineChart
                          h={100}
                          w={300}
                          data={Object.keys(analysis.date_cnt)
                            .sort()
                            .map((date) => ({
                              date,
                              [subject.name]:
                                subjectAnalysis[subject.id].date_cnt[date],
                            }))}
                          dataKey="date"
                          series={[
                            {
                              name: subject.name,
                              color:
                                siteConfig.analyze.subjectColors[
                                  subject.name as keyof typeof siteConfig.analyze.subjectColors
                                ] ?? "gray",
                            },
                          ]}
                          curveType="monotone"
                        />
                      </div>

                      <div className={classes.ring}>
                        <DonutChart
                          data={Object.keys(
                            subjectAnalysis[subject.id].tags_cnt
                          ).map((tag) => ({
                            value:
                              subjectAnalysis[subject.id].tags_cnt[tag].cnt,
                            color: getRandomColorWithSeed(tag),
                            name: tag,
                          }))}
                          chartLabel={
                            subjectAnalysis[subject.id].problems_cnt
                              ? "知识点"
                              : "暂无数据"
                          }
                          size={100}
                          thickness={12}
                          tooltipProps={{
                            allowEscapeViewBox: { x: true, y: true },
                          }}
                          classNames={{
                            label:
                              subjectAnalysis[subject.id].problems_cnt === 0
                                ? classes.subjectRingLabelNoData
                                : undefined,
                          }}
                        />
                      </div>
                    </div>

                    <Space h="xl" />
                    <Accordion variant="separated" radius="md">
                      <Accordion.Item value="analysis">
                        <Accordion.Control
                          icon={<IconChartBar size={16} />}
                          onClick={() => fetchPerSubjectAIAnalysis(subject.id)}
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
                            data={analysisDetailDates.map((date) => {
                              const ret: Record<string, string | number> = {
                                date,
                              };
                              Object.keys(
                                subjectAnalysis[subject.id].tags_cnt
                              ).forEach((tag) => {
                                const curr =
                                  subjectAnalysis[subject.id].tags_cnt[tag];
                                ret[tag] = curr.date[date];
                              });
                              return ret;
                            })}
                            dataKey="date"
                            series={Object.keys(
                              subjectAnalysis[subject.id].tags_cnt
                            ).map((tag) => ({
                              name: tag,
                              color: getRandomColorWithSeed(tag),
                            }))}
                            curveType="monotone"
                            withLegend
                            legendProps={{
                              verticalAlign: "bottom",
                              height: 50,
                            }}
                          />
                          <Space
                            h={
                              Object.keys(subjectAnalysis[subject.id].tags_cnt)
                                .length * 10
                            }
                          />
                          <Space h={40} />
                          {!(subject.id in aiSubjectAnalysis) ||
                          !aiSubjectAnalysis[subject.id] ? (
                            <Center>
                              <Loader type="dots" />
                            </Center>
                          ) : (
                            <>
                              <Markdown
                                content={aiSubjectAnalysis[subject.id]}
                              />
                              <Space h="md" />
                              <Text size="sm" c="gray">
                                内容由 AI 生成，仅供参考
                              </Text>
                            </>
                          )}
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>
                  </Box>
                );
              })}
            </SimpleGrid>
          )}
        </>
      )}
    </Container>
  );
}
