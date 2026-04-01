<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { Person, PersonPayload } from '../types/person';
import { applyCpfMask, applyPhoneMask, isValidCpf, isValidEmail, onlyDigits } from '../utils/masks';

interface FormErrors {
  fullName?: string;
  email?: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
}

const props = defineProps<{
  visible: boolean;
  person: Person | null;
  submitting: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', value: { id?: number; payload: PersonPayload }): void;
}>();

const form = reactive<PersonPayload>({
  fullName: '',
  email: '',
  cpf: '',
  birthDate: '',
  phone: '',
});

const errors = reactive<FormErrors>({});

const isEditing = computed(() => Boolean(props.person));

function resetForm(): void {
  form.fullName = props.person?.fullName ?? '';
  form.email = props.person?.email ?? '';
  form.cpf = props.person ? applyCpfMask(props.person.cpf) : '';
  form.birthDate = props.person ? props.person.birthDate.slice(0, 10) : '';
  form.phone = props.person ? applyPhoneMask(props.person.phone) : '';

  errors.fullName = '';
  errors.email = '';
  errors.cpf = '';
  errors.birthDate = '';
  errors.phone = '';
}

watch(
  () => [props.visible, props.person] as const,
  () => {
    if (props.visible) resetForm();
  },
  { immediate: true },
);

function validate(): boolean {
  errors.fullName = '';
  errors.email = '';
  errors.cpf = '';
  errors.birthDate = '';
  errors.phone = '';

  if (!form.fullName.trim()) errors.fullName = 'Nome é obrigatório';
  else if (form.fullName.trim().length < 2) errors.fullName = 'Nome deve ter ao menos 2 caracteres';

  if (!form.email.trim()) errors.email = 'E-mail é obrigatório';
  else if (!isValidEmail(form.email.trim())) errors.email = 'E-mail inválido';

  if (!form.cpf.trim()) errors.cpf = 'CPF é obrigatório';
  else if (!isValidCpf(form.cpf)) errors.cpf = 'CPF inválido';

  if (!form.birthDate) errors.birthDate = 'Data de nascimento é obrigatória';
  else if (new Date(form.birthDate) > new Date()) errors.birthDate = 'Data de nascimento não pode ser futura';

  const phoneDigits = onlyDigits(form.phone);
  if (!phoneDigits) errors.phone = 'Telefone é obrigatório';
  else if (phoneDigits.length < 10 || phoneDigits.length > 11) errors.phone = 'Telefone deve ter 10 ou 11 dígitos';

  return !errors.fullName && !errors.email && !errors.cpf && !errors.birthDate && !errors.phone;
}

function onSubmit(): void {
  if (!validate()) return;

  const payload: PersonPayload = {
    fullName: form.fullName.trim(),
    email: form.email.trim().toLowerCase(),
    cpf: onlyDigits(form.cpf),
    birthDate: form.birthDate,
    phone: onlyDigits(form.phone),
  };

  emit('submit', { id: props.person?.id, payload });
}
</script>

<template>
  <div v-if="visible" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')" />
    <div class="absolute inset-0 flex items-start justify-center overflow-auto p-4 sm:py-8">
      <div class="fade-in w-full max-w-lg rounded-2xl border border-[#27272a] bg-[#18181b] shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#27272a] p-5">
          <h2 class="text-lg font-semibold text-[#e4e4e7]">
            {{ isEditing ? 'Editar Pessoa' : 'Nova Pessoa' }}
          </h2>
          <button
            type="button"
            class="rounded-lg p-1 text-[#71717a] transition hover:bg-[#27272a] hover:text-[#e4e4e7]"
            @click="$emit('close')"
          >
            ✕
          </button>
        </div>

        <form class="space-y-4 p-5" @submit.prevent="onSubmit">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#a1a1aa]">Nome <span class="text-[#ef4444]">*</span></label>
            <input
              v-model="form.fullName"
              maxlength="150"
              class="w-full rounded-lg border bg-[#0f1117] px-3.5 py-2.5 text-[#e4e4e7] placeholder-[#52525b] focus:border-[#6366f1]"
              :class="errors.fullName ? 'border-[#ef4444]' : 'border-[#27272a]'"
              placeholder="Nome completo"
            />
            <p v-if="errors.fullName" class="mt-1 text-xs text-[#ef4444]">{{ errors.fullName }}</p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#a1a1aa]">E-mail <span class="text-[#ef4444]">*</span></label>
            <input
              v-model="form.email"
              type="email"
              maxlength="254"
              class="w-full rounded-lg border bg-[#0f1117] px-3.5 py-2.5 text-[#e4e4e7] placeholder-[#52525b] focus:border-[#6366f1]"
              :class="errors.email ? 'border-[#ef4444]' : 'border-[#27272a]'"
              placeholder="exemplo@email.com"
            />
            <p v-if="errors.email" class="mt-1 text-xs text-[#ef4444]">{{ errors.email }}</p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#a1a1aa]">CPF <span class="text-[#ef4444]">*</span></label>
            <input
              v-model="form.cpf"
              maxlength="14"
              class="w-full rounded-lg border bg-[#0f1117] px-3.5 py-2.5 text-[#e4e4e7] placeholder-[#52525b] focus:border-[#6366f1]"
              :class="errors.cpf ? 'border-[#ef4444]' : 'border-[#27272a]'"
              placeholder="000.000.000-00"
              @input="form.cpf = applyCpfMask(form.cpf)"
            />
            <p v-if="errors.cpf" class="mt-1 text-xs text-[#ef4444]">{{ errors.cpf }}</p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#a1a1aa]">Data de nascimento <span class="text-[#ef4444]">*</span></label>
            <input
              v-model="form.birthDate"
              type="date"
              class="w-full rounded-lg border bg-[#0f1117] px-3.5 py-2.5 text-[#e4e4e7] focus:border-[#6366f1]"
              :class="errors.birthDate ? 'border-[#ef4444]' : 'border-[#27272a]'"
            />
            <p v-if="errors.birthDate" class="mt-1 text-xs text-[#ef4444]">{{ errors.birthDate }}</p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#a1a1aa]">Telefone <span class="text-[#ef4444]">*</span></label>
            <input
              v-model="form.phone"
              maxlength="15"
              class="w-full rounded-lg border bg-[#0f1117] px-3.5 py-2.5 text-[#e4e4e7] placeholder-[#52525b] focus:border-[#6366f1]"
              :class="errors.phone ? 'border-[#ef4444]' : 'border-[#27272a]'"
              placeholder="(00) 00000-0000"
              @input="form.phone = applyPhoneMask(form.phone)"
            />
            <p v-if="errors.phone" class="mt-1 text-xs text-[#ef4444]">{{ errors.phone }}</p>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              class="flex-1 rounded-lg bg-[#27272a] py-2.5 font-medium text-[#e4e4e7] transition hover:bg-[#3f3f46]"
              @click="$emit('close')"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#6366f1] py-2.5 font-medium text-white transition hover:bg-[#5457e5] disabled:opacity-70"
              :disabled="submitting"
            >
              <span>{{ submitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar' }}</span>
              <span v-if="submitting" class="spinner" />
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
