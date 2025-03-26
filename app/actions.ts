"use server";

import axios from "axios";

type ModelRequestParams = {
  systemPrompt: string;
  userPrompt: string;
  modelId: string;
  customApiKey?: string;
};

type ModelResponse = {
  output: string;
  responseTime: number; // in milliseconds
};

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

async function callOpenRouter({
  modelId,
  systemPrompt,
  userPrompt,
  customApiKey,
}: ModelRequestParams): Promise<ModelResponse> {
  const startTime = Date.now();

  const apiKey = customApiKey || OPENROUTER_API_KEY;

  // Provide more debugging information about the API key
  console.log("API Key Status:", {
    customProvided: !!customApiKey,
    environmentProvided: !!OPENROUTER_API_KEY,
    finalKeyAvailable: !!apiKey,
  });

  // Verify that we have an API key
  if (!apiKey) {
    throw new Error(
      "OpenRouter API key is missing. Please provide an API key in the Advanced Settings or set OPENROUTER_API_KEY in your environment variables."
    );
  }

  // For security, only log a masked version of the key during development
  if (process.env.NODE_ENV === "development") {
    const maskedKey =
      apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4);
    console.log("Using API key (masked):", maskedKey);
  }

  try {
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: modelId,
        messages: [
          {
            role: "system",
            content: systemPrompt || "You are a helpful AI assistant.",
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
          "X-Title": "LLM Output Comparison",
        },
      }
    );

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return {
      output: response.data.choices[0].message.content,
      responseTime,
    };
  } catch (error) {
    console.error(`Error calling OpenRouter for model ${modelId}:`, error);

    // Get more detailed error information
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorMessage =
        error.response?.data?.error?.message || error.message;

      if (statusCode === 401) {
        throw new Error(
          `Authentication failed: The API key provided is invalid or missing.`
        );
      } else if (statusCode === 404) {
        throw new Error(
          `Model not found: "${modelId}" doesn't exist or is not available.`
        );
      } else if (statusCode === 429) {
        throw new Error(
          `Rate limit exceeded: Too many requests. Please try again later.`
        );
      } else {
        throw new Error(
          `OpenRouter API error (${statusCode}): ${errorMessage}`
        );
      }
    }

    throw new Error(
      `Failed to generate text with model ${modelId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function generateWithModel(
  params: ModelRequestParams
): Promise<ModelResponse> {
  return callOpenRouter(params);
}
