"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import AdminContentsListClient from "../admin-contents-list-client";
import EditContentClient from "./edit-content-client";
import CreateContentClient from "./create-content-client";

export default function ContentPage() {
  const params = useParams();
  const pathname = usePathname();
  const [idValue, setIdValue] = useState<string | undefined>(undefined);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const extractId = () => {
      // Debug logging
      if (typeof window !== 'undefined') {
         console.log('Current Path:', pathname);
         console.log('Params:', params);
      }

      // 1. Try to get from params
      if (params?.id) {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        if (id && id !== 'index.html' && id !== 'posts') return id;
      }

      // 2. Fallback: extract from URL (essential for static export rewrites)
      if (pathname) {
        const parts = pathname.split('/').filter(Boolean);
        // Find 'posts' case-insensitively
        const postsIndex = parts.findIndex(p => p.toLowerCase() === 'posts');
        
        if (postsIndex !== -1 && parts[postsIndex + 1]) {
          const extractedId = parts[postsIndex + 1];
          if (extractedId && extractedId !== 'index.html') {
             console.log('Extracted ID from URL:', extractedId);
             return extractedId;
          }
        }
      }
      return undefined;
    };

    const extracted = extractId();
    if (extracted !== idValue) {
       setIdValue(extracted);
    }
    setIsInitializing(false);
  }, [params, pathname]);

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
