import type { Metadata } from "next";
import IntakeExperience from "@/app/components/intake/IntakeExperience";
import { getUiCopy } from "@/app/lib/i18n";
import { resolveRequestLocale } from "@/app/lib/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveRequestLocale();
  const copy = getUiCopy(locale);

  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  };
}

export default async function Home() {
  const initialLocale = await resolveRequestLocale();

  return <IntakeExperience initialLocale={initialLocale} />;
}
