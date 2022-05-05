<template>
  <div>
    <h1 class="pb-1 cat-title mb-2">
      <slot></slot> {{data.genre}}
    </h1>
    <div v-if="data.games" class="games-box">
      <TheGamesItem v-for="(game, i) in data.games" :game="game"></TheGamesItem>
    </div>
    <div v-else class="center">
      <i class="fas fa-circle-notch fa-spin fa-3x grey"></i>
    </div>
    <div v-if="showLoader" class="center">
      <i class="fas fa-circle-notch fa-spin fa-4x"></i>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted} from 'vue';

const data = ref({genre: ''});
const scrollDebounce = ref(true);
const showLoader = ref(false)

const route = useRoute();

const handleScroll = async (e) => {

  let scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
  );
  let currentScrollHeight = window.innerHeight + window.scrollY;

  if ((scrollHeight - currentScrollHeight) < 20) {
    if (scrollDebounce.value) {
      scrollDebounce.value = false;

      await loadGames();

      setTimeout(() => {
        scrollDebounce.value = true;
      }, 500);
    }
  }
};

async function loadGames() {

  showLoader.value = true;

  const {games} = await $fetch('/api/loadGames',
      {params: {offset: data.value.games.length, genre: route.params.id}});

  if (games.length) {
    data.value.games.push(...games);
  } else {
    window.removeEventListener("scroll", handleScroll)
  }
  showLoader.value = false;
}

onMounted((async () => {

  const {games, genreName} = await $fetch('/api/main', {params: {genre: route.params.id}});

  data.value.games = games;
  data.value.genre = genreName;

  setTimeout(() => {
    window.addEventListener("scroll", handleScroll)
  }, 1000);

}))

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll)
})

</script>

<style lang="scss" scoped>


</style>