<template>
  <main  class="center pb-2 adminHome" >

    <h1 class="mt-2 left pb-1 mb-2 pl-2 pr-2 admin-title">Пользователи</h1>

    <div class="right">
      <button
          type="button"
          class="button btn-dark"

          @click.prevent="addItem">
        Добавить
      </button>
    </div>

    <AdminModalWrap @closeDlg="closeModal" mWidth="1000px" origWidth="100%" :showDlg="showDlg">

      <div v-if="mode === 'edit'" class="flexCentered">
        <img :src="userToUpdate.photoURL" alt="">
      </div>
      <div class="form-group">
        <label for="login">Имя пользователя</label>
        <input type="text" v-model="userToUpdate.displayName" class="form-control " id="login">
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" v-model="userToUpdate.email" class="form-control " id="email">
      </div>
      <div class="form-group">
        <label for="file">Аватар</label>
        <input class="mr-1" ref="file" type="file" id="file" @change="onFileChange"/>
      </div>
      <div class="form-group">
        <label for="password">Пароль</label>
        <input type="password" v-model.trim="userToUpdate.password" class="form-control " id="password">
      </div>
      <div class="form-group">
        <label for="password_confirmation">Пароль еще раз</label>
        <input type="password" v-model.trim="userToUpdate.passwordConfirmation" class="form-control"
               id="password_confirmation">
      </div>
      <div v-if="userToUpdate.customClaims" class="right">
        <label for="role">Администратор</label>
        <input type="checkbox" v-model="userToUpdate.customClaims.admin" id="role">
      </div>
      <div class="right">
        <label for="status">Заблокирован</label>
        <input type="checkbox" v-model="userToUpdate.disabled" id="status">
      </div>

      <button
          type="button"
          class="btn btn-dark"
          @click.prevent="storeItem">
        Сохранить
      </button>
    </AdminModalWrap>

    <ClientOnly>
    <AdminDtable @endFilter="toFilter = false"
                 :data="data.users"
                 :toFilter="toFilter"
                 :filtering="filtering"
                 :toSearch="['displayName', 'email']">
      <template #thead>
        <table-head>
          <div class="flexCentered">
            <strong>Имя пользователя</strong>
            <i @click.self="filter('displayName', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
            <i @click.self="filter('displayName', 'desc')" class="fa fa-caret-down pointer"></i>
          </div>
        </table-head>
        <table-head>
        <div class="flexCentered">
          <strong>Аватар</strong>
        </div>
        </table-head>
        <table-head>
          <div class="flexCentered">
            <strong>Email</strong>
            <i @click.self="filter('email', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
            <i @click.self="filter('email', 'desc')" class="fa fa-caret-down pointer"></i>
          </div>
        </table-head>

        <table-head>
          <div class="flexCentered">
            <strong>Заблокирован</strong>
          </div>
        </table-head>
        <table-head>
          <div class="flexCentered">
            <strong>Администратор</strong>
          </div>
        </table-head>
        <table-head/>
      </template>

      <template #rows="{row}">
        <table-body>
            {{ row.displayName }}
        </table-body>
        <table-body>
          <img :src="row.photoURL" alt="">
        </table-body>
        <table-body>
          {{ row.email }}
        </table-body>
        <table-body>
          {{ row.disabled ? 'Да' : 'Нет' }}
        </table-body>
        <table-body>
           {{ row.customClaims['admin'] ? 'Да' : 'Нет' }}
        </table-body>
        <table-body>
          <button @click.prevent="updateItem(row)" class="button block btn-dark"><i class="fas fa-edit"></i></button>
          <button @click.prevent="removeItem(row.uid)" class="button block btn-dark"><i class="fas fa-trash"></i></button>
        </table-body>
      </template>
    </AdminDtable>
    </ClientOnly>

  </main>
</template>

<script setup>
import {ref} from 'vue';

const { $showToast, $logOut} = useNuxtApp();
import {useRouter} from 'vue-router';

const router = useRouter();

definePageMeta({
  layout: 'admin'
})

useMeta({
  title: 'Панель управления - Пользователи'
})

const filtering = ref([]);
const toFilter = ref(false);
const selectedFile = ref(null);
const file = ref(null);


function filter(fTerm, dir) {
  filtering.value = [fTerm, dir]
  toFilter.value = true;
}

const {data, error} = await useAsyncData('adminUsers', () => $fetch('/api/admin/users'));

const userToUpdate = ref({customClaims: {admin: false}, disabled: false});
const showDlg = ref(false);
const mode = ref(null);

function onFileChange(e) {
  selectedFile.value = file.value.files[0];
}

function closeModal() {
  showDlg.value = false;
  mode.value = null;
  userToUpdate.value = {customClaims: {admin: false}, disabled: false};
  selectedFile.value = null;
}

function updateItem(user) {
  mode.value = 'edit';
  userToUpdate.value = {
    ...user,
  }
  showDlg.value = true;
}

function addItem() {
  mode.value = 'add';
  showDlg.value = true;
}

async function storeItem() {

  const formData = new FormData();

  if (selectedFile.value) {
    formData.append('file', selectedFile.value);
  }

  if(!userToUpdate.value.password || userToUpdate.value.password === ''){
    delete userToUpdate.value.password;
  }

  if(!userToUpdate.value.passwordConfirmation || userToUpdate.value.passwordConfirmation === ''){
    delete userToUpdate.value.passwordConfirmation;
  }

  formData.append('data', JSON.stringify(userToUpdate.value));

  try {
    $showToast('Обработка...', 'info', 2000);

    if (mode.value === 'edit') {
      const {result} = await $fetch('/api/admin/users/edit', {
        method: 'PUT',
        body: formData,
      })
      const ind = data.value.users.findIndex(item => item.uid === result.uid);

      delete userToUpdate.value.password;
      delete userToUpdate.value.passwordConfirmation;

      data.value.users[ind] = result;
    }

    if (mode.value === 'add') {
      const {result} = await $fetch('/api/admin/users/add', {
        method: 'POST',
        body: formData,
      })

      userToUpdate.value.uid = result.uid;

      delete userToUpdate.value.password;
      delete userToUpdate.value.passwordConfirmation;

      data.value.users.unshift(result);

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

async function removeItem(userId) {


  if (confirm('Are you sure?')) {

    try {
      const formData = new FormData();

      formData.append('data', JSON.stringify({id: userId}))

      $showToast('Обработка...', 'info', 2000);

      const {id} = await $fetch('/api/admin/users/remove', {
        method: 'DELETE',
        body: formData,
      })

      data.value.users.splice(data.value.users.findIndex(item => item.uid === id), 1);

      filter(null, null);

      $showToast('Успешно удалено', 'success', 2000);

    } catch (e) {

      if (e.response.status === 403) {
       // $logOut();
        $showToast('Доступ запрещен', 'error');

        await router.replace('/404')

      }
    }

  }
}

</script>