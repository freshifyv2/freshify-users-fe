/**
 * Legacy redirect — moved to /dashboard/users/settings.
 * Keeps existing bookmarks and shared links working.
 */
import { redirect } from "next/navigation";

export default function LegacyURMModuleSettingsRedirect() {
  redirect("/dashboard/users/settings");
}
