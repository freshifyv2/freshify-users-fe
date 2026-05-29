import { redirect } from "next/navigation";
import { readSessionToken } from "@/lib/session";

export default function UsersIndex() {
  const token = readSessionToken();
  if (token) redirect("/account");
  redirect("/login");
}
