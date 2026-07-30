import { Controller, Get } from '@nestjs/common';
import { RedirectsService } from './redirects.service';

@Controller()
export class RedirectsController {
  constructor(private readonly redirectsService: RedirectsService) {}

  @Get('redirects')
  list() {
    return this.redirectsService.findAll();
  }
}
