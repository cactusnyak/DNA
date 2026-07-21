import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { FeedService } from './feed.service';

@ApiTags('Feed')
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  getFeed() {
    return this.feedService.buildFeed();
  }
}
