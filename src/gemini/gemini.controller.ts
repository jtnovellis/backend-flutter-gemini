import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { BasicPromptDto } from './dtos/basic-prompt.dto';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ChatPromptDto } from './dtos/chat-prompt.dto';
import { GenerateContentResponse } from '@google/genai';
import { ImageGenerationDto } from './dtos/image-generation.dto';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  async outputStreamResponse(
    response: Response,
    stream: AsyncGenerator<GenerateContentResponse, any, any>,
  ) {
    response.setHeader('Content-Type', 'text/plain');
    response.status(HttpStatus.OK);

    let buffer = '';

    for await (const chunk of stream) {
      const piece = chunk.text;
      buffer += piece;
      response.write(piece);
    }

    response.end();
    return buffer;
  }

  @Post('basic-prompt')
  basicPrompt(@Body() basicPromptDto: BasicPromptDto) {
    return this.geminiService.basicPrompt(basicPromptDto);
  }

  @Post('basic-prompt-stream')
  @UseInterceptors(FilesInterceptor('files'))
  async basicPromptStream(
    @Body() basicPromptDto: BasicPromptDto,
    @Res() response: Response,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    basicPromptDto.files = files;
    const stream = await this.geminiService.basicPromptStream(basicPromptDto);

    void this.outputStreamResponse(response, stream);
  }

  @Post('chat-stream')
  @UseInterceptors(FilesInterceptor('files'))
  async chatStream(
    @Body() chatPromptDto: ChatPromptDto,
    @Res() response: Response,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    chatPromptDto.files = files;
    const stream = await this.geminiService.chatStream(chatPromptDto);

    const data = await this.outputStreamResponse(response, stream);

    const geminiMessage = {
      role: 'model',
      parts: [{ text: data }],
    };

    const userMessage = {
      role: 'user',
      parts: [{ text: chatPromptDto.prompt }],
    };

    this.geminiService.saveMessage(chatPromptDto.chatId, userMessage);
    this.geminiService.saveMessage(chatPromptDto.chatId, geminiMessage);
  }

  @Get('chat-histoty/:chatId')
  getChatHistory(@Param('chatId') chatId: string) {
    return this.geminiService.getChatHistory(chatId).map((message) => ({
      role: message.role,
      parts: message.parts,
      text: message.parts?.map((part) => part.text).join(''),
    }));
  }

  @Post('image-generation')
  @UseInterceptors(FilesInterceptor('files'))
  async imageGeneration(
    @Body() imageGenerationDto: ImageGenerationDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    imageGenerationDto.files = files;

    const { imageUrl, text } =
      await this.geminiService.imageGeneration(imageGenerationDto);

    return {
      imageUrl,
      text,
    };
  }
}
