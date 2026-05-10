import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CandidateSchema = z.object({
  num: z.string(),
  title: z.string(),
  useCase: z.string(),
  sectionLabel: z.string(),
  frameworks: z.string(),
});

const InputSchema = z.object({
  query: z.string().min(1).max(2000),
  candidates: z.array(CandidateSchema).min(1).max(60),
});

export interface AiRanked {
  num: string;
  reason: string;
}

export interface AiSearchResult {
  picks: AiRanked[];
  model: string;
  error?: string;
}

export const semanticSuggestPrompts = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AiSearchResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { picks: [], model: "none", error: "LOVABLE_API_KEY missing" };
    }

    const model = "anthropic/claude-sonnet-4-5";
    const list = data.candidates
      .map(
        (c) =>
          `#${c.num} | ${c.sectionLabel} | ${c.title}\n  use: ${c.useCase}\n  frameworks: ${c.frameworks}`,
      )
      .join("\n\n");

    const system = `You are a PhD research assistant that recommends the most useful prompts from a curated catalog. Pick the 5 prompts that best help the scholar with their stated need. Reply with STRICT JSON only, no prose: {"picks":[{"num":"<id>","reason":"<one short sentence why>"}]}. Use only nums from the catalog.`;
    const user = `Scholar's need:\n"""${data.query}"""\n\nCatalog (id | section | title):\n${list}\n\nReturn the 5 best matches as JSON.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        return { picks: [], model, error: `Gateway ${res.status}: ${text.slice(0, 200)}` };
      }

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = json.choices?.[0]?.message?.content ?? "";
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) return { picks: [], model, error: "No JSON in model reply" };
      const parsed = JSON.parse(match[0]) as { picks?: AiRanked[] };
      const valid = (parsed.picks ?? [])
        .filter((p) => p && typeof p.num === "string")
        .slice(0, 5);
      return { picks: valid, model };
    } catch (e) {
      return { picks: [], model, error: (e as Error).message };
    }
  });
