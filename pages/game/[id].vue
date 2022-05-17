<template>
  <div>

    <div v-if="pending || error" class="center">
      <i class="fas fa-circle-notch fa-spin fa-3x grey"></i>
    </div>

    <div v-else>

        <h1 class="cat-title mb-1">{{ data.game.name }}</h1>

        <TheRating :userRate="data.game.userRate" @rateChanged="rateChanged"/>

        <TheGameInfo :game="data.game"/>

        <TheComments />

    </div>

  </div>
</template>

<script setup>
const route = useRoute();

const router = useRouter();

function rateChanged(rate) {
  data.value.game.userRate = rate;
}

const {data, error, pending} = await useLazyAsyncData('game', () => $fetch('/api/game',
    {params: {id: route.params.id}}), {initialCache: false})

if (process.server && error?.value) {
  throwError(error.value)
}

watch(error, (newError) => {
  if(!!newError){
    router.replace('/404')
  }
})

const title = computed(() => 'Games portal - Игра - ' + (data.value ? data.value.game.name : '') )

useHead({
  title: title
})

</script>

<style lang="scss">


</style>