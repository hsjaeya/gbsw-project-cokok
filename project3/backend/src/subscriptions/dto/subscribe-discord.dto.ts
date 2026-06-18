import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class SubscribeDiscordDto {
  @ApiProperty({ example: 'https://discord.com/api/webhooks/...' })
  @IsUrl()
  discordWebhookUrl: string;
}
