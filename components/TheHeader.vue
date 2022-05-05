<template>
  <header>
    <div class="menu-toggle">
      <i @click="openNav" class="fas fa-bars fa-lg pointer white"></i>
    </div>

    <div class="header-box">
      <NuxtLink to="/">
        <img src="/img/logo.png" alt="">
      </NuxtLink>

      <div class="search-container relative">
        <input v-model.trim="term" class="search-input" @input="search" type="text">

        <div v-click-outside="onClickOutside" class="results-box">
          <div v-if="showLoader" class="results-loader">
            <i class="fas fa-circle-notch fa-spin grey"></i>
          </div>
          <transition name="bio">
            <ul v-if="searchResults.length" class="search-results-list">
              <li v-for="res in searchResults" class="mb-1">
                <div class="d-flex search-results-list-item">
                  <img :src="res.thumbnail" alt="">
                  <NuxtLink class="white" :to="'/game/'+res.id">{{ res.name }}</NuxtLink>
                </div>
              </li>
            </ul>
          </transition>
        </div>
      </div>
      <NuxtLink v-if="!isLoggedIn" :to="{ name: 'auth', params: { prevRoute: $route.path }}" class="white">

        Вход
      </NuxtLink>
      <span v-else @click="logOut" class="pointer">
        Выход
      </span>
    </div>
  </header>
</template>

<script setup>
import {ref, watch} from "vue";
const {$logOut} = useNuxtApp();
const showLoader = ref(false);
const searchResults = ref([]);
const isLoggedIn = useLoggedIn();
const term = ref('');

const route = useRoute();

const emit = defineEmits(['toggleNav'])


function onClickOutside() {
  searchResults.value = [];
}

function openNav() {
  emit('toggleNav', true);
}

function closeNav() {
   emit('toggleNav', false);
}

function logOut() {
  $logOut();
}

watch(route, () => {
  closeNav();
  searchResults.value = [];
})

watch(term, () => {
  if (!term.value) {
    searchResults.value = [];
  }
})

async function search(event) {

  const toSearch = term.value.toLowerCase()
      .replace(/[^\w\s]/gi, '')

  if (!toSearch) return;

  showLoader.value = true;
  const {results} = await $fetch('/api/search',
      {params: {term: toSearch}});

  searchResults.value = [...results];
  showLoader.value = false;
}


</script>

<style scoped>

</style>