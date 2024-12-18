"use server";

import { AutoTokenizer } from "@huggingface/transformers";

export async function Test(
  modeId: string = "NousResearch/Hermes-3-Llama-3.1-8B",
  tmpl: string,
  token: string
): Promise<string> {
  const tokenizer = await AutoTokenizer.from_pretrained(modeId);

  // 일반대화 랜더링
  let result1: string;
  try {
    result1 = tokenizer.apply_chat_template(
      [
        { role: "user", content: "**USER**" },
        { role: "assistant", content: "**ASSISTANT**" },
        { role: "user", content: "**USER**" },
      ],
      {
        ...(tmpl ? { chat_template: tmpl } : {}),
        tokenize: false,
      }
    ) as string;
  } catch {
    result1 = "Failed to render";
  }

  // system prompt가 있는 일반 대화 랜더링
  let result2: string;
  try {
    result2 = tokenizer.apply_chat_template(
      [
        { role: "system", content: "**SYSTEM**" },
        { role: "user", content: "**USER**" },
        { role: "assistant", content: "**ASSISTANT**" },
        { role: "user", content: "**USER**" },
      ],
      {
        ...(tmpl ? { chat_template: tmpl } : {}),
        tokenize: false,
      }
    ) as string;
  } catch {
    result2 = "Failed to render";
  }

  // assistant가 먼저 말하는 경우의 랜더링
  let result3: string;
  try {
    result3 = tokenizer.apply_chat_template(
      [
        { role: "assistant", content: "**ASSISTANT**" },
        { role: "user", content: "**USER**" },
        { role: "assistant", content: "**ASSISTANT**" },
        { role: "user", content: "**USER**" },
      ],
      {
        ...(tmpl ? { chat_template: tmpl } : {}),
        tokenize: false,
      }
    ) as string;
  } catch {
    result3 = "Failed to render";
  }

  // add_generation_prompt가 true인 상황에서 랜더링
  let result4: string;
  try {
    result4 = tokenizer.apply_chat_template(
      [
        { role: "user", content: "**USER**" },
        { role: "assistant", content: "**ASSISTANT**" },
        { role: "user", content: "**USER**" },
      ],
      {
        ...(tmpl ? { chat_template: tmpl } : {}),
        tokenize: false,
      }
    ) as string;
  } catch {
    result4 = "Failed to render";
  }

  return JSON.stringify([result1, result2, result3, result4]);
}
