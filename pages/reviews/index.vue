<template>
  <div>
    <h1 class="pb-1 cat-title mb-2">Рецензии</h1>
    <div v-if="games.length" class="review-box">
      <div v-for="game in games" class="review-item mb-1">
        <img :src="game.thumbnail" alt="">
        <div>
          <NuxtLink :to="'/reviews/'+game.slug">{{game.name}}</NuxtLink>
        </div>
      </div>
      <div v-if="games.length >= 12" class="center">
        <button @click="loadReviews" class="center btn btn-dark">
          <i v-if="showLoader" class="fas fa-circle-notch fa-spin"></i>
          <span v-else>Загрузить еще</span>
        </button>
      </div>
    </div>
    <div v-else class="center">
      <i class="fas fa-circle-notch fa-spin fa-3x grey"></i>
    </div>

  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';

const games = ref([]);

onMounted((async () => {

  const {reviewGames} = await $fetch('/api/reviews');

  games.value = reviewGames

}))

const showLoader = ref(false);

const canLoad = ref(true);

async function loadReviews(){

  if(!canLoad.value){
    return
  }

  showLoader.value = true;

  const {reviewGames} = await $fetch('/api/loadReviews',
      {params: {offset: games.value.length}});

  if(reviewGames.length){
    games.value.push(...reviewGames);
  }else{
    canLoad.value = false
  }
  showLoader.value = false;
}


</script>

<style lang="scss" scoped>






</style>