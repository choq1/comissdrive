import { cookies } from "next/headers";
import { DEFAULT_LOCALE, Locale } from "./dictionaries";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get("locale")?.value;
  return value === "en" || value === "pt-BR" ? value : DEFAULT_LOCALE;
}
