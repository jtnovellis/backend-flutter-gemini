import { GoogleGenAI } from '@google/genai';
import { BasicPromptDto } from '../dtos/basic-prompt.dto';

export async function basicPromptStreamUseCase(
  ai: GoogleGenAI,
  basicPromptDto: BasicPromptDto,
) {
  const response = await ai.models.generateContentStream({
    model: 'gemini-2.0-flash',
    contents: basicPromptDto.prompt,
    config: {
      systemInstruction: 'Your answer should be in markdown format',
    },
  });

  return response;
}
