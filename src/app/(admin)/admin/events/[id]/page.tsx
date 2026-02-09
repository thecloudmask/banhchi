import AdminEventClient from "./admin-event-client";
import { getEvents } from "@/services/event.service";

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((event) => ({
    id: event.id,
  }));
}

export default function Page() {
  return <AdminEventClient />;
}
