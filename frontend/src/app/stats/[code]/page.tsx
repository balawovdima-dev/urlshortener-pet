import type { Metadata } from "next";
import NextLink from "next/link";
import { StatsView } from "@/components/StatsView";

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata(
  props: PageProps<"/stats/[code]">,
): Promise<Metadata> {
  const { code } = await props.params;
  return { title: `Stats for ${safeDecode(code)}` };
}

export default async function StatsPage(props: PageProps<"/stats/[code]">) {
  const { code } = await props.params;
  const decoded = safeDecode(code);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <NextLink
          href="/"
          className="text-sm text-zinc-500 hover:underline"
        >
          ← Back
        </NextLink>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Link stats
        </h1>
      </div>
      {/* Data is fetched in the browser so the API URL works the same in dev and prod. */}
      <StatsView code={decoded} />
    </div>
  );
}
