import { createFileRoute, Link } from "@tanstack/react-router";
import qrAsset from "@/assets/solve-stack-qrcode.png.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Solve Stack" },
      { name: "description", content: "About Solve Stack — why it was built, inspirations, and how to support the project." },
      { property: "og:title", content: "About — Solve Stack" },
      { property: "og:description", content: "About Solve Stack — why it was built, inspirations, and how to support the project." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-8 flex items-start justify-between gap-4">
          <h1 className="text-4xl font-bold tracking-tight">About</h1>
          <Link
            to="/"
            className="shrink-0 rounded-md border bg-muted px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            ← Home
          </Link>
        </header>

        <div className="space-y-6 text-base leading-relaxed">
          <p>
            <span className="font-semibold">1.</span> Why did I create this website? I love puzzles, and often times after attempting one, I want to know if there's a better and/or alternative solution. This is why I created this website. It is also for my girlfriend to participate in this activity from time to time.
          </p>

          <div>
            <p>
              <span className="font-semibold">2.</span> I also got inspired by other solvers like
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>
                <a className="text-primary underline" href="https://www.youtube.com/@CrackingTheCryptic/videos" target="_blank" rel="noopener noreferrer">Cracking the Cryptic</a>
              </li>
              <li>
                <a className="text-primary underline" href="https://www.youtube.com/@Rangsk/videos" target="_blank" rel="noopener noreferrer">Rangsk</a>
              </li>
              <li>
                <a className="text-primary underline" href="https://www.youtube.com/@SamWords13/videos" target="_blank" rel="noopener noreferrer">SamWords</a>
              </li>
            </ul>
          </div>

          <p>
            <span className="font-semibold">3.</span> If you like what I built, consider supporting me! Donate through{" "}
            <a className="text-primary underline" href="https://www.paypal.com/ncp/payment/G2BYG4KQLF3JS" target="_blank" rel="noopener noreferrer">PayPal</a>{" "}
            or simply scan the code below.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <img
            src={qrAsset.url}
            alt="QR code linking to Solve Stack"
            className="w-64 h-auto rounded-md border bg-white p-2"
          />
        </div>
      </div>
    </div>
  );
}
