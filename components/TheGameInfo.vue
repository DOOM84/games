<template>
  <ClientOnly>
    <tabs :options="{ useUrlFragment: false }" @clicked="tabClicked" @changed="tabChanged"
          nav-item-class="nav-item">
      <tab id="about" name="Об игре">
        <div class="center">
          <img class="mt-1 mb-1 w100 game-img" :src="game.image" alt="">
        </div>

        <div v-html="game.about"></div>
        <div>
          <div class="mt-2 game-info">
              <span><strong>Платформы:</strong> <template v-for="platform in game.platforms">
                    {{ platform.name }}&nbsp;
                  </template>
              </span>
            <span><strong>Жанр:</strong> <template v-for="genre in game.genres">
                    {{ genre.name }}&nbsp;
                  </template>
          </span>
            <span><strong>Разработчик:</strong> <template v-for="developer in game.developers">
                    {{ developer.name }}&nbsp;
                  </template>
          </span>
            <span><strong>Дата выхода:</strong> {{ game.releaseDate }}</span>
            <span><strong>Рейтинг Metacritic:</strong> <span class="game-rating">{{ game.rating }}</span></span>
          </div>
        </div>
      </tab>
      <tab name="Скриншоты">
        <lightgallery :settings="{
      mobileSettings:{controls: true, showCloseIcon: true, download: true},
      toggleThumb: true,
          allowMediaOverlap: true,
       speed: 500,
       plugins: [$lgZoom(), $lgThumbnail(), $lgFullScreen()],
       licenseKey: '12345_example'}">
          <a class="mr-1" v-for="image in game.images" :href="image.pic">
            <img :src="image.thumbnail"/>
          </a>
        </lightgallery>
      </tab>
      <tab name="Системные требования">
        <div class="left">
          <p><strong>Минимальные:</strong> {{ game.sysMin }}</p>
          <p><strong>Рекомендуемые:</strong> {{ game.sysReq }}</p>
        </div>
      </tab>
      <tab id="review" prefix="<span class='glyphicon glyphicon-star'></span> "
           :name="'Рецензии '+ game.reviews.length ">

        <NuxtLink class="underline white block"
                  v-if="game.reviews.length"
                  v-for="(review, ind) in game.reviews"
                  :to="{ name: 'reviews-id', params: { id: review.gameId, ind }}">
          {{ review.title }}
        </NuxtLink>
      </tab>
    </tabs>
  </ClientOnly>
</template>

<script setup>

const props = defineProps({
  game: {type: Object},
})


function tabClicked(selectedTab) {
  //console.log('Current tab re-clicked:' + selectedTab.tab.name)
}

function tabChanged(selectedTab) {
  //console.log('Tab changed to:' + selectedTab.tab.name)
}
</script>

<style lang="scss" scoped>

.game-img {
  max-width: 600px;
}

</style>