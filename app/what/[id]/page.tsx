import WorkDetailContent from "@/components/What/WorkDetailContent";

type Params = Promise<{ id: string }>;

export default async function WhatDetailPage(props: { params: Params }) {
  const params = await props.params;
  return <WorkDetailContent id={params.id} />;
}
