import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Person } from '../types/person';
import { createPerson, deletePerson, listPeople, peopleApi, updatePerson } from './people.service';

const basePerson = (id: number, createdAt: string): Person => ({
  id,
  fullName: `Pessoa ${id}`,
  email: `pessoa${id}@teste.com`,
  cpf: `0000000000${id}`.slice(-11),
  birthDate: '1990-01-01T00:00:00.000Z',
  phone: '11999999999',
  createdAt,
  updatedAt: createdAt,
});

describe('people.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('listPeople deve combinar resultados de busca sem duplicados e ordenar por createdAt desc', async () => {
    const requestSpy = vi
      .spyOn(peopleApi, 'request')
      .mockResolvedValueOnce({
        data: [basePerson(1, '2024-01-01T10:00:00.000Z')],
        meta: { page: 1, limit: 999, total: 1, totalPages: 1 },
      })
      .mockResolvedValueOnce({
        data: [basePerson(2, '2024-01-02T10:00:00.000Z')],
        meta: { page: 1, limit: 999, total: 1, totalPages: 1 },
      });

    const result = await listPeople('pessoa');

    expect(requestSpy).toHaveBeenCalledTimes(2);
    expect(result.map((item) => item.id)).toEqual([2, 1]);
  });

  it('createPerson deve chamar endpoint correto', async () => {
    const payload = {
      fullName: 'Maria Silva',
      email: 'maria@email.com',
      cpf: '11144477735',
      birthDate: '1990-01-01',
      phone: '11999999999',
    };
    const requestSpy = vi.spyOn(peopleApi, 'request').mockResolvedValue(basePerson(1, '2024-01-01T00:00:00.000Z'));

    await createPerson(payload);

    expect(requestSpy).toHaveBeenCalledWith('/people', {
      method: 'POST',
      body: payload,
    });
  });

  it('updatePerson deve chamar endpoint correto', async () => {
    const payload = {
      fullName: 'Maria Silva',
      email: 'maria@email.com',
      cpf: '11144477735',
      birthDate: '1990-01-01',
      phone: '11999999999',
    };
    const requestSpy = vi.spyOn(peopleApi, 'request').mockResolvedValue(basePerson(7, '2024-01-01T00:00:00.000Z'));

    await updatePerson(7, payload);

    expect(requestSpy).toHaveBeenCalledWith('/people/7', {
      method: 'PATCH',
      body: payload,
    });
  });

  it('deletePerson deve chamar endpoint correto', async () => {
    const requestSpy = vi.spyOn(peopleApi, 'request').mockResolvedValue(undefined);

    await deletePerson(15);

    expect(requestSpy).toHaveBeenCalledWith('/people/15', { method: 'DELETE' });
  });
});
