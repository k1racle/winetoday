import { Controller, Get, Param, Query } from '@nestjs/common';
import { WinemakersService } from './winemakers.service';
import { ListWinemakersDto } from './dto/list-winemakers.dto';
import { ListWinesDto } from './dto/list-wines.dto';
import { ListWineriesDto } from './dto/list-wineries.dto';
import { ListRegionsDto } from './dto/list-regions.dto';
import { ListTerroirsDto } from './dto/list-terroirs.dto';
import { SearchWinepediaDto } from './dto/search-winepedia.dto';

@Controller()
export class WinemakersController {
  constructor(private readonly winemakersService: WinemakersService) {}

  @Get('winemakers')
  listPersons(@Query() query: ListWinemakersDto) {
    return this.winemakersService.listPersons(query);
  }

  @Get('winemakers/:slug')
  personBySlug(@Param('slug') slug: string) {
    return this.winemakersService.personBySlug(slug);
  }

  @Get('wines')
  listWines(@Query() query: ListWinesDto) {
    return this.winemakersService.listWines(query);
  }

  @Get('wines/:slug')
  wineBySlug(@Param('slug') slug: string) {
    return this.winemakersService.wineBySlug(slug);
  }

  @Get('regions')
  listRegions(@Query() query: ListRegionsDto) {
    return this.winemakersService.listRegions(query);
  }

  @Get('regions/map')
  regionsMap() {
    return this.winemakersService.regionsMap();
  }

  @Get('regions/:slug')
  regionBySlug(@Param('slug') slug: string) {
    return this.winemakersService.regionBySlug(slug);
  }

  @Get('wineries')
  listWineries(@Query() query: ListWineriesDto) {
    return this.winemakersService.listWineries(query);
  }

  @Get('wineries/:slug')
  wineryBySlug(@Param('slug') slug: string) {
    return this.winemakersService.wineryBySlug(slug);
  }

  @Get('terroirs')
  listTerroirs(@Query() query: ListTerroirsDto) {
    return this.winemakersService.listTerroirs(query);
  }

  @Get('terroirs/:slug')
  terroirBySlug(@Param('slug') slug: string) {
    return this.winemakersService.terroirBySlug(slug);
  }

  @Get('winepedia/search')
  search(@Query() query: SearchWinepediaDto) {
    return this.winemakersService.search(query);
  }
}
