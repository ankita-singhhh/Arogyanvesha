import { notFound } from "next/navigation";
import { YogaPosePractice } from "@/components/yoga/YogaPosePractice";
import { getYogaPose, YOGA_POSES } from "@/lib/yogaPoses";

export function generateStaticParams() {
  return YOGA_POSES.map((pose) => ({ id: pose.id }));
}

export default async function YogaPosePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pose = getYogaPose(id);
  if (!pose) notFound();

  return <YogaPosePractice pose={pose} />;
}
