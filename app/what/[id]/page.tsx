import WorkDetailContent from "@/components/What/WorkDetailContent";

interface PageProps {
  params: { id: string };
}

export default function WhatDetailPage({ params }: PageProps) {
  return (
    <div className="h-[calc(100svh-112px)] pb-[148px]">
      <WorkDetailContent id={params.id} />
    </div>
  );
}
