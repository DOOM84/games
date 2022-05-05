<template>
  <section class="withFooter cont pb-2 pt-2">

    <div>
      <div class="mt-1 auth-container">
        <h3 class="left">{{ showMode }}</h3>
        <template v-if="mode==='signup' || mode==='login'">
          <div class="form-group">
            <input @keyup.enter="authorize" v-if="mode==='signup'" class="form-control" v-model.trim="login" type="text"
                   name="login" placeholder="Логин">
          </div>
          <div class="form-group">
            <input @keyup.enter="authorize" class="form-control" v-model.trim="email" type="email"
                   name="email" placeholder="Email">
          </div>
          <div class="form-group">
            <input @keyup.enter="authorize" class="form-control" v-model.trim="password" type="password"
                   name="password" placeholder="Пароль">
          </div>
          <template v-if="mode==='signup'">
            <div class="form-group">
              <input @keyup.enter="authorize" class="form-control" v-model.trim="passwordConfirmation" type="password"
                     name="passwordConfirmation"
                     placeholder="Пароль еще раз">
            </div>
          </template>
          <div class="mt-2">
            <button class="loginBtn" :disabled="showIcon" @click="authorize">
              <i v-if="showIcon" class="fas fa-sync fa-spin"></i>
              <span v-else>{{ showMode }}</span>
            </button>
            <button class="loginBtn" @click="toggleMode(null)">{{ showBtnMode }}</button>
            <button class="loginBtn" @click="toggleMode('reset')">Забыли свой пароль?</button>
          </div>
        </template>

        <template v-else>
          <div class="form-group">
            <input @keyup.enter="authorize" class="form-control" v-model.trim="email" type="email"
                   name="email" placeholder="Email">
          </div>

          <div class="mt-2">
            <button class="loginBtn" :disabled="showIcon" @click="authorize">
              <i v-if="showIcon" class="fas fa-sync fa-spin"></i>
              <span v-else>Отправить</span>
            </button>
            <button class="loginBtn" @click="toggleMode('login')">Вход</button>
          </div>
        </template>
      </div>
    </div>


  </section>


</template>

<script setup>

import {computed, ref} from 'vue';

const router = useRouter();
const route = useRoute();
const {$showToast, $logOut, ssrContext} = useNuxtApp();
const login = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const mode = ref('login');
const err = ref(false);
const showIcon = ref(false);
const authToken = useTokenAuth();
const isLoggedIn = useLoggedIn();
const user = useUserInfo();

const showMode = computed(() =>
    mode.value === 'signup' ? 'Регистрация' : mode.value === 'login' ? 'Войти' : 'Сбросить пароль');

const showBtnMode = computed(() => mode.value === 'signup' ? 'Войти' : 'Регистрация');

function setCookies(name, data) {
  let now = new Date();
  now.setTime(now.getTime() + 1 * 3600 * 1000);
  let expires = "expires=" + now.toUTCString();
  document.cookie = name + "=" + data + ";" + expires + ";path=/; SameSite=Lax;";
}

function toggleMode(reset = null) {
  if (reset) {
    mode.value = reset
  } else {
    mode.value = mode.value === 'login' ? 'signup' : 'login'
  }
}

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

async function authorize() {

  if (isLoggedIn.value) {
    return
  }
  err.value = false;

  if (!validateEmail(email.value)) {
    err.value = true;
    $showToast('Введен некорректный Email адрес', 'error');
  }

  if (mode.value !== 'reset') {
    if (password.value.length < 6) {
      err.value = true;
      $showToast('Пароль не должен быть менее 6 символов', 'error');
    }
  }

  if (mode.value === 'signup') {
    let strippedLogin = login.value.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}\[\]\\\/]/gi, '')

    if (!strippedLogin || strippedLogin !== login.value || strippedLogin.length < 3) {
      err.value = true;
      $showToast('Некорректное имя пользователя. Специальные символы в имени пользователя запрещены, либо длина менее 3 символов', 'error');
    }

    if (password.value !== passwordConfirmation.value) {
      err.value = true;
      $showToast('Введенные пароли не совпадают.', 'error');
    }
  }

  if (err.value) {
    return
  }

  const formData = new FormData();

  formData.append("email", email.value);

  if (mode.value !== 'reset') {
    formData.append("password", password.value);
  }

  if (mode.value === 'signup') {
    formData.append("login", login.value);
    formData.append("passwordConfirmation", passwordConfirmation.value);
  }

  try {
    showIcon.value = true
    const data = mode.value === 'signup' ? await $fetch('/api/auth/signup', {
      method: 'POST',
      body: formData,
    }) : mode.value === 'login' ?
        await $fetch('/api/auth/login', {
          method: 'POST',
          body: formData,
        }) : await $fetch('/api/auth/reset', {
          method: 'POST',
          body: formData,
        })

    if (mode.value !== 'reset') {

      setCookies('token', data.token);
      authToken.value = data.token;
      isLoggedIn.value = !!data.token;
      user.value = {
        name: data.login, /*email: data.email,*/
        avatar: data.avatar
      }
      //await router.push('/');
      await router.push(route.params.prevRoute ? route.params.prevRoute : '/');
    } else {
      showIcon.value = false;
      $showToast('Данные успешно отправлены на Ваш Email', 'success');
      mode.value = 'login';
    }
  } catch (error) {

    console.log(error);

    showIcon.value = false;
    err.value = true;
    $logOut();

    if (mode.value === 'signup') {

      if (error.response.status !== 422) {

        $showToast('Такой Email адрес уже существует', 'error');

      } else {

        $showToast(error.response._data.msg, 'error');
      }
    } else {

      if (error.response.status !== 422) {

        $showToast('Пользователя с такими данными не существует', 'error');

      } else {

        $showToast(error.response._data.msg, 'error');
      }

    }
  }

}

</script>

<style lang="scss" scoped>

.auth-container{
  max-width: 400px;
  margin: auto;
}

.loginBtn {
  cursor: pointer;
  width: 100%;
  border: none;
  background: #474847;
  color: #FFF;
  margin: 0 0 5px;
  padding: 10px;
  font-size: 15px;
  border-radius: 5px;

  &:hover {
    background: #275629;
    transition: 0.3s;
  }

}

.withFooter {
  height: 53vh;
}

</style>