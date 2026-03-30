import TrackingClient from "./tracking-client";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  return {
    title: "Event Tracking Report | Mordok-Theapka",
  };
}

export default async function TrackingPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  
  return <TrackingClient token={resolvedParams.token} />;
}
