import ContentPageClient from "./content-page-client";

export function generateStaticParams() {
  return [{ id: [] }];
}

export default function Page() {
  return <ContentPageClient />;
}
