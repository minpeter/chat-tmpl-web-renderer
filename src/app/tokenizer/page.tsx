"use client";

import { useState } from "react";
import { Test } from "./action";
import { Environment as JinjaEnvironment } from "@huggingface/jinja";

// Content from src/app/tokenizer/result_display.jinja
const resultDisplayTemplateString = `<div class="results-container">
  {% for item_html in results_array %}
    <div class="result-item">
      <h3>Rendered Output {{ loop.index }}</h3>
      {{ item_html | safe }}
    </div>
  {% endfor %}
</div>`;

const defaultChatTemplateString = `{% for message in messages %}
  {% if message.role == 'user' %}
    <div class="chat-message user-message">{{ message.content }}</div>
  {% elif message.role == 'assistant' %}
    <div class="chat-message assistant-message">{{ message.content }}</div>
  {% elif message.role == 'system' %}
    <div class="chat-message system-message">{{ message.content }}</div>
  {% else %}
    <div class="chat-message other-message">{{ message.content }}</div>
  {% endif %}
{% endfor %}`;

export default function Home() {
  const [result, setResult] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    modelId: "NousResearch/Hermes-3-Llama-3.1-8B",
    text: "", // This is "Text to Tokenize"
    token: "",
    chatTemplate: defaultChatTemplateString, // New field
  });

  const handleSubmit = async (formDataEvent: FormData) => {
    const jinja = new JinjaEnvironment(null);
    const response = await Test(
      formDataEvent.get("modelId") as string,
      formDataEvent.get("chatTemplate") as string, // Use chatTemplate
      formDataEvent.get("token") as string
    );
    // Assuming response is a JSON string array of HTML strings
    const parsedResults = JSON.parse(response); 
    const finalHtml = jinja.renderString(resultDisplayTemplateString, { results_array: parsedResults });
    setResult(finalHtml);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      <form action={handleSubmit} className="w-full space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model ID
          </label>
          <input
            type="text"
            name="modelId"
            value={formData.modelId}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter model ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text to Tokenize
          </label>
          <textarea
            name="text"
            value={formData.text}
            onChange={handleChange}
            rows={6}
            className="w-full p-2 border border-gray-300 rounded font-mono"
            placeholder="Enter text"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hugging Face Token
          </label>
          <input
            type="password"
            name="token"
            value={formData.token}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter your HF token"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chat Template (for apply_chat_template)
          </label>
          <textarea
            name="chatTemplate"
            value={formData.chatTemplate}
            onChange={handleChange}
            rows={8}
            className="w-full p-2 border border-gray-300 rounded font-mono text-xs"
            placeholder="Enter Jinja chat template"
          />
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Apply Template & Tokenize
        </button>
      </form>

      {result && (
        <div
          className="w-full max-w-4xl mt-8 bg-gray-50 p-4 rounded-lg"
          dangerouslySetInnerHTML={{ __html: result }}
        />
      )}
    </main>
  );
}
