export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function applyCpfMask(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length > 9) return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  if (digits.length > 6) return digits.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  if (digits.length > 3) return digits.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  return digits;
}

export function applyPhoneMask(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  if (digits.length > 6) return digits.replace(/(\d{2})(\d{1,5})(\d{1,4})/, '($1) $2-$3');
  if (digits.length > 2) return digits.replace(/(\d{2})(\d{1,5})/, '($1) $2');
  if (digits.length > 0) return digits.replace(/(\d{1,2})/, '($1');
  return digits;
}

export function formatCpf(value: string): string {
  return applyCpfMask(value);
}

export function formatPhone(value: string): string {
  return applyPhoneMask(value);
}

export function formatDateBr(dateInput: string | Date): string {
  const date = new Date(dateInput);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  for (let t = 9; t < 11; t++) {
    let sum = 0;
    for (let i = 0; i < t; i += 1) sum += Number(cpf[i]) * (t + 1 - i);
    const digit = ((sum * 10) % 11) % 10;
    if (digit !== Number(cpf[t])) return false;
  }
  return true;
}
