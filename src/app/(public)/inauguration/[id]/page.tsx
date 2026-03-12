import PublicEventClient from "../../event/[[...id]]/public-event-client";

export default async function InaugurationPage(props: { params: Promise<{ id: string }> }) {
  await props.params;
  return <PublicEventClient />;
}
