import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { BasicPromptDto } from './dtos/basic-prompt.dto';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

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

    response.setHeader('Content-Type', 'text/plain');
    response.status(HttpStatus.OK);

    for await (const chunk of stream) {
      const piece = chunk.text;
      response.write(piece);
    }

    response.end();
  }
}
