<template>
  <div>

    <div v-if="pending || error" class="center">
      <i  class="fas fa-circle-notch fa-spin fa-3x grey"></i>
    </div>

    <div v-else>
      <h1 class="pb-1 cat-title mb-2">Рецензии {{reviewTitle}}</h1>
      <h2 class="underline pointer" @click="openReview(i)" v-for="(review, i) in data.gameReviews">
        {{review.title}}
      </h2>
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
import {ref, onUnmounted, computed} from 'vue';

const {$scrollTo} = useNuxtApp();

const reviewContent = ref('');

const reviewInfo = ref('');

const route = useRoute();

const router = useRoute();

const  commentsForReview = useCommentsToggle();

const parentId = useParentAnswer();

const parentInfo = useParentInfo();

const {data, error, pending} = await useLazyAsyncData('review', () => $fetch('/api/review', {params: {id: route.params.id}}),
    {initialCache: false});

if (process.server && error?.value) {
  throwError(error.value)
}

watch(error, (newError) => {
  if(!!newError){
    router.replace('/404')
  }
})


watch(data, (newData) => {
  // Because posts starts out null, you won't have access
  // to its contents immediately, but you can watch it.
  openReview(route.params.ind)
})

const reviewTitle = computed(() =>data.value && data.value.gameReviews && data.value.gameReviews.length ? data.value.gameReviews[0].gameName : '');


useHead({
  title: 'Games portal - Рецензии - ' + reviewTitle.value
})


onUnmounted(()=>{
  commentsForReview.value = null
})

function openReview(i){

  if(i === undefined || (data.value && data.value.gameReviews[i].id === commentsForReview.value)){return}

  parentInfo.value = null;
  parentId.value = null;

  if(data.value && data.value.gameReviews[i].id){
    commentsForReview.value = data.value.gameReviews[i].id;
  }

  reviewContent.value = '';
  reviewInfo.value = '';

  setTimeout(()=>{
    reviewContent.value = data.value.gameReviews[i].text;
    reviewInfo.value = `<span>${data.value.gameReviews[i].author} <a target="_blank" href="${data.value.gameReviews[i].source}">Источник</a></span>`
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
