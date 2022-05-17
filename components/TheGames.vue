<template>
  <div>
    <div v-if="pending || error" class="center">
      <i class="fas fa-circle-notch fa-spin fa-3x grey"></i>
    </div>
    <div v-else>
      <h1 class="pb-1 cat-title mb-2">
        <slot></slot> {{data.genreName}}
      </h1>
      <div class="games-box">
        <TheGamesItem v-for="(game, i) in data.games" :game="game"></TheGamesItem>
      </div>
      <div v-if="showLoader" class="center">
        <i class="fas fa-circle-notch fa-spin fa-4x"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted} from 'vue';

//const data = ref({genre: ''});
const scrollDebounce = ref(true);
const showLoader = ref(false)

const route = useRoute();

const router = useRouter();

const {data, error, pending} = await useLazyAsyncData('main', () => $fetch('/api/main',
    {params: {genre: route.params.id}}), {initialCache: false})

if (process.server && error?.value) {
  throwError(error.value)
}

watch(error, (newError) => {
  if(!!newError){
    router.replace('/404')
  }
})

const title = computed(() => 'Games portal - ' + (data.value && data.value.genreName ?
    ' Игры с жанром - ' + data.value.genreName  : 'Welcome!'))

useHead({
  title: title
})


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

onMounted((() => {

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