<template>
  <div class="upload-avatar">
    <input ref="file" type="file" class="ava-upload" @change="onFileChange"/>
    <button class="btn-dark ava-upload__button" @click="onUploadFile"
            :disabled="!selectedFile">
      Загрузить
    </button>
  </div>
</template>

<script setup>
import getCookie from "@/helpers/getCookie";

import {ref} from 'vue';

const {$showToast, $logOut} = useNuxtApp();

const selectedFile = ref(null);

const file = ref(null);

const user = useUserInfo();

function onFileChange(e) {
  selectedFile.value = file.value.files[0];
}

async function onUploadFile() {

  if(!selectedFile.value ){
    $showToast('Выберите файл', 'error', 2500);
    return
  }
  if (!getCookie(document.cookie, 'token')) {
    $logOut();
    return
  }
  const formData = new FormData();

  formData.append("avatar", selectedFile.value);

  $showToast('Загрузка', 'info', 2500);
  try {
    const data = await $fetch('/api/avatar', {
      method: 'POST',
      body: formData,
    })
    file.value.value = '';
    selectedFile.value = null;
    user.value.avatar = data.path;

  } catch (e) {

    console.log(e);


    if (e.response.status === 422) {
      $showToast('Неверный тип или размер файла превышен', 'error');
    } else {
      $showToast('Ошибка! Вы не авторизованы', 'error');
      //$logOut();
    }
  }
}

</script>


<style lang="scss" scoped>
.upload-avatar {
  text-align: center;
}

.ava-upload {
  width: 200px;
}

.ava-upload__button {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  background: #14942b;
  margin-top: 0.5rem;

  &:disabled {
    background-color: #b3bcc4;
    color: black;
    cursor: no-drop;
  }
}


</style>