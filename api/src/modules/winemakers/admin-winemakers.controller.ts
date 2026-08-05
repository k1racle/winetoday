import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { WinemakersService } from './winemakers.service';
import { SavePersonDto } from './dto/save-person.dto';
import { SaveWineDto } from './dto/save-wine.dto';
import { SaveRegionDto } from './dto/save-region.dto';
import { SaveTerroirDto } from './dto/save-terroir.dto';
import { SaveWineryDto } from './dto/save-winery.dto';

@Controller('admin/winemakers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
export class AdminWinemakersController {
  constructor(private readonly winemakersService: WinemakersService) {}

  @Get('options')
  listOptions() {
    return this.winemakersService.listAdminOptions();
  }

  @Get('persons')
  listPersons() {
    return this.winemakersService.listAdminPersons();
  }

  @Get('persons/:id')
  personById(@Param('id') id: string) {
    return this.winemakersService.personById(id);
  }

  @Post('persons')
  createPerson(@Body() dto: SavePersonDto) {
    return this.winemakersService.createPerson(dto);
  }

  @Patch('persons/:id')
  updatePerson(@Param('id') id: string, @Body() dto: SavePersonDto) {
    return this.winemakersService.updatePerson(id, dto);
  }

  @Delete('persons/:id')
  deletePerson(@Param('id') id: string) {
    return this.winemakersService.deletePerson(id);
  }

  @Get('wines')
  listWines() {
    return this.winemakersService.listAdminWines();
  }

  @Get('wines/:id')
  wineById(@Param('id') id: string) {
    return this.winemakersService.wineById(id);
  }

  @Post('wines')
  createWine(@Body() dto: SaveWineDto) {
    return this.winemakersService.createWine(dto);
  }

  @Patch('wines/:id')
  updateWine(@Param('id') id: string, @Body() dto: SaveWineDto) {
    return this.winemakersService.updateWine(id, dto);
  }

  @Delete('wines/:id')
  deleteWine(@Param('id') id: string) {
    return this.winemakersService.deleteWine(id);
  }

  @Get('regions')
  listRegions() {
    return this.winemakersService.listAdminRegions();
  }

  @Get('regions/:id')
  regionById(@Param('id') id: string) {
    return this.winemakersService.regionById(id);
  }

  @Post('regions')
  createRegion(@Body() dto: SaveRegionDto) {
    return this.winemakersService.createRegion(dto);
  }

  @Patch('regions/:id')
  updateRegion(@Param('id') id: string, @Body() dto: SaveRegionDto) {
    return this.winemakersService.updateRegion(id, dto);
  }

  @Delete('regions/:id')
  deleteRegion(@Param('id') id: string) {
    return this.winemakersService.deleteRegion(id);
  }

  @Get('terroirs')
  listTerroirs() {
    return this.winemakersService.listAdminTerroirs();
  }

  @Get('terroirs/:id')
  terroirById(@Param('id') id: string) {
    return this.winemakersService.terroirById(id);
  }

  @Post('terroirs')
  createTerroir(@Body() dto: SaveTerroirDto) {
    return this.winemakersService.createTerroir(dto);
  }

  @Patch('terroirs/:id')
  updateTerroir(@Param('id') id: string, @Body() dto: SaveTerroirDto) {
    return this.winemakersService.updateTerroir(id, dto);
  }

  @Delete('terroirs/:id')
  deleteTerroir(@Param('id') id: string) {
    return this.winemakersService.deleteTerroir(id);
  }

  @Get('wineries')
  listWineries() {
    return this.winemakersService.listAdminWineries();
  }

  @Get('wineries/:id')
  wineryById(@Param('id') id: string) {
    return this.winemakersService.wineryById(id);
  }

  @Post('wineries')
  createWinery(@Body() dto: SaveWineryDto) {
    return this.winemakersService.createWinery(dto);
  }

  @Patch('wineries/:id')
  updateWinery(@Param('id') id: string, @Body() dto: SaveWineryDto) {
    return this.winemakersService.updateWinery(id, dto);
  }

  @Delete('wineries/:id')
  deleteWinery(@Param('id') id: string) {
    return this.winemakersService.deleteWinery(id);
  }
}
