<template>
  <main class="center pb-2 adminHome">
    <h1 class="mt-2 left pb-1 mb-2 pl-2 pr-2 admin-title">
      Игры
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
      <div v-if="mode === 'edit'" class="flexCentered">
        <img class="pic-thumb" :src="gameToUpdate.image" alt="">
      </div>


      <div class="form-group left">
        <label for="name">Название</label>
        <input type="text" v-model.trim="gameToUpdate.name" class="form-control " id="name">
      </div>

      <div class="form-group">
        <label for="file">Постер</label>
        <input class="mr-1" ref="file" type="file" id="file" @change="onFileChange"/>
      </div>

      <div v-if="mode === 'edit'" class="flexCentered" v-for="(image, i) in gameToUpdate.images">
        <div class="pos-relative">
          <img :src="image.thumbnail" alt="">
          <button @click.prevent="removeImg(gameToUpdate.slug, image.pic)"
                  class="button block btn-dark ml-1 remove-button">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <div class="form-group">
        <label for="files">Скриншоты</label>
        <input class="mr-1" ref="files" type="file" multiple id="files"/>
      </div>
      <div class="mt-2">
        <ClientOnly>
          <video-background v-if="mode==='edit' && gameToUpdate.video"
                            :muted="true"
                            :src="gameToUpdate.video"
                            style="max-height: 200px;  height: 100vh; border-radius: 10px"
                            :autoplay="true"
                            :poster="gameToUpdate.image"
          ></video-background>
        </ClientOnly>
      </div>
      <div class="form-group">
        <label for="video">Видео</label>
        <input class="mr-1" ref="video" type="file" @change="onVideoFileChange" id="video"/>
      </div>

      <label>Об игре</label>
      <AdminTheEditor @updatedContent="updatedContent" :content="gameToUpdate.about"></AdminTheEditor>

      <div class="form-group mt-2">
        <label>Жанры</label>
        <Multiselect
            id="genres"
            v-model="gameToUpdate.genres"
            :object="false"
            mode="tags"
            valueProp="id"
            :searchable="true"
            :createTag="false"
            :options="data.genres"
            label="name"
        />
      </div>

      <div class="form-group">
        <label>Платформы</label>
        <Multiselect
            id="platforms"
            v-model="gameToUpdate.platforms"
            :object="false"
            mode="tags"
            valueProp="id"
            :searchable="true"
            :createTag="false"
            :options="data.platforms"
            label="name"
        />
      </div>

      <div class="form-group">
        <label>Разработчики</label>
        <Multiselect
            id="developers"
            v-model="gameToUpdate.developers"
            :object="false"
            mode="tags"
            valueProp="id"
            :searchable="true"
            :createTag="false"
            :options="data.developers"
            label="name"
        />
      </div>

      <div class="form-group left">
        <label for="date">Дата релиза</label>
        <Datepicker :format-locale="ru" locale="ru-RU" v-model="gameToUpdate.pickerDate" @update:modelValue="handleDate"
                    :format="format"></Datepicker>
      </div>

      <div class="form-group left">
        <label for="rate">Оценка</label>
        <input type="text" v-model.trim="gameToUpdate.rating" class="form-control " id="rate">
      </div>

      <div class="form-group left">
        <label for="sysMin">Ситемные требования (мин.)</label>
        <input type="text" v-model.trim="gameToUpdate.sysMin" class="form-control " id="sysMin">
      </div>

      <div class="form-group left">
        <label for="sysReq">Ситемные требования (рек.)</label>
        <input type="text" v-model.trim="gameToUpdate.sysReq" class="form-control " id="sysReq">
      </div>

      <div class="right mt-2 mr-2 admin-opts">
        <div>
          <label for="status" class="admin-status">Опубликовано</label>
          <input type="checkbox" v-model="gameToUpdate.status" id="status">
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
                   :data="data.games"
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
              <strong>Постер</strong>
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
            {{ row.name }}
          </table-body>
          <table-body>
            <img height="210" :src="row.thumbnail" alt="">
          </table-body>
          <table-body>
            {{ row.status ? 'Да' : 'Нет' }}
          </table-body>
          <table-body>
            <button @click.prevent="updateItem(row)" class="button block btn-dark"><i class="fas fa-edit"></i></button>
            <button @click.prevent="removeItem(row.id)" class="button block btn-dark"><i class="fas fa-trash"></i>
            </button>
          </table-body>
        </template>
      </AdminDtable>
    </ClientOnly>
  </main>
