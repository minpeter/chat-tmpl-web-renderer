// src/app/tokenizer/action.test.ts
import { Test } from './action';
// Import the mock functions from the mocked module.
// Jest's auto-mocking will replace '@huggingface/transformers' with the version
// from 'src/app/tokenizer/__mocks__/@huggingface/transformers.ts'.
import {
    mockTokenize,
    mockConvertTokensToIds,
    mockApplyChatTemplate,
    mockFromPretrained
} from '@huggingface/transformers';

// --- Test Suites ---
describe('Test function in action.ts', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset mocks before each test
    mockTokenize.mockReset();
    mockConvertTokensToIds.mockReset();
    mockApplyChatTemplate.mockReset();
    mockFromPretrained.mockClear(); // Use mockClear for mocks that return other mocks or promises
    
    // Restore mockFromPretrained's default implementation for most tests
    // (it might be changed by specific tests if needed)
    mockFromPretrained.mockResolvedValue({
      tokenize: mockTokenize,
      convert_tokens_to_ids: mockConvertTokensToIds,
      apply_chat_template: mockApplyChatTemplate,
    });

    process.env = { ...originalEnv }; // Reset process.env to a clean state for each test
    delete process.env.HF_TOKEN; 
  });

  afterAll(() => {
    process.env = originalEnv; // Restore original process.env
  });

  it('should process valid inputs and return tokenization and chat template output, setting HF_TOKEN', async () => {
    mockTokenize.mockReturnValue(['hello', 'world']);
    mockConvertTokensToIds.mockReturnValue([101, 202]);
    mockApplyChatTemplate.mockReturnValue('<div>User: hello world</div>');

    const resultString = await Test('test-model', 'hello world', 'chat-template', 'test-token');
    const result = JSON.parse(resultString);

    expect(mockFromPretrained).toHaveBeenCalledWith('test-model');
    expect(process.env.HF_TOKEN).toBe('test-token');
    expect(mockTokenize).toHaveBeenCalledWith('hello world');
    expect(mockConvertTokensToIds).toHaveBeenCalledWith(['hello', 'world']);
    expect(mockApplyChatTemplate).toHaveBeenCalledWith(
      [{ role: 'user', content: 'hello world' }],
      { chat_template: 'chat-template', tokenize: false }
    );
    expect(result.tokenizationResult).toEqual({ tokens: ['hello', 'world'], ids: [101, 202] });
    expect(result.chatTemplateOutput).toBe('<div>User: hello world</div>');
  });

  it('should handle tokenization failure gracefully', async () => {
    const tokenizationError = new Error('Tokenization failed!');
    mockTokenize.mockImplementation(() => { throw tokenizationError; });
    mockApplyChatTemplate.mockReturnValue('<div>User: error input</div>');

    const resultString = await Test('test-model', 'error input', 'chat-template', undefined);
    const result = JSON.parse(resultString);
    
    expect(result.tokenizationResult.tokens[0]).toContain('Error: Tokenization failed. Details: Tokenization failed!');
    expect(result.tokenizationResult.ids).toEqual([]);
    expect(result.chatTemplateOutput).toBe('<div>User: error input</div>'); 
    expect(process.env.HF_TOKEN).toBeUndefined();
  });

  it('should handle chat templating failure gracefully', async () => {
    const chatTemplateError = new Error('Chat templating failed!');
    mockTokenize.mockReturnValue(['hello', 'world']);
    mockConvertTokensToIds.mockReturnValue([101, 202]);
    mockApplyChatTemplate.mockImplementation(() => { throw chatTemplateError; });

    const resultString = await Test('test-model', 'hello world', 'chat-template', 'test-token');
    const result = JSON.parse(resultString);

    expect(result.chatTemplateOutput).toContain('Error: Failed to apply chat template. Details: Chat templating failed!');
    expect(result.tokenizationResult).toEqual({ tokens: ['hello', 'world'], ids: [101, 202] });
    expect(process.env.HF_TOKEN).toBe('test-token');
  });
  
  it('should not set HF_TOKEN if hfToken is undefined', async () => {
    mockTokenize.mockReturnValue(['hello']);
    mockConvertTokensToIds.mockReturnValue([101]);
    mockApplyChatTemplate.mockReturnValue('output');

    await Test('test-model', 'hello', 'template', undefined);
    expect(process.env.HF_TOKEN).toBeUndefined();
  });

  it('should unset HF_TOKEN if hfToken is an empty string after it was previously set', async () => {
    process.env.HF_TOKEN = 'previous-token'; // Simulate pre-existing token
    mockTokenize.mockReturnValue(['hello']);
    mockConvertTokensToIds.mockReturnValue([101]);
    mockApplyChatTemplate.mockReturnValue('output');
    
    await Test('test-model', 'hello', 'template', ''); // Call with empty string token
    expect(process.env.HF_TOKEN).toBeUndefined(); // Should be deleted by the logic in Test function
  });
});
