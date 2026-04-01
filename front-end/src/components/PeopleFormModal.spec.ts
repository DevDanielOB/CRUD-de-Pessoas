// @vitest-environment jsdom
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PeopleFormModal from './PeopleFormModal.vue';

describe('PeopleFormModal', () => {
  it('deve mostrar erros de validacao e nao emitir submit com formulario vazio', async () => {
    const wrapper = mount(PeopleFormModal, {
      props: {
        visible: true,
        person: null,
        submitting: false,
      },
    });

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('Nome é obrigatório');
    expect(wrapper.text()).toContain('E-mail é obrigatório');
    expect(wrapper.text()).toContain('CPF é obrigatório');
    expect(wrapper.text()).toContain('Data de nascimento é obrigatória');
    expect(wrapper.text()).toContain('Telefone é obrigatório');
    expect(wrapper.emitted('submit')).toBeUndefined();
  });

  it('deve emitir submit com payload normalizado quando formulario for valido', async () => {
    const wrapper = mount(PeopleFormModal, {
      props: {
        visible: true,
        person: null,
        submitting: false,
      },
    });

    const inputs = wrapper.findAll('input');
    await inputs[0].setValue('Maria Silva');
    await inputs[1].setValue('MARIA@EMAIL.COM');
    await inputs[2].setValue('11144477735');
    await inputs[3].setValue('1990-01-01');
    await inputs[4].setValue('11987654321');

    await wrapper.find('form').trigger('submit.prevent');

    const submitEvents = wrapper.emitted('submit');
    expect(submitEvents).toBeTruthy();
    expect(submitEvents?.[0]?.[0]).toEqual({
      id: undefined,
      payload: {
        fullName: 'Maria Silva',
        email: 'maria@email.com',
        cpf: '11144477735',
        birthDate: '1990-01-01',
        phone: '11987654321',
      },
    });
  });

  it('deve iniciar em modo edicao quando receber person', async () => {
    const wrapper = mount(PeopleFormModal, {
      props: {
        visible: true,
        submitting: false,
        person: {
          id: 7,
          fullName: 'Pessoa Editar',
          email: 'editar@teste.com',
          cpf: '11144477735',
          birthDate: '1990-01-01T00:00:00.000Z',
          phone: '11999999999',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    });

    expect(wrapper.text()).toContain('Editar Pessoa');
    const inputs = wrapper.findAll('input');
    expect((inputs[0].element as HTMLInputElement).value).toBe('Pessoa Editar');
    expect((inputs[1].element as HTMLInputElement).value).toBe('editar@teste.com');
  });
});
