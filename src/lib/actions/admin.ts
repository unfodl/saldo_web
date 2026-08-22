"use server";

import { redirect } from "next/navigation";
import { destroyAdminSession } from "@/lib/auth/admin-session";

export async function adminLogoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}
