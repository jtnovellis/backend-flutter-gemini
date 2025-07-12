import {
  createPartFromUri,
  createUserContent,
  GoogleGenAI,
} from '@google/genai';
import { BasicPromptDto } from '../dtos/basic-prompt.dto';

export async function basicPromptStreamUseCase(
  ai: GoogleGenAI,
  basicPromptDto: BasicPromptDto,
) {
  const files = basicPromptDto.files ?? [];

  const images = await Promise.all(
    files.map((file) => {
      return ai.files.upload({
        file: new Blob([file.buffer]),
        config: {
          mimeType: file.mimetype.includes('image')
            ? file.mimetype
            : 'image/jpg',
        },
      });
    }),
  );

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
