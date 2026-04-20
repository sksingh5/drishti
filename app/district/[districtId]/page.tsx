import { getDistrictDetail, getDistrictHistory } from "@/lib/queries";
import { DistrictScorecard } from "./district-scorecard";

export default async function DistrictPage({ params }: { params: Promise<{ districtId: string }> }) {
  const { districtId } = await params;
  const id = parseInt(districtId);
  const detail = await getDistrictDetail(id);
  const history = await getDistrictHistory(id);
  if (!detail.district) return <div className="p-8">District not found</div>;
  return <DistrictScorecard detail={detail} history={history} />;
}
