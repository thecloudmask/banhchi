import PublicEventClient from "../../event/[[...id]]/public-event-client";

export default async function FuneralPage(props: { params: Promise<{ id: string }> }) {
  await props.params;
  return <PublicEventClient />;
}
