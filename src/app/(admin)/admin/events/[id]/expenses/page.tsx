import ExpensesClient from "./expenses-client";
import { getEvents } from "@/services/event.service";

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((event) => ({
    id: event.id,
  }));
}

export default function ExpensesPage() {
  return (
    <div className="container mx-auto max-w-7xl pt-6 sm:pt-12 px-4 sm:px-6">
      <ExpensesClient />
    </div>
  );
}
