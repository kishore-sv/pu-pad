import { Suspense } from "react";
import { Hero } from "@/components/pad/hero";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <Suspense fallback={null}>
        <Hero />
      </Suspense>
    </main>
  );
}
