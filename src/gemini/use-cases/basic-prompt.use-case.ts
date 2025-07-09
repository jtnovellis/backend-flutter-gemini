import { GoogleGenAI } from '@google/genai';
import { BasicPromptDto } from '../dtos/basic-prompt.dto';

export async function basicPromptUseCase(
  ai: GoogleGenAI,
  basicPromptDto: BasicPromptDto,
) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: basicPromptDto.prompt,
    config: {
      systemInstruction: 'Your answer should be in markdown format',
    },
  });

  return response.text;
}
