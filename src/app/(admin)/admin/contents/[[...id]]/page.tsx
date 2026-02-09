import AdminContentsListClient from "../admin-contents-list-client";
import EditContentClient from "./edit-content-client";

export function generateStaticParams() {
  // Return an array with an empty id to pre-render the root /admin/contents page.
  // This allows the page to exist in a static export while handling dynamic IDs on the client.
  return [{ id: [] }];
}

export default async function Page(props: { params: Promise<{ id?: string[] }> }) {
  const params = await props.params;
  const idValue = params.id?.[0];

  // If there's no ID, show the list. Otherwise, show the edit form.
  if (!idValue) {
    return <AdminContentsListClient />;
  }

  return <EditContentClient />;
}
