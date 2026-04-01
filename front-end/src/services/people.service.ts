import { apiRequest } from './api';
import type { PeopleResponse, Person, PersonPayload } from '../types/person';
import { onlyDigits } from '../utils/masks';

export const peopleApi = {
  request: apiRequest,
};

function buildSearchPath(query: string): string[] {
  const value = query.trim();
  if (!value) return ['/people?page=1&limit=999'];

  const encoded = encodeURIComponent(value);
  const cpfCandidate = onlyDigits(value);
  const paths = [
    `/people?page=1&limit=999&fullName=${encoded}`,
    `/people?page=1&limit=999&email=${encoded}`,
  ];
  if (cpfCandidate) {
    paths.push(`/people?page=1&limit=999&cpf=${encodeURIComponent(cpfCandidate)}`);
  }
  return paths;
}

function uniquePeople(items: Person[]): Person[] {
  const map = new Map<number, Person>();
  items.forEach((person) => map.set(person.id, person));
  return [...map.values()].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function listPeople(search = ''): Promise<Person[]> {
  const paths = buildSearchPath(search);
  const responses = await Promise.all(paths.map((path) => peopleApi.request<PeopleResponse>(path)));
  return uniquePeople(responses.flatMap((response) => response.data));
}

export async function createPerson(payload: PersonPayload): Promise<Person> {
  return peopleApi.request<Person>('/people', {
    method: 'POST',
    body: payload,
  });
}

export async function updatePerson(id: number, payload: PersonPayload): Promise<Person> {
  return peopleApi.request<Person>(`/people/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deletePerson(id: number): Promise<void> {
  await peopleApi.request(`/people/${id}`, { method: 'DELETE' });
}