</template>
<script setup>
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import {ru} from 'date-fns/locale/index.js';
import {ref} from 'vue';
import Multiselect from '@vueform/multiselect'

const {$showToast, $postDate, $logOut} = useNuxtApp();

import {useRouter} from 'vue-router';

const router = useRouter();
const file = ref(null);
const video = ref(null);
const selectedFile = ref(null);
const selectedVideoFile = ref(null);
const files = ref(null);
const date = ref('Aug 19 2016');

const format = (date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `Selected date is ${day}/${month}/${year}`;

}

//const TheEditor1 = shallowRef(null);

definePageMeta({
  layout: 'admin'
})


const {data, error} = await useAsyncData('adminGames', () => $fetch('/api/admin/games'));


const filtering = ref([]);
const toFilter = ref(false);


const handleDate = (modelData) => {
  const datesArr = modelData.toString().split(" ");

  gameToUpdate.value.pickerDate = datesArr[1] + ' ' + datesArr[2] + ' ' + datesArr[3]

  let newDate = new Date(modelData);

  gameToUpdate.value.relStamp = newDate.getTime()

  gameToUpdate.value.releaseDate = $postDate(newDate.getTime())
}


function filter(fTerm, dir) {
  filtering.value = [fTerm, dir]
  toFilter.value = true;
}

const gameToUpdate = ref({status: true, platforms: [], genres: [], developers: []});
const showDlg = ref(false);
const mode = ref(null);

function onFileChange(e) {
  selectedFile.value = file.value.files[0];
}

function onVideoFileChange(e) {
  selectedVideoFile.value = video.value.files[0];
}

function closeModal() {
  showDlg.value = false;
  mode.value = null;
  gameToUpdate.value = {status: false};
  selectedFile.value = null;
}

function updatedContent(cont) {
  gameToUpdate.value.about = cont;
}

function updateItem(game) {
  mode.value = 'edit';
  gameToUpdate.value = {...game}
  showDlg.value = true;
}


function addItem() {
  mode.value = 'add';
  showDlg.value = true;
  gameToUpdate.value = {status: true, platforms: [], genres: [], developers: []};
}


async function storeItem() {

  const formData = new FormData();
  formData.append('data', JSON.stringify(gameToUpdate.value))

  if (selectedFile.value) {
    formData.append('file', selectedFile.value);
  }
  if (selectedVideoFile.value) {
    formData.append('video', selectedVideoFile.value);
  }

  for (let i = 0; i < files.value.files.length; i++) {
    let custFile = files.value.files[i];
    if (custFile) {
      formData.append('images[' + i + ']', custFile)
    }
  }

  try {
    $showToast('Обработка...', 'info', 2000);

    if (mode.value === 'edit') {
      const {result} = await $fetch('/api/admin/games/edit', {
        method: 'PUT',
        body: formData,
      })
      const ind = data.value.games.findIndex(item => item.id === result.id);
      data.value.games[ind] = result;
    }

    if (mode.value === 'add') {
      const {result} = await $fetch('/api/admin/games/add', {
        method: 'POST',
        body: formData,
      })
      data.value.games.unshift(result);
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

      const {id} = await $fetch('/api/admin/games/remove', {
        method: 'DELETE',
        body: formData,
      })

      data.value.games.splice(data.value.games.findIndex(item => item.id === id), 1);

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

async function removeImg(dbId, url) {
  if (confirm('Are you sure?')) {

    try {

      const formData = new FormData();
      formData.append('id', dbId);
      formData.append('url', url);

      $showToast('Обработка...', 'info', 2000);

      const {id} = await $fetch('/api/admin/games/removeImg', {
        method: 'DELETE',
        body: formData,
      })


      const index = gameToUpdate.value.images.findIndex(image => {
        return image.pic === url;
      });

      if (index > -1) {
        gameToUpdate.value.images.splice(index, 1); // 2nd parameter means remove one item only
      }

      filter(null, null);

      $showToast('Успешно удалено', 'success', 2000);

    } catch (e) {

      if (e.response.status === 403) {

        $showToast('Доступ запрешен', 'error');
        //$logOut();
        await router.replace('/404')

      }
    }
  }
}

</script>

<style scoped lang="scss">
.pos-relative {
  position: relative;
}

.remove-button {
  position: absolute;
  top: 0;
  right: 0
}
</style>

