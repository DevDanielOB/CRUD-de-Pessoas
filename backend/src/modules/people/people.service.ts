import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Person, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { CreatePersonDto } from './dtos/create-person.dto';
import { UpdatePersonDto } from './dtos/update-person.dto';
import { GetPeopleQueryDto } from './dtos/get-people-query.dto';

@Injectable()
export class PeopleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPersonDto: CreatePersonDto) {
    const { birthDate, email, cpf, ...rest } = createPersonDto;
    await this.ensureUniqueFields({ email, cpf });

    // Validar birthDate não futura
    const birth = new Date(birthDate);
    if (birth > new Date()) {
      throw new ConflictException('Data de nascimento não pode ser futura');
    }

    try {
      return await this.prisma.person.create({
        data: {
          ...rest,
          email,
          cpf,
          birthDate: birth,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        const field = error.meta.target[0];
        throw new ConflictException(`${field} já cadastrado`);
      }
      throw error;
    }
  }

  async findAll(query: GetPeopleQueryDto) {
    const { page = 1, limit = 10, fullName, email, cpf } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PersonWhereInput = {};
    if (fullName) where.fullName = { contains: fullName, mode: 'insensitive' };
    if (email) where.email = { contains: email, mode: 'insensitive' };
    if (cpf) where.cpf = { contains: cpf };

    const [people, total] = await Promise.all([
      this.prisma.person.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.person.count({ where }),
    ]);

    return {
      data: people,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const person = await this.prisma.person.findUnique({
      where: { id: Number(id) },
    });
    if (!person) {
      throw new NotFoundException('Pessoa não encontrada');
    }
    return person;
  }

  async update(id: string, updatePersonDto: UpdatePersonDto) {
    const { birthDate, ...rest } = updatePersonDto;
    const data: Partial<Person> = rest;
    const personId = Number(id);
    const existingPerson = await this.prisma.person.findUnique({
      where: { id: personId },
    });
    if (!existingPerson) {
      throw new NotFoundException('Pessoa não encontrada');
    }

    if (updatePersonDto.email || updatePersonDto.cpf) {
      await this.ensureUniqueFields(
        {
          email: updatePersonDto.email,
          cpf: updatePersonDto.cpf,
        },
        personId,
      );
    }

    if (birthDate) {
      const birth = new Date(birthDate);
      if (birth > new Date()) {
        throw new ConflictException('Data de nascimento não pode ser futura');
      }
      data.birthDate = birth;
    }

    try {
      return await this.prisma.person.update({
        where: { id: personId },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Pessoa não encontrada');
      }
      if (error.code === 'P2002') {
        const field = error.meta.target[0];
        throw new ConflictException(`${field} já cadastrado`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.person.delete({
        where: { id: Number(id) },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Pessoa não encontrada');
      }
      throw error;
    }
  }

  private async ensureUniqueFields(data: { email?: string; cpf?: string }, ignoreId?: number) {
    const orConditions: Prisma.PersonWhereInput[] = [];

    if (data.email) {
      orConditions.push({ email: { equals: data.email, mode: 'insensitive' } });
    }

    if (data.cpf) {
      orConditions.push({ cpf: data.cpf });
    }

    if (!orConditions.length) return;

    const existing = await this.prisma.person.findFirst({
      where: {
        OR: orConditions,
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
    });

    if (!existing) return;

    if (data.email && existing.email.toLowerCase() === data.email.toLowerCase()) {
      throw new ConflictException('email já cadastrado');
    }

    if (data.cpf && existing.cpf === data.cpf) {
      throw new ConflictException('cpf já cadastrado');
    }
  }
}
