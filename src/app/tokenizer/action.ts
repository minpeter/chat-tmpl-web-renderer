"use server";

import { AutoTokenizer } from "@huggingface/transformers";

export async function Test(
  modelId: string = "NousResearch/Hermes-3-Llama-3.1-8B",
  inputText: string,
  chatTemplateString: string,
  hfToken?: string
): Promise<string> {
  // Set HF_TOKEN environment variable if hfToken is provided
  if (hfToken && hfToken.trim() !== "") {
    process.env.HF_TOKEN = hfToken;
  } else {
    // Ensure HF_TOKEN is not set if no token is provided for this specific call
    // This is to prevent using a token from a previous call in a reused environment.
    delete process.env.HF_TOKEN;
  }

  const tokenizer = await AutoTokenizer.from_pretrained(modelId);

  // Tokenization Logic
  let tokenizationResult: { tokens: string[]; ids: number[] } = {
    tokens: [],
    ids: [],
  };
  try {
    const tokens = tokenizer.tokenize(inputText);
    const ids = tokenizer.convert_tokens_to_ids(tokens);
    tokenizationResult = { tokens, ids };
  } catch (e) {
    console.error("Tokenization failed:", e);
    tokenizationResult = {
      tokens: [`Error: Tokenization failed. Details: ${e instanceof Error ? e.message : String(e)}`],
      ids: [],
    };
  }

  // Chat Templating Logic
  let chatTemplateOutput: string;
  try {
    const conversation = [{ role: "user", content: inputText }];
    chatTemplateOutput = tokenizer.apply_chat_template(conversation, {
      chat_template: chatTemplateString ? chatTemplateString : undefined,
      tokenize: false,
    }) as string;
  } catch (e) {
    console.error("Chat templating failed:", e);
    chatTemplateOutput = `Error: Failed to apply chat template. Details: ${e instanceof Error ? e.message : String(e)}`;
  }

  return JSON.stringify({
    tokenizationResult,
    chatTemplateOutput,
  });
}
