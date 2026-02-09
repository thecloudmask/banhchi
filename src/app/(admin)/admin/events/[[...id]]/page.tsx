import AdminEventClient from "./admin-event-client";

export function generateStaticParams() {
  return [{ id: [] }];
}

export default async function Page(props: { params: Promise<{ id?: string[] }> }) {
  await props.params; 
  return <AdminEventClient />;
}
