<template>
  <div>
    <h1 v-if="data.game" class="cat-title mb-1">{{ data.game.name }}</h1>

    <TheRating v-if="data.game" :userRate="data.game.userRate" @rateChanged="rateChanged"/>

    <TheGameInfo v-if="data.game" :game="data.game"/>

    <div v-else class="center">
      <i class="fas fa-circle-notch fa-spin fa-3x grey"></i>
    </div>

    <TheComments v-if="data.game"></TheComments>

  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';

const route = useRoute();

const data = ref({});

function rateChanged(rate) {
  data.value.game.userRate = rate;
}

onMounted((async () => {

  const {game} = await $fetch('/api/game', {params: {id: route.params.id}});

  data.value.game = game;

}))

</script>

<style lang="scss">


</style>