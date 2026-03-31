# CRUD de Pessoas - Backend

API REST para gerenciamento de pessoas usando NestJS, TypeScript, Prisma e PostgreSQL.

## Tecnologias

- **NestJS** - Framework Node.js
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **Docker** - Containerização
- **Swagger** - Documentação da API

## Estrutura do Projeto

```
backend/
├── src/
│   ├── common/
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   ├── validators/
│   │   │   └── is-valid-cpf.validator.ts
│   │   └── all-exceptions.filter.ts
│   ├── modules/
│   │   ├── health/
│   │   │   ├── health.controller.ts
│   │   │   └── health.module.ts
│   │   └── people/
│   │       ├── dtos/
│   │       │   ├── create-person.dto.ts
│   │       │   ├── update-person.dto.ts
│   │       │   └── get-people-query.dto.ts
│   │       ├── people.controller.ts
│   │       ├── people.service.ts
│   │       └── people.module.ts
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   └── config.ts
├── docker-compose.yml
├── .env.example
└── package.json
```

## Instalação

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp .env.example .env
```

3. Subir o banco PostgreSQL:
```bash
docker-compose up -d
```

4. Executar migrations do Prisma:
```bash
npx prisma migrate dev --name init
```

5. Gerar cliente Prisma:
```bash
npx prisma generate
```

## Instalação com Docker

Para subir a aplicação completa (app + banco) em Docker:

1. Garantir que Docker e Docker Compose estão instalados

2. Subir a aplicação:
```bash
docker-compose up -d
```

Isso irá:
- Criar e inicializar o banco PostgreSQL
- Compilar a aplicação
- Executar as migrations automaticamente
- Iniciar a API na porta 3000

3. Visualizar os logs:
```bash
docker-compose logs -f app
```

4. Parar a aplicação:
```bash
docker-compose down
```

Para remover também os volumes (atencão: isso deleta os dados):
```bash
docker-compose down -v
```

## Executando a Aplicação

### Desenvolvimento
```bash
npm run start:dev
```

### Produção
```bash
npm run build
npm run start:prod
```

A aplicação estará disponível em `http://localhost:3000`

## Documentação da API

A documentação Swagger está disponível em `http://localhost:3000/api`

## Endpoints

### Health Check
- `GET /health` - Verificar saúde da aplicação

### Pessoas
- `POST /people` - Criar pessoa
- `GET /people` - Listar pessoas (com paginação e filtros)
- `GET /people/:id` - Buscar pessoa por ID
- `PATCH /people/:id` - Atualizar pessoa
- `DELETE /people/:id` - Remover pessoa

## Validações

- **fullName**: Obrigatório, string
- **email**: Obrigatório, válido e único
- **cpf**: Obrigatório, válido (algoritmo CPF) e único
- **birthDate**: Obrigatória, não pode ser futura
- **phone**: Obrigatório

CPF e phone são salvos sem máscara.

## Tratamento de Erros

- 400: Dados inválidos
- 404: Recurso não encontrado
- 409: Conflito (email ou CPF duplicado)
- 500: Erro interno do servidor

## Testes

```bash
npm run test
```

## Observações Técnicas

- ValidationPipe global com whitelist e forbidNonWhitelisted
- Tratamento padronizado de erros com AllExceptionsFilter
- Paginação na listagem com page e limit
- Busca opcional por fullName, email ou cpf (case insensitive)
- Validador customizado para CPF
- Timestamps automáticos (createdAt, updatedAt)
- Relacionamento com Prisma Client gerado
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
