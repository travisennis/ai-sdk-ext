import { type LanguageModel, generateText } from "ai";

export async function bon({
  model,
  system,
  prompt,
  n = 3,
}: {
  model: LanguageModel;
  system?: string;
  prompt: string;
  n?: number;
}): Promise<[string, number]> {
  let tokens = 0;

  const completions = await Promise.all(
    Array(n)
      .fill(0)
      .map(async (_) => {
        const { text, usage } = await generateText({
          model: model,
          maxTokens: 4096,
          temperature: 1.0,
          system,
          prompt,
        });
        tokens += usage.completionTokens;
        return text;
      }),
  );

  const ratings = await Promise.all(
    completions.map(async (completion) => {
      const { text, usage } = await generateText({
        model: model,
        maxTokens: 256,
        temperature: 0.1,
        system:
          "You are to be given a query and response to that query. Rate the response on a scale from 0 to 10, where 0 is poor and 10 is excellent. Consider factors such as relevance, coherence, and helpfulness to the query. Respond only with a number.",
        prompt: `Query: ${prompt}\n\nResponse: ${completion}`,
      });
      tokens += usage.completionTokens;
      return Number.parseInt(text);
    }),
  );

  const bestIndex = ratings.indexOf(Math.max(...ratings));

  return [completions[bestIndex], tokens];
}
