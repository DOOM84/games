<template>
  <main class="center pb-2 adminHome">
    <h1 class="mt-2 left pb-1 mb-2 pl-2 pr-2 admin-title">
      Рецензии
    </h1>

    <div class="right">
      <button
          type="button"
          class="button btn-dark"

          @click.prevent="addItem">
        Добавить
      </button>
    </div>

    <AdminModalWrap @closeDlg="closeModal" mWidth="1000px" origWidth="100%" :showDlg="showDlg">

      <div class="form-group mt-2">
        <label>Игра</label>
        <Multiselect
            v-model="reviewToUpdate.gameId"
            :options="data.games"
            :searchable="true"
            valueProp="id"
            label="name"
            placeholder="Выберите игру"></Multiselect>
      </div>

      <div class="form-group left">
        <label for="author">Название рецензии</label>
        <input type="text" v-model.trim="reviewToUpdate.title" class="form-control " id="author">
      </div>

      <label>Рецензия</label>
      <AdminTheEditor @updatedContent="updatedContent" :content="reviewToUpdate.text"></AdminTheEditor>

      <div class="form-group left">
        <label for="author">Автор</label>
        <input type="text" v-model.trim="reviewToUpdate.author" class="form-control " id="author">
      </div>

      <div class="form-group left">
        <label for="author">Источник</label>
        <input type="text" v-model.trim="reviewToUpdate.source" class="form-control " id="author">
      </div>

      <div class="right mt-2 mr-2 admin-opts">
        <div>
          <label for="status" class="admin-status">Опубликовано</label>
          <input type="checkbox" v-model="reviewToUpdate.status" id="status">
        </div>

        <button
            type="button"
            class="button btn-dark"
            @click.prevent="storeItem">
          Сохранить
        </button>
      </div>
    </AdminModalWrap>

        <ClientOnly>
        <AdminDtable @endFilter="toFilter = false"
                     :data="data.reviews"
                     :toFilter="toFilter"
                     :filtering="filtering"
                     :toSearch="['name', 'author']">
          <template #thead>
            <table-head>
              <div class="flexCentered">
                <strong>Игра</strong>
                <i @click.self="filter('gameName', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
                <i @click.self="filter('gameName', 'desc')" class="fa fa-caret-down pointer"></i>
              </div>
            </table-head>
            <table-head>
              <div class="flexCentered">
                <strong>Название рецензии</strong>
                <i @click.self="filter('title', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
                <i @click.self="filter('title', 'desc')" class="fa fa-caret-down pointer"></i>
              </div>
            </table-head>
            <table-head>
              <div class="flexCentered">
                <strong>Автор</strong>
                <i @click.self="filter('author', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
                <i @click.self="filter('author', 'desc')" class="fa fa-caret-down pointer"></i>
              </div>
            </table-head>
            <table-head>
              <div class="flexCentered">
                <strong>Опубликовано</strong>
                <i @click.self="filter('status', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
                <i @click.self="filter('status', 'desc')" class="fa fa-caret-down pointer"></i>
              </div>
            </table-head>
            <table-head/>
          </template>

          <template #rows="{row}">
            <table-body>
              {{row.gameName}}
            </table-body>
            <table-body>
              {{row.title}}
            </table-body>
            <table-body>
              {{row.author}}
            </table-body>
            <table-body>
              {{ row.status ? 'Да': 'Нет' }}
            </table-body>
            <table-body>
              <button @click.prevent="updateItem(row)" class="button block btn-dark"><i class="fas fa-edit"></i></button>
              <button @click.prevent="removeItem(row.id, row.gameId)" class="button block btn-dark"><i class="fas fa-trash"></i></button>
            </table-body>
          </template>
        </AdminDtable>
        </ClientOnly>
  </main>
</template>
<script setup>
import {ref} from 'vue';
import Multiselect from '@vueform/multiselect'
const {$showToast, $logOut} = useNuxtApp();

const router = useRouter();

definePageMeta({
  layout: 'admin'
})

const {data, error} = await useAsyncData('adminReviews', () => $fetch('/api/admin/reviews'));

const filtering = ref([]);
const toFilter = ref(false);

function filter(fTerm, dir){
  filtering.value = [fTerm, dir]
  toFilter.value = true;
}

const reviewToUpdate = ref({status: true, gameId:null});
const showDlg = ref(false);
const mode = ref(null);


function closeModal() {
  showDlg.value = false;
  mode.value = null;
  reviewToUpdate.value = {status: false};
}

function updatedContent(cont){
  reviewToUpdate.value.text = cont;
}

function updateItem(review) {
  mode.value = 'edit';
  reviewToUpdate.value = {...review}
  showDlg.value = true;
}


function addItem() {
  mode.value = 'add';
  showDlg.value = true;
  reviewToUpdate.value = {status: true, gameId: null};
}


async function storeItem() {

  const formData = new FormData();
  formData.append('data', JSON.stringify(reviewToUpdate.value))

  try {
    $showToast('Обработка...', 'info', 2000);

    if (mode.value === 'edit') {
      const {result} = await $fetch('/api/admin/reviews/edit', {
        method: 'PUT',
        body: formData,
      })
      const ind = data.value.reviews.findIndex(item => item.id === result.id);
      data.value.reviews[ind] = result;
    }

    if (mode.value === 'add') {
      const {result} = await $fetch('/api/admin/reviews/add', {
        method: 'POST',
        body: formData,
      })
      data.value.reviews.unshift(result);
    }

    filter(null, null);

    closeModal();

    $showToast('Сохранено успешно', 'success', 2000);

  } catch (e) {

    if (e.response.status === 422) {

      $showToast(e.response._data.msg, 'error');

    } else if (e.response.status === 403) {

      $showToast('Доступ запрещен', 'error');

      $logOut();

      await router.replace('/404');

    } else {

      $showToast('Ошибка', 'error', 2000);

    }

  }
}

async function removeItem(dbId, gameId) {
  if (confirm('Are you sure?')) {
    try {

      const formData = new FormData();
      formData.append('id', dbId);
      formData.append('gameId', gameId);

      $showToast('Обработка...', 'info', 2000);

      const {id} = await $fetch('/api/admin/reviews/remove', {
        method: 'DELETE',
        body: formData,
      })

      data.value.reviews.splice(data.value.reviews.findIndex(item => item.id === id), 1);

      filter(null, null);

      $showToast('Успешно удалено', 'success', 2000);

    } catch (e) {

      if (e.response.status === 403) {

        $showToast('Доступ запрешен', 'error');

        $logOut();

        await router.replace('/404')

      }
    }
  }
}

</script>

<style scoped lang="scss" >
.pos-relative{
  position: relative;
}

.remove-button{
  position: absolute;
  top: 0;
  right: 0
}
</style>

