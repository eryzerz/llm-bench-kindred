"use server";

import axios from "axios";

type ModelRequestParams = {
  systemPrompt: string;
  userPrompt: string;
  modelId: string;
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
}: ModelRequestParams): Promise<ModelResponse> {
  const startTime = Date.now();

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
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
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
    throw new Error(`Failed to generate text with model ${modelId}`);
  }
}

export async function generateWithModel(
  params: ModelRequestParams
): Promise<ModelResponse> {
  return callOpenRouter(params);
}
