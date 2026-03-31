import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PeopleService } from './people.service';
import { CreatePersonDto } from './dtos/create-person.dto';
import { UpdatePersonDto } from './dtos/update-person.dto';
import { GetPeopleQueryDto } from './dtos/get-people-query.dto';

@ApiTags('people')
@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova pessoa' })
  @ApiResponse({ status: 201, description: 'Pessoa criada com sucesso' })
  @ApiResponse({ status: 409, description: 'Conflito - email ou CPF já cadastrado' })
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.peopleService.create(createPersonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pessoas com paginação e filtros' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'fullName', required: false, type: String })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'cpf', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de pessoas' })
  findAll(@Query() query: GetPeopleQueryDto) {
    return this.peopleService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pessoa por ID' })
  @ApiParam({ name: 'id', description: 'ID da pessoa' })
  @ApiResponse({ status: 200, description: 'Pessoa encontrada' })
  @ApiResponse({ status: 404, description: 'Pessoa não encontrada' })
  findOne(@Param('id') id: string) {
    return this.peopleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pessoa' })
  @ApiParam({ name: 'id', description: 'ID da pessoa' })
  @ApiResponse({ status: 200, description: 'Pessoa atualizada' })
  @ApiResponse({ status: 404, description: 'Pessoa não encontrada' })
  @ApiResponse({ status: 409, description: 'Conflito - email ou CPF já cadastrado' })
  update(@Param('id') id: string, @Body() updatePersonDto: UpdatePersonDto) {
    return this.peopleService.update(id, updatePersonDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover pessoa' })
  @ApiParam({ name: 'id', description: 'ID da pessoa' })
  @ApiResponse({ status: 200, description: 'Pessoa removida' })
  @ApiResponse({ status: 404, description: 'Pessoa não encontrada' })
  remove(@Param('id') id: string) {
    return this.peopleService.remove(id);
  }
}