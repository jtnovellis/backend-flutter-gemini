import { IsString, IsNotEmpty } from 'class-validator';

export class BasicPromptDto {
  @IsString()
  @IsNotEmpty()
  prompt: string
}
