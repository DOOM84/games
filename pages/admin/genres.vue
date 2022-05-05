<template>
  <main  class="center pb-2 adminHome" >
    <h1 class="mt-2 left pb-1 mb-2 pl-2 pr-2 admin-title">
      Жанры
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

      <div class="form-group left">
        <label for="name">Название</label>
        <input type="text" v-model.trim="genreToUpdate.name" class="form-control " id="name">
      </div>

      <div class="right mt-2 mr-2 admin-opts">
      <div>
        <label for="status" class="admin-status">Опубликовано</label>
        <input type="checkbox" v-model="genreToUpdate.status" id="status">
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
                 :data="data.genres"
                 :toFilter="toFilter"
                 :filtering="filtering"
                 :toSearch="['name']">
      <template #thead>
        <table-head>
          <div class="flexCentered">
            <strong>Название</strong>
            <i @click.self="filter('name', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
            <i @click.self="filter('name', 'desc')" class="fa fa-caret-down pointer"></i>
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
          {{row.name}}
        </table-body>
        <table-body>
          {{ row.status ? 'Да': 'Нет' }}
        </table-body>
        <table-body>
          <button @click.prevent="updateItem(row)" class="button block btn-dark"><i class="fas fa-edit"></i></button>
          <button @click.prevent="removeItem(row.id)" class="button block btn-dark"><i class="fas fa-trash"></i></button>
        </table-body>
      </template>
    </AdminDtable>
    </ClientOnly>
  </main>
</template>
<script setup>
import {ref} from 'vue';
const {$showToast, $logOut} = useNuxtApp();
import {useRouter} from 'vue-router';
const router = useRouter();

definePageMeta({
  layout: 'admin'
})

const {data, error} = await useAsyncData('adminGenres', () => $fetch('/api/admin/genres'));

const filtering = ref([]);
const toFilter = ref(false);

function filter(fTerm, dir){
  filtering.value = [fTerm, dir]
  toFilter.value = true;
}

const genreToUpdate = ref({status: false});
const showDlg = ref(false);
const mode = ref(null);


function closeModal() {
  showDlg.value = false;
  mode.value = null;
  genreToUpdate.value = {status: false}
}

function updateItem(genre) {
  mode.value = 'edit';
  genreToUpdate.value = {...genre}
  showDlg.value = true;
}

function addItem() {
  mode.value = 'add';
  showDlg.value = true;
  genreToUpdate.value.status = false;
}

async function storeItem() {

  const formData = new FormData();
  formData.append('data', JSON.stringify(genreToUpdate.value))

  try {
    $showToast('Обработка...', 'info', 2000);

    if (mode.value === 'edit') {
      const {result} = await $fetch('/api/admin/genres/edit', {
        method: 'PUT',
        body: formData,
      })
      const ind = data.value.genres.findIndex(item => item.id === result.id);
      data.value.genres[ind] = result;
    }

    if (mode.value === 'add') {
      const {result} = await $fetch('/api/admin/genres/add', {
        method: 'POST',
        body: formData,
      })
      data.value.genres.unshift(result);
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

      //throw e

      await router.replace('/404');

    } else {

      $showToast('Ошибка', 'error', 2000);

    }

  }
}

async function removeItem(dbId) {
  if (confirm('Are you sure?')) {
    try {

      const formData = new FormData();
      formData.append('id', dbId);

      $showToast('Обработка...', 'info', 2000);

      const {id} = await $fetch('/api/admin/genres/remove', {
        method: 'DELETE',
        body: formData,
      })

      data.value.genres.splice(data.value.genres.findIndex(item => item.id === id), 1);

      filter(null, null);

      $showToast('Успешно удалено', 'success', 2000);

    } catch (e) {

      if (e.response.status === 403) {

        $showToast('Доступ запрешен', 'error');

        await router.replace('/404')

      }
    }
  }
}

</script>

