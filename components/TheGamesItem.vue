<template>
  <div v-if="game && game.video"
       @mouseover="playVid"
       @mouseleave="stopVid" class="game-container">
    <video-background
        ref="videoB"
        :muted="true"
        :src="game.video"
        style="max-height: 200px;  height: 100vh; border-radius: 10px"
        :autoplay="false"
        :poster="game.image"
    />
    <div class="platforms-box">
      <div class="platforms">
        <i v-for="platform in game.platforms" :class="platform.class"></i>
      </div>
      <span class="game-rating">{{ game.rating }}</span>
    </div>
    <div class="game-title">
      <h2>
        <NuxtLink :to="'/game/'+game.slug">
          {{ game.name }}
        </NuxtLink>
      </h2>
    </div>
    <div class="pb-1 game-details-box" ref="gameInfo">
      <div class="game-details-container">
        <div class="d-flex mt-1 r-date">
          <span>Дата выхода:</span>
          <span>{{ game.releaseDate }}</span>
        </div>
        <div class="d-flex g-genre">
          <span>Жанр:</span>
          <div class="right">
            <template v-for="genre in game.genres">
              <NuxtLink class="genre-title" :to="'/genre/'+genre.id">
                {{ genre.name }}&nbsp;
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';

const videoB = ref(null);
const gameInfo = ref(null);

const props = defineProps({
  game: {type: Object, default: {}},
})

function playVid() {
  if (gameInfo.value) {
    gameInfo.value.style.display = 'block';
  }
  if (videoB.value) {
    videoB.value.player.play();
  }
}

function stopVid() {
  if (gameInfo.value) {
    gameInfo.value.style.display = 'none';
  }
  if (videoB.value) {
    videoB.value.player.pause();
    videoB.value.player.hide();
  }
}

</script>

<style lang="scss" scoped>


</style>