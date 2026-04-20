import { getDistrictsForState } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { StateView } from "./state-view";

export default async function StatePage({ params }: { params: Promise<{ stateId: string }> }) {
  const { stateId } = await params;
  const id = parseInt(stateId);
  const supabase = await createClient();
  const { data: state } = await supabase.from("states").select("id, lgd_code, name").eq("id", id).single();
  const districts = await getDistrictsForState(id);
  if (!state) return <div className="p-8">State not found</div>;
  return <StateView state={state} districts={districts} />;
}
