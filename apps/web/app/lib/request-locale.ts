import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE_NAME, resolvePreferredLocale } from "@/app/lib/i18n";

export async function resolveRequestLocale() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  return resolvePreferredLocale({
    cookieLocale: cookieStore.get(LOCALE_COOKIE_NAME)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
}
