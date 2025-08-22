import { workData } from "@/components/What/data";
import WorkContentDetail from "@/components/What/WorkContentDetail";
import WorkDetailContent from "@/components/What/WorkDetailContent";

type Params = Promise<{ id: string }>;

export default async function WhatDetailPage(props: { params: Params }) {
  const params = await props.params;
  // If id matches a dev work id render WorkDetailContent, else try content
  const isWork = workData.some((c) => c.id === params.id);
  if (isWork) {
    return <WorkDetailContent id={params.id} />;
  }
  return <WorkContentDetail id={params.id} />;
}
