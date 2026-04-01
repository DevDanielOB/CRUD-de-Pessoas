import {
  applyCpfMask,
  applyPhoneMask,
  formatCpf,
  formatPhone,
  isValidCpf,
  isValidEmail,
  onlyDigits,
} from './masks';

describe('masks utils', () => {
  it('onlyDigits deve remover qualquer caractere nao numerico', () => {
    expect(onlyDigits('abc 12.34-56')).toBe('123456');
  });

  it('applyCpfMask deve formatar cpf', () => {
    expect(applyCpfMask('11144477735')).toBe('111.444.777-35');
    expect(formatCpf('11144477735')).toBe('111.444.777-35');
  });

  it('applyPhoneMask deve formatar telefone com 10 e 11 digitos', () => {
    expect(applyPhoneMask('1133334444')).toBe('(11) 3333-4444');
    expect(applyPhoneMask('11987654321')).toBe('(11) 98765-4321');
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
  });

  it('isValidEmail deve validar email', () => {
    expect(isValidEmail('pessoa@email.com')).toBe(true);
    expect(isValidEmail('email-invalido')).toBe(false);
  });

  it('isValidCpf deve validar cpf', () => {
    expect(isValidCpf('111.444.777-35')).toBe(true);
    expect(isValidCpf('11111111111')).toBe(false);
    expect(isValidCpf('12345678900')).toBe(false);
  });
});
