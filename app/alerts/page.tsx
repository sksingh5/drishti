import { getAlerts } from "@/lib/queries";
import { AlertsDashboard } from "./alerts-dashboard";

export default async function AlertsPage() {
  const alerts = await getAlerts();
  return <AlertsDashboard alerts={alerts} />;
}
