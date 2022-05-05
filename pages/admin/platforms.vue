<template>
  <main  class="center pb-2 adminHome" >
    <h1 class="mt-2 left pb-1 mb-2 pl-2 pr-2 admin-title">
      Платформы
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
        <input type="text" v-model.trim="platformToUpdate.name" class="form-control " id="name">
      </div>

      <div class="form-group left">
        <label for="name">Класс иконки</label>
        <input type="text" v-model.trim="platformToUpdate.class" class="form-control " id="name">
      </div>

      <div class="right mt-2 mr-2 admin-opts">
      <div>
        <label for="status" class="admin-status">Опубликовано</label>
        <input type="checkbox" v-model="platformToUpdate.status" id="status">
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
                 :data="data.platforms"
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
          <strong>Класс иконки</strong>
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
          <i class="fa-lg block" :class="row.class"></i>
          {{row.class}}

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

const {data, error} = await useAsyncData('adminPlatforms', () => $fetch('/api/admin/platforms'));

const filtering = ref([]);
const toFilter = ref(false);

function filter(fTerm, dir){
  filtering.value = [fTerm, dir]
  toFilter.value = true;
}

const platformToUpdate = ref({status: false});
const showDlg = ref(false);
const mode = ref(null);


function closeModal() {
  showDlg.value = false;
  mode.value = null;
  platformToUpdate.value = {status: false}
}

function updateItem(platform) {
  mode.value = 'edit';
  platformToUpdate.value = {...platform}
  showDlg.value = true;
}

function addItem() {
  mode.value = 'add';
  showDlg.value = true;
  platformToUpdate.value.status = false;
}

async function storeItem() {

  const formData = new FormData();
  formData.append('data', JSON.stringify(platformToUpdate.value))

  try {
    $showToast('Обработка...', 'info', 2000);

    if (mode.value === 'edit') {
      const {result} = await $fetch('/api/admin/platforms/edit', {
        method: 'PUT',
        body: formData,
      })
      const ind = data.value.platforms.findIndex(item => item.id === result.id);
      data.value.platforms[ind] = result;
    }

    if (mode.value === 'add') {
      const {result} = await $fetch('/api/admin/platforms/add', {
        method: 'POST',
        body: formData,
      })
      data.value.platforms.unshift(result);
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

async function removeItem(dbId) {
  if (confirm('Are you sure?')) {
    try {

      const formData = new FormData();
      formData.append('id', dbId);

      $showToast('Обработка...', 'info', 2000);

      const {id} = await $fetch('/api/admin/platforms/remove', {
        method: 'DELETE',
        body: formData,
      })

      data.value.platforms.splice(data.value.platforms.findIndex(item => item.id === id), 1);

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

