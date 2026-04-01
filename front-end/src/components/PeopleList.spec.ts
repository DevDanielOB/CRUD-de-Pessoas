// @vitest-environment jsdom
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type { Person } from '../types/person';
import PeopleList from './PeopleList.vue';

const mockPeople: Person[] = [
  {
    id: 1,
    fullName: 'Maria Silva',
    email: 'maria@email.com',
    cpf: '11144477735',
    birthDate: '1990-01-01T00:00:00.000Z',
    phone: '11987654321',
    createdAt: '2024-01-10T12:00:00.000Z',
    updatedAt: '2024-01-10T12:00:00.000Z',
  },
];

describe('PeopleList', () => {
  it('deve renderizar estado de loading', () => {
    const wrapper = mount(PeopleList, {
      props: {
        people: [],
        loading: true,
        error: '',
        searchTerm: '',
      },
    });

    expect(wrapper.text()).toContain('Carregando pessoas...');
  });

  it('deve renderizar estado de erro e emitir retry', async () => {
    const wrapper = mount(PeopleList, {
      props: {
        people: [],
        loading: false,
        error: 'Erro ao carregar',
        searchTerm: '',
      },
    });

    expect(wrapper.text()).toContain('Erro ao carregar');
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('retry')).toBeTruthy();
  });

  it('deve listar pessoas e emitir edit/delete', async () => {
    const wrapper = mount(PeopleList, {
      props: {
        people: mockPeople,
        loading: false,
        error: '',
        searchTerm: '',
      },
    });

    expect(wrapper.text()).toContain('Maria Silva');
    expect(wrapper.text()).toContain('111.444.777-35');
    expect(wrapper.text()).toContain('(11) 98765-4321');

    const buttons = wrapper.findAll('button');
    await buttons[0].trigger('click');
    await buttons[1].trigger('click');

    expect(wrapper.emitted('edit')?.[0]?.[0]).toEqual(mockPeople[0]);
    expect(wrapper.emitted('delete')?.[0]?.[0]).toEqual(mockPeople[0]);
  });
});
