<script setup lang="ts">
import { computed } from 'vue';
import type { Person } from '../types/person';
import { formatCpf, formatDateBr, formatPhone } from '../utils/masks';

const props = defineProps<{
  people: Person[];
  loading: boolean;
  error: string;
  searchTerm: string;
  loadingMessage?: string;
}>();

defineEmits<{
  (e: 'edit', person: Person): void;
  (e: 'delete', person: Person): void;
  (e: 'retry'): void;
}>();

const hasNoResults = computed(() => !props.loading && !props.error && props.people.length === 0 && !!props.searchTerm);
const isEmpty = computed(() => !props.loading && !props.error && props.people.length === 0 && !props.searchTerm);
</script>

<template>
  <div>
    <div v-if="loading" class="rounded-xl border border-[#27272a] bg-[#18181b] p-10 text-center text-[#a1a1aa]">
      <div class="mx-auto mb-3 spinner" />
      <p>{{ loadingMessage ?? 'Carregando pessoas...' }}</p>
      <p v-if="loadingMessage" class="mt-2 text-sm text-[#71717a]">
        A primeira resposta pode demorar enquanto a instância gratuita do Render é reativada.
      </p>
    </div>

    <div v-else-if="error" class="rounded-xl border border-[#7f1d1d] bg-[#271314] p-8 text-center">
      <p class="mb-4 text-sm text-[#fca5a5]">{{ error }}</p>
      <button class="rounded-lg bg-[#dc2626] px-4 py-2 text-sm font-medium text-white hover:bg-[#b91c1c]" @click="$emit('retry')">
        Tentar novamente
      </button>
    </div>

    <div v-else-if="isEmpty" class="rounded-xl border border-[#27272a] bg-[#18181b] py-16 text-center">
      <p class="text-xl font-semibold text-[#e4e4e7]">Nenhuma pessoa cadastrada</p>
      <p class="mt-2 text-sm text-[#71717a]">Comece adicionando sua primeira pessoa à lista</p>
    </div>

    <div v-else-if="hasNoResults" class="rounded-xl border border-[#27272a] bg-[#18181b] py-16 text-center">
      <p class="text-sm text-[#71717a]">Nenhum resultado encontrado para sua busca</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <article
        v-for="person in people"
        :key="person.id"
        class="group rounded-xl border border-[#27272a] bg-[#18181b] p-5 transition hover:-translate-y-0.5 hover:shadow-xl"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="mb-1 flex items-center gap-2.5">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#a78bfa] text-sm font-semibold text-white">
                {{ person.fullName.charAt(0).toUpperCase() }}
              </div>
              <h3 class="truncate text-lg font-semibold text-[#e4e4e7]">{{ person.fullName }}</h3>
            </div>
            <p class="truncate text-sm text-[#71717a]">{{ person.email }}</p>
          </div>
          <div class="flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
            <button class="rounded-lg p-2 text-[#71717a] transition hover:bg-[#27272a] hover:text-[#6366f1]" @click="$emit('edit', person)">
              Editar
            </button>
            <button class="rounded-lg p-2 text-[#71717a] transition hover:bg-[#27272a] hover:text-[#ef4444]" @click="$emit('delete', person)">
              Excluir
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-lg bg-[#0f1117] p-3">
            <p class="mb-1 text-xs font-medium text-[#71717a]">CPF</p>
            <p class="font-mono text-sm text-[#e4e4e7]">{{ formatCpf(person.cpf) }}</p>
          </div>
          <div class="rounded-lg bg-[#0f1117] p-3">
            <p class="mb-1 text-xs font-medium text-[#71717a]">Telefone</p>
            <p class="font-mono text-sm text-[#e4e4e7]">{{ formatPhone(person.phone) }}</p>
          </div>
          <div class="rounded-lg bg-[#0f1117] p-3">
            <p class="mb-1 text-xs font-medium text-[#71717a]">Nascimento</p>
            <p class="font-mono text-sm text-[#e4e4e7]">{{ formatDateBr(person.birthDate) }}</p>
          </div>
          <div class="rounded-lg bg-[#0f1117] p-3">
            <p class="mb-1 text-xs font-medium text-[#71717a]">Cadastro</p>
            <p class="font-mono text-sm text-[#e4e4e7]">{{ formatDateBr(person.createdAt) }}</p>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
