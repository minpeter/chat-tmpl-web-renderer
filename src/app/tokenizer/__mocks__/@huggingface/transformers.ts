// src/app/tokenizer/__mocks__/@huggingface/transformers.ts

// These are the actual mock functions we'll use and want to control from our tests.
export const mockTokenize = jest.fn();
export const mockConvertTokensToIds = jest.fn();
export const mockApplyChatTemplate = jest.fn();

export const mockFromPretrained = jest.fn().mockResolvedValue({
  tokenize: mockTokenize,
  convert_tokens_to_ids: mockConvertTokensToIds,
  apply_chat_template: mockApplyChatTemplate,
});

// This is the actual mock of the AutoTokenizer class.
// Jest will replace the real AutoTokenizer with this one.
export class AutoTokenizer {
  static from_pretrained = mockFromPretrained;

  // If the class has instance methods that are used, they would be mocked here too.
  // For example:
  // tokenize(...args: any[]) { return mockTokenize(...args); }
  // convert_tokens_to_ids(...args: any[]) { return mockConvertTokensToIds(...args); }
  // apply_chat_template(...args: any[]) { return mockApplyChatTemplate(...args); }
  // However, the current usage in action.ts seems to be:
  // const tokenizer = await AutoTokenizer.from_pretrained(...);
  // tokenizer.tokenize(...);
  // So, mockFromPretrained needs to return an object with these methods.
}

// If there are other named exports from '@huggingface/transformers' that your
// code under test might be using, you might need to mock them here as well.
// For example:
// export const someOtherFunction = jest.fn();
