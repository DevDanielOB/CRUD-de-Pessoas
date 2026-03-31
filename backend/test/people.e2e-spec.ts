import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { describe } from 'node:test';

describe('PeopleController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.person.deleteMany({}); // Limpa a tabela antes dos testes
  });

  afterAll(async () => {
    await app.close();
  });

  const personDto = {
    fullName: 'Maria Teste',
    email: 'maria@teste.com',
    cpf: '12345678901',
    birthDate: '1990-01-01',
    phone: '11999999999',
  };

  it('POST /people - deve criar uma pessoa', async () => {
    const res = await request(app.getHttpServer())
      .post('/people')
      .send(personDto)
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.fullName).toBe(personDto.fullName);
  });

  it('POST /people - deve recusar email duplicado', async () => {
    await request(app.getHttpServer())
      .post('/people')
      .send({ ...personDto, cpf: '98765432100', email: 'maria@teste.com' })
      .expect(409);
  });

  it('POST /people - deve recusar CPF duplicado', async () => {
    await request(app.getHttpServer())
      .post('/people')
      .send({ ...personDto, email: 'outra@teste.com', cpf: '12345678901' })
      .expect(409);
  });

  it('GET /people - deve listar pessoas', async () => {
    const res = await request(app.getHttpServer())
      .get('/people')
      .expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('total');
  });

  it('GET /people/:id - deve retornar pessoa existente', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/people')
      .send({ ...personDto, email: 'nova@teste.com', cpf: '11122233344' });
    const res = await request(app.getHttpServer())
      .get(`/people/${body.id}`)
      .expect(200);
    expect(res.body.email).toBe('nova@teste.com');
  });

  it('GET /people/:id - deve retornar 404 para id inexistente', async () => {
    await request(app.getHttpServer())
      .get('/people/999999')
      .expect(404);
  });

  it('PATCH /people/:id - deve atualizar pessoa', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/people')
      .send({ ...personDto, email: 'atualiza@teste.com', cpf: '22233344455' });
    const res = await request(app.getHttpServer())
      .patch(`/people/${body.id}`)
      .send({ fullName: 'Nome Atualizado' })
      .expect(200);
    expect(res.body.fullName).toBe('Nome Atualizado');
  });

  it('PATCH /people/:id - deve retornar 404 para id inexistente', async () => {
    await request(app.getHttpServer())
      .patch('/people/999999')
      .send({ fullName: 'Teste' })
      .expect(404);
  });

  it('DELETE /people/:id - deve remover pessoa', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/people')
      .send({ ...personDto, email: 'remove@teste.com', cpf: '33344455566' });
    await request(app.getHttpServer())
      .delete(`/people/${body.id}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/people/${body.id}`)
      .expect(404);
  });
});
