import React from "react";
import { requireAdmin } from "@/lib/auth-helpers";
import SandboxPage from "@/components/admin/customize/__sandbox__/SandboxPage";

export const dynamic = "force-dynamic";

/**
 * CustomizePreviewSandboxPage protects the sandbox route with requireAdmin
 * and renders the client SandboxPage component.
 */
export default async function CustomizePreviewSandboxPage() {
  await requireAdmin();

  return <SandboxPage />;
}
