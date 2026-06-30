import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import qrAsset from "@/assets/solver-sanctuary-qrcode.png.asset.json";
import { submitFeedback } from "@/lib/feedback.functions";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Solver Sanctuary" },
      { name: "description", content: "About Solver Sanctuary — why it was built, inspirations, and how to support the project." },
      { property: "og:title", content: "About — Solver Sanctuary" },
      { property: "og:description", content: "About Solver Sanctuary — why it was built, inspirations, and how to support the project." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const send = useServerFn(submitFeedback);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState<"Bug report" | "Suggestion" | "Others">("Others");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !description.trim()) {
      setError("All fields are required.");
      return;
    }
    setError(null);
    setStatus("submitting");
    try {
      await send({ data: { name, email, feedbackType, subject, description } });
      setStatus("sent");
      setName(""); setEmail(""); setSubject(""); setDescription(""); setFeedbackType("Others");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Failed to send feedback.");
    }
  };

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
            <span className="font-semibold">1.</span> I created this website because I love puzzles and constantly find myself searching for better, alternative solutions.
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

          <div className="flex justify-center">
            <img
              src={qrAsset.url}
              alt="QR code linking to Solver Sanctuary"
              className="w-64 h-auto rounded-md border bg-white p-2"
            />
          </div>

          <div>
            <p>
              <span className="font-semibold">4.</span> Your feedback helps us improve. Kindly fill out the form below.
            </p>
            <form onSubmit={onSubmit} className="mt-4 space-y-3 rounded-md border p-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Feedback type</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value as typeof feedbackType)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option>Bug report</option>
                  <option>Suggestion</option>
                  <option>General</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={200}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                  maxLength={1000}
                  rows={5}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
                <div className="mt-1 text-right text-xs text-muted-foreground">{description.length}/1000</div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {status === "sent" && <p className="text-sm text-emerald-600">Thanks! Your feedback has been sent.</p>}
              <div>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {status === "submitting" ? "Sending..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
