import ContentPageClient from "./content-page-client";

export function generateStaticParams() {
  return [{ id: [] }, { id: ['create'] }];
}

export default function Page() {
  return <ContentPageClient />;
}