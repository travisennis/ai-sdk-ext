import {
  createAnthropic,
  anthropic as originalAnthropic,
} from "@ai-sdk/anthropic";
import { createAzure } from "@ai-sdk/azure";
import { google as originalGoogle } from "@ai-sdk/google";
import { createOpenAI, openai as originalOpenAI } from "@ai-sdk/openai";
import {
  experimental_createProviderRegistry as createProviderRegistry,
  experimental_customProvider as customProvider,
} from "ai";

const azure = customProvider({
  languageModels: {
    text: createAzure({
      resourceName: process.env.AZURE_RESOURCE_NAME,
      apiKey: process.env.AZURE_API_KEY,
    })(process.env.AZURE_DEPLOYMENT_NAME ?? ""),
  },
});

const openrouter = customProvider({
  languageModels: {
    llama370b: createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    })("meta-llama/llama-3-70b"),
  },
  fallbackProvider: createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  }),
});

const anthropic = customProvider({
  languageModels: {
    opus: originalAnthropic("claude-3-opus-20240229"),
    sonnet: createAnthropic({
      headers: {
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15",
      },
    })("claude-3-5-sonnet-20241022", {
      cacheControl: true,
    }),
    haiku: originalAnthropic("claude-3-5-haiku-20241022"),
  },
  fallbackProvider: originalAnthropic,
});

const openai = customProvider({
  languageModels: {
    "gpt-4o": originalOpenAI("gpt-4o-2024-11-20"),
    "gpt-4o-mini": originalOpenAI("gpt-4o-mini"),
    "gpt-4o-structured": originalOpenAI("gpt-4o-2024-11-20", {
      structuredOutputs: true,
    }),
    "gpt-4o-mini-structured": originalOpenAI("gpt-4o-mini", {
      structuredOutputs: true,
    }),
    o1: originalOpenAI("o1-preview"),
    "o1-mini": originalOpenAI("o1-mini"),
  },
  fallbackProvider: originalOpenAI,
});

const google = customProvider({
  languageModels: {
    pro: originalGoogle("gemini-1.5-pro-latest"),
    flash: originalGoogle("gemini-1.5-flash-latest"),
    flash2: originalGoogle("gemini-2.0-flash-exp"),
    flash2thinking: originalGoogle("gemini-2.0-flash-thinking-exp-1219"),
  },
  fallbackProvider: originalGoogle,
});

const registry = createProviderRegistry({
  anthropic,
  openai,
  azure,
  openrouter,
  google,
});

type AnthropicModel = "opus" | "sonnet" | "haiku";
type OpenAIModel =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-4o-structured"
  | "gpt-4o-mini-structured"
  | "o1"
  | "o1-mini";
type OpenRouterModel = string;
type GoogleModel = "pro" | "flash" | "flash2" | "flash2thinking";

export type ModelName =
  | `anthropic:${AnthropicModel}`
  | `openai:${OpenAIModel}`
  | "azure:text"
  | `openrouter:${OpenRouterModel}`
  | `google:${GoogleModel}`;

export const Models: ModelName[] = [
  "anthropic:sonnet",
  "anthropic:opus",
  "anthropic:haiku",
  "openai:gpt-4o",
  "openai:gpt-4o-mini",
  "openai:gpt-4o-structured",
  "openai:gpt-4o-mini-structured",
  "openai:o1",
  "openai:o1-mini",
  "google:pro",
  "google:flash",
  "google:flash2",
  "google:flash2thinking",
];

// export type ModelName = (typeof Models)[number];

export function isSupportedModel(model: unknown): model is ModelName {
  return Models.includes(model as ModelName);
}

export function languageModel(input: ModelName) {
  return registry.languageModel(input);
}
