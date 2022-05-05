<template>
  <div>
    <h1 class="pb-1 cat-title mb-2">Рецензии {{reviewTitle}}</h1>

    <h2 class="underline pointer" @click="openReview(i)" v-if="reviews.length" v-for="(review, i) in reviews">
      {{review.title}}
    </h2>
    <div v-else class="center">
      <i  class="fas fa-circle-notch fa-spin fa-3x grey"></i>
    </div>

    <div class="review-container mt-5">
        <div id="review">
          <transition name="bio">
            <div v-if="reviewContent || reviewInfo">
              <div v-if="reviewContent"  class="review-content" v-html="reviewContent" />
              <div class="right" v-if="reviewInfo" v-html="reviewInfo"></div>
            </div>

          </transition>
        </div>

      <TheComments v-if="commentsForReview"></TheComments>
    </div>


  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, computed} from 'vue';

const {$scrollTo} = useNuxtApp();

const reviews = ref([]);

const reviewContent = ref('');

const reviewInfo = ref('');

const route = useRoute();

const  commentsForReview = useCommentsToggle();

const reviewTitle = computed(() => reviews.value.length ? reviews.value[0].gameName : '');

const parentId = useParentAnswer();

const parentInfo = useParentInfo();

onMounted((async () => {

    const {gameReviews} = await $fetch('/api/review', {params: {id: route.params.id}});

    reviews.value = gameReviews;

    if(route.params.ind){
      openReview(route.params.ind)
    }

}))

onUnmounted(()=>{
  commentsForReview.value = null
})

function openReview(i){


  if(reviews.value[i].id === commentsForReview.value){return}

  parentInfo.value = null;
  parentId.value = null;

  commentsForReview.value = reviews.value[i].id;

  reviewContent.value = '';
  reviewInfo.value = '';

  setTimeout(()=>{
    reviewContent.value = reviews.value[i].text;
    reviewInfo.value = `<span>${reviews.value[i].author} <a target="_blank" href="${reviews.value[i].source}">Источник</a></span>`
  }, 500)

  $scrollTo('#review', 800, {offset: -50});

}


</script>

<style lang="scss" scoped>
.youtube-embed-wrapper{
  margin-top: 2rem;
  margin-bottom: 2rem;
  text-align: center!important;
}
</style>