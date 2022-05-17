<template>
  <aside id="sidenav" ref="sideNav" class="sidebar-left">
    <div id="hideNav" ref="hideNav" class="close-menu-toggle">
      <i @click="emit('toggleNav', false);" class="fa fa-times fa-lg pointer openNav white mainHeader"></i>
    </div>
    <div class="mr-1 center">
      <div v-if="isLoggedIn && user?.avatar">
        <span>{{ user.name }}</span><br>
        <div>
          <img @click.self="avaUpload = !avaUpload"
               class="pointer rounded"
               :src="user.avatar.substring(user.avatar.indexOf('/img'))" alt="">
        </div>
        <TheAvatarUpload :oldAva="user.avatar" v-if="avaUpload"/>
      </div>
    </div>
    <div class="mt-2 menu-box">
      <div class="title-link">
        <NuxtLink to="/">
          Главная
        </NuxtLink>
      </div>
      <div class="title-link">
        <NuxtLink to="/reviews">
          Рецензии
        </NuxtLink>
      </div>
      <template v-if="data">
        <div class="title-link">
          <span>Жанры</span>
        </div>
        <NuxtLink v-for="genre in data.genres" class="mb-1 sub-link" :to="'/genre/'+genre.id">
          {{ genre.name }}
        </NuxtLink>
      </template>

    </div>
  </aside>
</template>

<script setup>

import {ref, watch} from "vue";

const { pending, data } = useLazyFetch('/api/genres')

const isLoggedIn = useLoggedIn();
const user = useUserInfo();
const sideNav = ref(null);
const hideNav = ref(null);
const overlay = ref(null);
const avaUpload = ref(false);

const emit = defineEmits(['toggleNav'])

const props = defineProps({
  navToggle: {type: Boolean, default: false},
})

watch(() => props.navToggle, (value) => {
  value ? openNav() : closeNav();
});

function openNav() {
  sideNav.value.style.left = "0px";
  hideNav.value.style.display = "block";
  document.querySelector('#overlay').style.visibility = "visible";
  document.querySelector('#overlay').style.opacity = "0.5";
}

function closeNav() {
  sideNav.value.style.left = "-250px";
  document.querySelector('#overlay').style.opacity = "0";
  document.querySelector('#overlay').style.visibility = "hidden"
  hideNav.value.style.display = "none";
}

</script>

<style scoped>

</style>