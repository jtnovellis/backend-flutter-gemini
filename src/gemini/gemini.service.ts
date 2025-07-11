import { Injectable } from '@nestjs/common';
import { BasicPromptDto } from './dtos/basic-prompt.dto';
import { GoogleGenAI } from '@google/genai';
import { basicPromptStreamUseCase } from './use-cases/basic-prompt-stream.use-case';
import { basicPromptUseCase } from './use-cases/basic-prompt.use-case';

@Injectable()
export class GeminiService {
  private readonly ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  async basicPrompt(basicPromptDto: BasicPromptDto) {
    return basicPromptUseCase(this.ai, basicPromptDto);
  }

  async basicPromptStream(basicPromptDto: BasicPromptDto) {
    return await basicPromptStreamUseCase(this.ai, basicPromptDto);
  }

  // async advancedPromptStream(basicPromptDro: BasicPromptDto) {
  //   return await basicPromptStreamUseCase(this.ai, basicPromptDro);
  // }
}
