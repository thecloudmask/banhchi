import PublicEventClient from "../../event/[[...id]]/public-event-client";

export default async function WeddingPage(props: { params: Promise<{ id: string }> }) {
  await props.params;
  return <PublicEventClient />;
}
