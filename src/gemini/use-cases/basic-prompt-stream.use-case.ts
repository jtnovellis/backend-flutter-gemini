import {
  createPartFromUri,
  createUserContent,
  GoogleGenAI,
} from '@google/genai';
import { BasicPromptDto } from '../dtos/basic-prompt.dto';
import { geminiUploadFile } from '../helpers/gemini-upload-file';

export async function basicPromptStreamUseCase(
  ai: GoogleGenAI,
  basicPromptDto: BasicPromptDto,
) {
  const files = basicPromptDto.files ?? [];

  const images = await geminiUploadFile(ai, files);

  const response = await ai.models.generateContentStream({
    model: 'gemini-2.0-flash',
    contents: [
      createUserContent([
        basicPromptDto.prompt,
        ...images.map((image) => {
          return createPartFromUri(image.uri ?? '', image.mimeType ?? '');
        }),
      ]),
    ],
    config: {
      systemInstruction: 'Your answer should be in markdown format',
    },
  });

  return response;
}
