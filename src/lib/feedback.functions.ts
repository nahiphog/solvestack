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
    const webhook = process.env.DISCORD_FEEDBACK_WEBHOOK_URL;
    if (!webhook) {
      throw new Error("Feedback channel not configured.");
    }

    const colorMap: Record<string, number> = {
      "Bug report": 0xef4444,
      Suggestion: 0x3b82f6,
      Others: 0x9ca3af,
    };

    const payload = {
      username: "Solver Sanctuary Feedback",
      embeds: [
        {
          title: `[${data.feedbackType}] ${data.subject}`,
          description: data.description,
          color: colorMap[data.feedbackType] ?? 0x9ca3af,
          fields: [
            { name: "Name", value: data.name, inline: true },
            { name: "Email", value: data.email, inline: true },
            { name: "Type", value: data.feedbackType, inline: true },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Failed to deliver feedback.");
    }

    return { ok: true };
  });
