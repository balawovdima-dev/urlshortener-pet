import { RecentLinks } from "@/components/RecentLinks";
import { ShortenForm } from "@/components/ShortenForm";

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Shorten a link dev
        </h1>
        <p className="mt-1 text-zinc-500">
          Paste a long URL and get a short one you can share.
        </p>
      </div>
      <ShortenForm />
      <RecentLinks />
    </div>
  );
}
