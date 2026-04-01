export interface Person {
  id: number;
  fullName: string;
  email: string;
  cpf: string;
  birthDate: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface PeopleMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PeopleResponse {
  data: Person[];
  meta: PeopleMeta;
}

export interface PersonPayload {
  fullName: string;
  email: string;
  cpf: string;
  birthDate: string;
  phone: string;
}
