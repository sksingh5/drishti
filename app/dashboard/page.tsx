import { getStatesWithLatestScores } from "@/lib/queries";
import { NationalOverview } from "./national-overview";

export default async function DashboardPage() {
  const states = await getStatesWithLatestScores();
  return <NationalOverview states={states} />;
}
