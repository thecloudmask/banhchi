import PublicEventClient from "../../event/[[...id]]/public-event-client";

export default async function ArticlePage(props: { params: Promise<{ id: string }> }) {
  await props.params;
  return <PublicEventClient />;
}
