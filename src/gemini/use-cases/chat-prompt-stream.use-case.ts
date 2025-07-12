import { Content, createPartFromUri, GoogleGenAI } from '@google/genai';
import { ChatPromptDto } from '../dtos/chat-prompt.dto';
import { geminiUploadFile } from '../helpers/gemini-upload-file';

export async function chatPromptStreamUseCase(
  ai: GoogleGenAI,
  chatPromptDto: ChatPromptDto,
  history: Content[] = [],
) {
  const files = chatPromptDto.files ?? [];
  const prompt = chatPromptDto.prompt;

  const images = await geminiUploadFile(ai, files);

  const model = 'gemini-2.0-flash';
  const systemInstruction = `
      Your answer should be in markdown format
    `;

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction,
    },
    history,
  });

  return chat.sendMessageStream({
    message: [
      prompt,
      ...images.map((file) =>
        createPartFromUri(file.uri ?? '', file.mimeType ?? ''),
      ),
    ],
  });
}
