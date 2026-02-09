"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminContentsListClient from "../admin-contents-list-client";
import EditContentClient from "./edit-content-client";
import CreateContentClient from "./create-content-client";

export default function ContentPage() {
  const params = useParams();
  const [idValue, setIdValue] = useState<string | undefined>(undefined);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const extractId = () => {
      // 1. Try to get from params
      if (params?.id) {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        if (id && id !== 'index.html') return id;
      }

      // 2. Fallback: extract from URL (essential for static export rewrites)
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const parts = path.split('/').filter(Boolean);
        const contentsIndex = parts.indexOf('contents');
        if (contentsIndex !== -1 && parts[contentsIndex + 1]) {
          const extractedId = parts[contentsIndex + 1];
          if (extractedId && extractedId !== 'index.html') return extractedId;
        }
      }
      return undefined;
    };

    setIdValue(extractId());
    setIsInitializing(false);
  }, [params]);

  if (isInitializing) return null;

  // 1. Root /admin/contents -> List
  if (!idValue) {
    return <AdminContentsListClient />;
  }

  // 2. /admin/contents/create -> Create Form
  if (idValue === 'create') {
    return <CreateContentClient />;
  }

  // 3. /admin/contents/[ID] -> Edit Form
  return <EditContentClient />;
}
