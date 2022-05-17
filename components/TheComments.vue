<template>
  <div>
    <h2 class="mt-2 mb-0">Комментарии</h2>

    <div class="right mb-1">
      <button @click="writeComment" class="btn btn-dark">
        <span>Написать комментарий</span>
      </button>
    </div>


    <ClientOnly>
    <div v-if="pending" class="center mb-1">
      <i class="fas fa-circle-notch fa-spin fa-3x grey"></i>
    </div>

    <div v-else v-for="(comment, i) in comments" class="mb-2 comment-box" :id="comment.id">
      <TheCommentItem :comment="comment"/>
    </div>

    </ClientOnly>

    <div class="ml-1 mr-1">
      <div v-if="parentInfo" class="d-flex mb-1 center comment-reply">
        <div id="reply">
          Ответ на пост {{ parentInfo.user }} от {{ parentInfo.date }}
        </div>
        <i @click="hideReply" v-if="parentId" class="pointer fa fa-window-close"></i>
      </div>

      <textarea draggable="false" v-model.trim="commentBody" class="form-control comment-form"
                 id="commentForm" cols="30"
                rows="5"
                placeholder="Комментарий"></textarea>
    </div>
    <div class="center">
      <button @click="comment" class="btn btn-dark">Отправить</button>
    </div>

  </div>
</template>

<script setup>
import {ref, watch} from 'vue';

const {$showToast, $logOut, $scrollTo} = useNuxtApp();


const route = useRoute();

const parentId = useParentAnswer();

const parentInfo = useParentInfo();

const commentsForReview = useCommentsToggle();

const { pending, data: comments } = commentsForReview.value ?
    await useLazyAsyncData('reviewComments', () => $fetch('/api/comments/review/loadComments',
        {params: {id: commentsForReview.value}}), {initialCache: false}) :
    await useLazyAsyncData('gameComments', () => $fetch('/api/comments/game/loadComments',
        {params: {id: route.params.id}}), {initialCache: false})

const commentsAfterDel = usePostComments();

const commentBody = ref('');

const loader = ref(false);

watch(commentsAfterDel, (newVal) => {


  if (newVal) {
    comments.value = [...newVal];
  }

  commentsAfterDel.value = null;
})

watch(commentsForReview, async (newVal) => {

  if (newVal) {
    await getComments()
  }

})

watch(route, () => {
  parentInfo.value = null;
  parentId.value = null;
})

async function getComments() {
  refreshNuxtData(commentsForReview.value ? 'reviewComments' : 'gameComments')
}

function writeComment() {
  hideReply();
  $scrollTo('#commentForm', 800, {offset: -50})
}

function hideReply() {
  parentId.value = null;
  parentInfo.value = null;
}

async function comment() {

  if (!commentBody.value || commentBody.value.indexOf('\n\n\n') > 0) {
    $showToast('Введите текст, либо отформатируйте его без лишних переносов строк', 'error');
    return
  }
  if (commentBody.value.length > 8000) {
    $showToast('Содержимое Вашего комментария больше 8000 знаков', 'error');
    return
  }

  const formData = new FormData();

  formData.append('id', commentsForReview.value ? commentsForReview.value : route.params.id);

  formData.append('comment', commentBody.value);

  if (parentId.value) {
    formData.append('parentId', parentId.value)
  }

  try {
    $showToast('Отправка...', 'info', 2000);

    const {newComment, childComments} = commentsForReview.value ?
        await $fetch('/api/comments/review/comment', {
          method: 'POST',
          body: formData,
        }) :
        await $fetch('/api/comments/game/comment', {
          method: 'POST',
          body: formData,
        })


    if (parentId.value) {

      const parent = findNestedObj(comments, 'id', parentId.value);

      if (parent) {

        if (!parent.childComments) {
          parent.childComments = [];
        }

        parent.childComments = childComments.map((com) => {
          com.showAnswers = true;
          return com;
        })

        parent.showChild = true;

        parent.showAnswers = false;
      }

    } else {

      comments.value.push(newComment);

    }

    commentBody.value = '';

    hideReply();

  } catch (e) {

    if (e.response.status === 422) {
      $showToast(e.response._data.msg, 'error');
    }

    if (e.response.status === 403) {
      $showToast('Ошибка! Вы не можете добавить этот комментарий.', 'error');
    }

    if (e.response.status === 401) {
      $showToast('Ошибка! Вы не авторизованы', 'error');
      $logOut();
    }

  }
}

function findNestedObj(entireObj, keyToFind, valToFind) {
  let foundObj;
  JSON.stringify(entireObj, (_, nestedValue) => {
    if (nestedValue && nestedValue[keyToFind] === valToFind) {
      foundObj = nestedValue;
    }
    return nestedValue;
  });
  return foundObj;
}


</script>

<style scoped lang="scss">
.comment-reply{
  flex-wrap: nowrap;
  gap: 1rem
}

.comment-form{
  height: auto;
  background: #1f2937;
  color: white;
  resize: none
}

</style>