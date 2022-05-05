<template>
  <div>
    <div>
      <div class="comment-avatar">
        <img :src="comment.user.avatar" alt="">
      </div>
      <div class="comment-body">
        <small>{{ comment.user.name }} </small>
        <small class="ml-1">{{ $showDateHuman(comment.createdAt) }}</small>
        <i title="ответить" @click="writeComment($event, comment.id, comment.user.name, comment.createdAt)"
           class="pointer ml-1 fa fa-reply"></i>
        <i title="удалить" v-if="isAdmin" @click="delCom($event, comment.id)" class="pointer ml-1 fa fa-trash"></i>
        <div class="comment-text">
          <p>
            {{ comment.body }}
          </p>

          <i v-if="showLoader" class="fas fa-circle-notch fa-spin grey"></i>
          <div v-else class="w100 right">
            <small @click="loadChild" v-if="comment.showAnswers && comment.subComments > 0"
                   class="mr-1 pointer">
              Показать ответы ({{ comment.subComments }})
            </small>
          </div>
        </div>
      </div>
    </div>
    <div class="nested-comment mt-1">
      <TheCommentItem v-for="comment in comment.childComments" v-if="comment.showChild" :comment="comment"/>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';

const {$showToast, $scrollTo, $showDateHuman, $postDate, $logOut} = useNuxtApp();

const props = defineProps({

  comment: {type: Object, default: {}},

})

const route = useRoute();

const parentId = useParentAnswer();

const parentInfo = useParentInfo();

const afterDel = usePostComments();

const isAdmin = useUserAdmin();

const commentsForReview = useCommentsToggle();

const showLoader = ref(false);

function writeComment(event, parId = null, user, date) {

  parentId.value = parId;
  parentInfo.value = {user, date: $postDate(date)}
  $scrollTo('#commentForm', 800, {offset: -50});

}

async function loadChild() {

  showLoader.value = true;

  const {gameComments} = commentsForReview.value ?
      await $fetch('/api/comments/review/loadChild',
          {params: {id: commentsForReview.value, parentId: props.comment.id}}) :
      await $fetch('/api/comments/game/loadChild',
          {params: {id: route.params.id, parentId: props.comment.id}})

  props.comment.childComments = [...gameComments];

  props.comment.showChild = true;
  props.comment.showAnswers = false;

  showLoader.value = false;

}


async function delCom() {
  if (confirm('Are you sure?')) {

    if(!isAdmin.value){
      $showToast('Доступ запрещен', 'error', 2000);
      return
    }

    const formData = new FormData();

    formData.append('id', commentsForReview.value ? commentsForReview.value : route.params.id);

    formData.append('commentId', props.comment.id);

    $showToast('Отправка...', 'info', 2000);

    try {

      const {gameComments} = commentsForReview.value ?
          await $fetch('/api/comments/review/delCom', {
            method: 'POST',
            body: formData,
          }) :
          await $fetch('/api/comments/game/delCom', {
            method: 'POST',
            body: formData,
          })

      afterDel.value = gameComments;
      parentId.value = null;
      parentInfo.value = null;

      $showToast('Удалено успешно', 'success', 2000);

    } catch (e) {

      if (e.response.status === 401) {
        $showToast('Ошибка! Вы не авторизованы', 'error');
        $logOut();
      }

      if (e.response.status === 403) {
        $showToast('Доступ запрещен', 'error', 2000);
        //$logOut();
      }
    }

  }

}

</script>

<style lang="scss" scoped>


</style>