import { getStatesWithLatestScores } from "@/lib/queries";
import { NationalOverview } from "./national-overview";

// Revalidate dashboard every hour (data only changes monthly)
export const revalidate = 3600;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const states = await getStatesWithLatestScores(params.period);
  return <NationalOverview states={states} />;
}
