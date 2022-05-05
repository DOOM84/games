<template>
  <div @click="closeNav" ref="overlay" id="overlay" class="bg"></div>
  <header class="white">
      <i @click="openNav" class="fas fa-bars fa-lg pointer openNav mt-1 ml-1"></i>
    <NuxtLink to="/" class="siteName white">Game portal</NuxtLink>
       <span @click="logOut"  class="mr-1 pointer">Выход</span>
  </header>
  <div ref="sideNav" class="sidenav">
    <span  class="closeBtn m-1" @click.prevent="closeNav">
      <i class="fas fa-lg  fa-times pointer white"></i>
    </span>
    <div class="center mb-2">
      <small class="white"><strong>Game portal</strong></small>
    </div>

    <div>
      <NuxtLink to="/admin">Главная</NuxtLink>
      <NuxtLink to="/admin/games">Игры</NuxtLink>
      <NuxtLink to="/admin/genres">Жанры</NuxtLink>
      <NuxtLink to="/admin/platforms">Платформы</NuxtLink>
      <NuxtLink to="/admin/developers">Разработчики</NuxtLink>
      <NuxtLink to="/admin/reviews">Рецензии</NuxtLink>
      <NuxtLink to="/admin/users">Пользователи</NuxtLink>
    </div>

  </div>
</template>

<script setup>
import {ref, watch} from "vue";
import {useRouter, useRoute} from "vue-router";
const {$logOut} = useNuxtApp();
const navbar = ref(null);
const sideNav = ref(null);
const overlay = ref(null);

const router = useRouter();
const route = useRoute();

function logOut(){
  $logOut();
  router.replace('/');
}

function openNav() {
  sideNav.value.style.left = "0px";
  overlay.value.style.visibility = "visible";
  overlay.value.style.opacity = "0.5";

}

function closeNav() {
  sideNav.value.style.left = "-250px";
  overlay.value.style.opacity = "0";
  overlay.value.style.visibility = "hidden";

}

watch(route, () => {
  closeNav()
})
</script>


<style scoped lang="scss">
header {

  background: #343a40;
  height: 50px; display: flex;
  justify-content: space-between;
  align-items: center;

  i  {
    align-self: baseline;
    color: #c9d3dc
  }
}


.sidenav {
  font-size: 16px;
  width: 250px;
  height: 100%;
  left: -250px;
  position: fixed;
  top: 0;
  background-color: #111;
  overflow-x: hidden;
  transition: 0.5s;
  padding-top: 60px;
  z-index: 4;

  a {
    padding: 8px 8px 8px 32px;
    text-decoration: none;
    color: #f1f1f1;
    display: block;
    transition: 0.3s;
  }

  a:hover, i:hover {
    color: #818181;
    transition: 0.3s;
  }

  .closeBtn {
    position: absolute;
    top: 10px;
    right: 25px;
    margin-left: 50px;
  }

  .loginbtn {
    position: absolute;
    top: 0;
    left: 10px;
  }
}

@media(max-width: 450px) {

  .siteName{
    display: none;
  }
}


</style>
