"use client";

import { useState } from "react";
import { Test } from "./action";

export default function Home() {
  const [result, setResult] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    modelId: "NousResearch/Hermes-3-Llama-3.1-8B",
    text: "",
    token: "",
  });

  const handleSubmit = async (formDataEvent: FormData) => {
    const response = await Test(
      formDataEvent.get("modelId") as string,
      formDataEvent.get("text") as string,
      formDataEvent.get("token") as string
    );
    setResult(JSON.parse(response));
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

        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Tokenize Text
        </button>
      </form>

      <div className="w-full flex flex-row gap-2 items-start justify-center">
        {Array.isArray(result) ? (
          result.map((item, index) => (
            <pre
              key={index}
              className="w-full max-w-2xl mt-8 bg-gray-100 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm"
            >
              {item}
            </pre>
          ))
        ) : (
          <pre className="w-full max-w-2xl mt-8 bg-gray-100 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
            {result}
          </pre>
        )}
      </div>
    </main>
  );
}
