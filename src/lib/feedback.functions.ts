import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const FeedbackSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  feedbackType: z.enum(["Bug report", "Suggestion", "Others"]),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(500),
});

export type FeedbackInput = z.infer<typeof FeedbackSchema>;

export const submitFeedback = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => FeedbackSchema.parse(data))
  .handler(async ({ data }) => {
    const recipient = process.env.FEEDBACK_EMAIL;
    if (!recipient) {
      throw new Error("Feedback channel not configured.");
    }

    const formData = new FormData();
    formData.append("name", data.name || "Anonymous");
    formData.append("email", data.email || "no-reply@solversanctuary.local");
    formData.append("_subject", `[${data.feedbackType}] ${data.subject || "(no subject)"}`);
    formData.append("Feedback Type", data.feedbackType);
    formData.append("Subject", data.subject || "");
    formData.append("Description", data.description);
    formData.append("_template", "table");
    formData.append("_captcha", "false");

    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Failed to deliver feedback.");
    }

    return { ok: true };
  });
