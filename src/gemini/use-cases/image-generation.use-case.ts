import {
  ContentListUnion,
  createPartFromUri,
  GoogleGenAI,
  Modality,
} from '@google/genai';
import { geminiUploadFile } from '../helpers/gemini-upload-file';
import { ImageGenerationDto } from '../dtos/image-generation.dto';
import { v4 } from 'uuid';
import path from 'node:path';
import fs from 'node:fs';

const AI_IMAGES_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'public/ai-images',
);

interface Options {
  model?: string;
  systemInstruction?: string;
}

export interface ImageGenerationResponse {
  imageUrl: string;
  text: string;
}

export async function imageGenerationUseCase(
  ai: GoogleGenAI,
  imageGenerationDto: ImageGenerationDto,
  options?: Options,
): Promise<ImageGenerationResponse> {
  const files = imageGenerationDto.files ?? [];

  const images = await geminiUploadFile(ai, files, { transformToPng: true });

  const contents: ContentListUnion = [{ text: imageGenerationDto.prompt }];

  images.forEach((file) => {
    contents.push(createPartFromUri(file.uri ?? '', file.mimeType ?? ''));
  });

  const { model = 'gemini-2.0-flash-preview-image-generation' } = options ?? {};

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  let imageUrl = '';
  let text = '';
  const imageId = v4();

  const parts =
    (response.candidates && response.candidates[0]?.content?.parts) ?? [];

  for (const part of parts) {
    if (part.text) {
      text = part.text;
      continue;
    }
    if (!part.inlineData) {
      continue;
    }
    const imageData = part.inlineData.data!;
    const buffer = Buffer.from(imageData, 'base64');
    const imagePath = path.join(AI_IMAGES_PATH, `${imageId}.png`);
    fs.writeFileSync(imagePath, buffer);
    imageUrl = `http://localhost:3000/ai-images/${imageId}.png`;
  }

  return {
    imageUrl,
    text,
  };
}
