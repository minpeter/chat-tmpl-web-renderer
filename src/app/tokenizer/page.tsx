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
  const [result, setResult] = useState<any | null>(null); // Update state type
  const [formData, setFormData] = useState({
    modelId: "NousResearch/Hermes-3-Llama-3.1-8B",
    text: "", // This is "Text to Tokenize"
    token: "",
    chatTemplate: defaultChatTemplateString, // New field
  });

  const handleSubmit = async (formDataEvent: FormData) => {
    const jinja = new JinjaEnvironment();
    const response = await Test(
      formDataEvent.get("modelId") as string,
      formDataEvent.get("text") as string, // inputText
      formDataEvent.get("chatTemplate") as string, // chatTemplateString
      formDataEvent.get("token") as string // hfToken
    );
    
    const parsedResponse = JSON.parse(response); // This is { tokenizationResult, chatTemplateOutput }
        
    // Render the chat template output using Jinja (resultDisplayTemplateString expects an array)
    const chatHtml = jinja.renderString(resultDisplayTemplateString, { results_array: [parsedResponse.chatTemplateOutput] });

    setResult({
      renderedChatHtml: chatHtml,
      tokenization: parsedResponse.tokenizationResult
    });
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
      <div className="w-full max-w-4xl mt-8 space-y-8">
        {/* Section for Chat Template Output */}
        <div className="result-item-container"> {/* New class for common styling */}
          <h2 className="text-xl font-semibold mb-3">Chat Template Output</h2>
          <div dangerouslySetInnerHTML={{ __html: result.renderedChatHtml }} />
        </div>

        {/* Section for Tokenization Output */}
        <div className="result-item-container"> {/* New class for common styling */}
          <h2 className="text-xl font-semibold mb-3">Tokenization Output</h2>
          <div className="tokenization-output-container">
            <h3 className="text-lg font-medium mb-2">Tokens:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap font-mono">
              {JSON.stringify(result.tokenization.tokens, null, 2)}
            </pre>
            <h3 className="text-lg font-medium mt-4 mb-2">Token IDs:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap font-mono">
              {JSON.stringify(result.tokenization.ids, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    )}
    </main>
  );
}
