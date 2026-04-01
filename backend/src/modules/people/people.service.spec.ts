import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { PeopleService } from './people.service';

type PersonMethodsMock = {
  create: jest.Mock;
  findMany: jest.Mock;
  count: jest.Mock;
  findUnique: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  findFirst: jest.Mock;
};

type PrismaMock = {
  person: PersonMethodsMock;
};

function createPrismaMock(): PrismaMock {
  return {
    person: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
  };
}

describe('PeopleService', () => {
  let service: PeopleService;
  let prismaMock: PrismaMock;

  beforeEach(() => {
    prismaMock = createPrismaMock();
    service = new PeopleService(prismaMock as unknown as PrismaService);
  });

  it('deve criar pessoa quando nao houver duplicidade', async () => {
    prismaMock.person.findFirst.mockResolvedValue(null);
    prismaMock.person.create.mockResolvedValue({
      id: 1n,
      fullName: 'Maria Silva',
      email: 'maria@email.com',
      cpf: '12345678909',
      birthDate: new Date('1990-01-01'),
      phone: '11999999999',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const payload = {
      fullName: 'Maria Silva',
      email: 'maria@email.com',
      cpf: '12345678909',
      birthDate: '1990-01-01',
      phone: '11999999999',
    };

    const result = await service.create(payload);

    expect(result).toHaveProperty('id');
    expect(prismaMock.person.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: payload.email,
          cpf: payload.cpf,
          birthDate: expect.any(Date),
        }),
      }),
    );
  });

  it('deve rejeitar data de nascimento futura no create', async () => {
    prismaMock.person.findFirst.mockResolvedValue(null);

    await expect(
      service.create({
        fullName: 'Teste',
        email: 'teste@email.com',
        cpf: '12345678909',
        birthDate: '2999-01-01',
        phone: '11999999999',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('deve rejeitar email duplicado no create', async () => {
    prismaMock.person.findFirst.mockResolvedValue({
      id: 2n,
      email: 'duplicado@email.com',
      cpf: '12345678909',
    });

    await expect(
      service.create({
        fullName: 'Teste',
        email: 'duplicado@email.com',
        cpf: '98765432100',
        birthDate: '1990-01-01',
        phone: '11999999999',
      }),
    ).rejects.toThrow('email já cadastrado');
  });

  it('deve retornar lista paginada com meta', async () => {
    prismaMock.person.findMany.mockResolvedValue([{ id: 1n, fullName: 'Maria' }]);
    prismaMock.person.count.mockResolvedValue(1);

    const result = await service.findAll({
      page: 1,
      limit: 10,
      fullName: 'Maria',
    });

    expect(result.meta.total).toBe(1);
    expect(result.meta.totalPages).toBe(1);
    expect(prismaMock.person.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          fullName: expect.objectContaining({ contains: 'Maria' }),
        }),
      }),
    );
  });

  it('deve retornar not found no update quando id nao existir', async () => {
    prismaMock.person.findUnique.mockResolvedValue(null);

    await expect(
      service.update('999', {
        fullName: 'Novo Nome',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deve rejeitar cpf duplicado no update', async () => {
    prismaMock.person.findUnique.mockResolvedValue({
      id: 1n,
      email: 'atual@email.com',
      cpf: '12345678909',
    });
    prismaMock.person.findFirst.mockResolvedValue({
      id: 2n,
      email: 'outro@email.com',
      cpf: '11144477735',
    });

    await expect(
      service.update('1', {
        cpf: '11144477735',
      }),
    ).rejects.toThrow('cpf já cadastrado');
  });

  it('deve retornar not found no remove quando prisma receber P2025', async () => {
    prismaMock.person.delete.mockRejectedValue({ code: 'P2025' });

    await expect(service.remove('77')).rejects.toBeInstanceOf(NotFoundException);
  });
});
