<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import BaseToast from './components/BaseToast.vue';
import PeopleFormModal from './components/PeopleFormModal.vue';
import PeopleList from './components/PeopleList.vue';
import { createPerson, deletePerson, listPeople, updatePerson } from './services/people.service';
import type { Person, PersonPayload } from './types/person';

const people = ref<Person[]>([]);
const loading = ref(false);
const error = ref('');
const search = ref('');
const isModalOpen = ref(false);
const isDeleteOpen = ref(false);
const submitting = ref(false);
const deleting = ref(false);
const selectedPerson = ref<Person | null>(null);
const toastOpen = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');

const stats = computed(() => {
  const today = new Date().toDateString();
  const createdToday = people.value.filter((person) => new Date(person.createdAt).toDateString() === today).length;
  return {
    total: people.value.length,
    today: createdToday,
    filtered: people.value.length,
    usage: `${Math.round((people.value.length / 999) * 100)}%`,
  };
});

function showToast(message: string, type: 'success' | 'error'): void {
  toastMessage.value = message;
  toastType.value = type;
  toastOpen.value = true;
}

async function fetchPeople(searchValue = search.value): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    people.value = await listPeople(searchValue);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao carregar pessoas';
  } finally {
    loading.value = false;
  }
}

function openCreateModal(): void {
  selectedPerson.value = null;
  isModalOpen.value = true;
}

function openEditModal(person: Person): void {
  selectedPerson.value = person;
  isModalOpen.value = true;
}

function openDeleteModal(person: Person): void {
  selectedPerson.value = person;
  isDeleteOpen.value = true;
}

async function handleSave(input: { id?: number; payload: PersonPayload }): Promise<void> {
  submitting.value = true;
  try {
    if (input.id) {
      await updatePerson(input.id, input.payload);
      showToast('Pessoa atualizada com sucesso', 'success');
    } else {
      await createPerson(input.payload);
      showToast('Pessoa cadastrada com sucesso', 'success');
    }
    isModalOpen.value = false;
    await fetchPeople();
  } catch (err) {
    showToast(err instanceof Error ? err.message : 'Erro ao salvar pessoa', 'error');
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(): Promise<void> {
  if (!selectedPerson.value) return;
  deleting.value = true;
  try {
    await deletePerson(selectedPerson.value.id);
    isDeleteOpen.value = false;
    showToast('Pessoa excluída com sucesso', 'success');
    await fetchPeople();
  } catch (err) {
    showToast(err instanceof Error ? err.message : 'Erro ao excluir pessoa', 'error');
  } finally {
    deleting.value = false;
  }
}

async function onSearch(): Promise<void> {
  await fetchPeople(search.value.trim());
}

async function clearSearch(): Promise<void> {
  search.value = '';
  await fetchPeople('');
}

onMounted(async () => {
  await fetchPeople();
});
</script>

<template>
  <div class="min-h-screen text-[#e4e4e7]">
    <header class="sticky top-0 z-40 border-b border-[#1e1e2e] bg-[#0f1117]/90 backdrop-blur-md">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <h1 class="text-xl font-bold">Gestão de Pessoas</h1>
        <button class="rounded-lg bg-[#6366f1] px-4 py-2 font-medium text-white transition hover:bg-[#5457e5]" @click="openCreateModal">
          Nova Pessoa
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-6">
      <div class="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          v-model="search"
          placeholder="Buscar por nome, e-mail ou CPF..."
          class="w-full rounded-lg border border-[#27272a] bg-[#0f1117] px-3.5 py-2.5 text-[#e4e4e7] placeholder-[#52525b] focus:border-[#6366f1]"
          @keyup.enter="onSearch"
        />
        <button class="rounded-lg bg-[#27272a] px-4 py-2.5 text-sm font-medium text-[#e4e4e7] hover:bg-[#3f3f46]" @click="onSearch">
          Buscar
        </button>
        <button class="rounded-lg bg-[#27272a] px-4 py-2.5 text-sm font-medium text-[#e4e4e7] hover:bg-[#3f3f46]" @click="clearSearch">
          Limpar
        </button>
        <button class="rounded-lg bg-[#27272a] px-4 py-2.5 text-sm font-medium text-[#e4e4e7] hover:bg-[#3f3f46]" @click="fetchPeople()">
          Atualizar
        </button>
      </div>

      <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="rounded-xl border border-[#27272a] bg-[#1e1e2e] p-4 text-center">
          <p class="mb-1 text-xs font-medium text-[#71717a]">Total de Pessoas</p>
          <p class="text-2xl font-bold">{{ stats.total }}</p>
        </div>
        <div class="rounded-xl border border-[#27272a] bg-[#1e1e2e] p-4 text-center">
          <p class="mb-1 text-xs font-medium text-[#71717a]">Cadastros Hoje</p>
          <p class="text-2xl font-bold text-[#6366f1]">{{ stats.today }}</p>
        </div>
        <div class="rounded-xl border border-[#27272a] bg-[#1e1e2e] p-4 text-center">
          <p class="mb-1 text-xs font-medium text-[#71717a]">Resultados</p>
          <p class="text-2xl font-bold">{{ stats.filtered }}</p>
        </div>
        <div class="rounded-xl border border-[#27272a] bg-[#1e1e2e] p-4 text-center">
          <p class="mb-1 text-xs font-medium text-[#71717a]">Espaço</p>
          <p class="text-2xl font-bold text-[#a78bfa]">{{ stats.usage }}</p>
        </div>
      </div>

      <PeopleList
        :people="people"
        :loading="loading"
        :error="error"
        :search-term="search"
        @edit="openEditModal"
        @delete="openDeleteModal"
        @retry="fetchPeople()"
      />
    </main>

    <PeopleFormModal :visible="isModalOpen" :person="selectedPerson" :submitting="submitting" @close="isModalOpen = false" @submit="handleSave" />

    <div v-if="isDeleteOpen" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isDeleteOpen = false" />
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="fade-in w-full max-w-sm rounded-2xl border border-[#27272a] bg-[#18181b] p-6 text-center">
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#450a0a] text-[#ef4444]">!</div>
          <h3 class="mb-2 text-lg font-semibold">Confirmar Exclusão</h3>
          <p class="mb-5 text-sm text-[#a1a1aa]">
            Tem certeza que deseja excluir
            <strong class="text-[#e4e4e7]">{{ selectedPerson?.fullName }}</strong>?
          </p>
          <div class="flex gap-3">
            <button class="flex-1 rounded-lg bg-[#27272a] py-2.5 font-medium hover:bg-[#3f3f46]" @click="isDeleteOpen = false">
              Cancelar
            </button>
            <button class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#dc2626] py-2.5 font-medium text-white hover:bg-[#b91c1c] disabled:opacity-70" :disabled="deleting" @click="handleDelete">
              <span>{{ deleting ? 'Excluindo...' : 'Excluir' }}</span>
              <span v-if="deleting" class="spinner" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <BaseToast v-model="toastOpen" :message="toastMessage" :type="toastType" />
  </div>
</template>
