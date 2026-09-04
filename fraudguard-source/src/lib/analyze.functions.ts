import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callDetectionBackend } from "./analyze.server";

export const analyzeMessageFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        message: z.string().min(1).max(4000),
        language: z.enum(["english", "urdu", "roman-urdu"]),
        kind: z.enum(["sms", "call"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await callDetectionBackend(data.message, data.language, data.kind);
    return { result };
  });
