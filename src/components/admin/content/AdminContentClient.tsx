"use client";

import { useState } from "react";
import PostsList from "./PostsList";
import PostEditor from "./PostEditor";
import { PostStatus } from "@prisma/client";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string;
  status: PostStatus;
  publishedAt: Date | string | null;
  scheduledFor: Date | string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  authorName: string | null;
  tags: string[];
  readingTime: number | null;
  createdAt: Date | string;
}

interface AdminContentClientProps {
  initialPosts: Post[];
}

export default function AdminContentClient({ initialPosts }: AdminContentClientProps) {
  // If postToEdit is null, it means we are creating a new post.
  // If postToEdit is undefined, it means we are viewing the list.
  // If postToEdit is a Post object, we are editing that post.
  const [postToEdit, setPostToEdit] = useState<Post | null | undefined>(undefined);

  const isEditing = postToEdit !== undefined;

  return (
    <div>
      {isEditing ? (
        <PostEditor
          post={postToEdit}
          onClose={() => setPostToEdit(undefined)}
        />
      ) : (
        <PostsList
          initialPosts={initialPosts}
          onEdit={(post) => setPostToEdit(post)}
        />
      )}
    </div>
  );
}
