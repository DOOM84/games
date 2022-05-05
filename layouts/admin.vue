<template>
  <div>
    <div id="modals"></div>
    <AdminTheHeader/>
    <slot/>
  </div>

</template>

<script setup>
import {onMounted, onUnmounted} from "vue";

useMeta({
  title: 'Панель управления - Галерея',
  script: [{
    defer: true,
    src: '/scripts/ckeditor/ckeditor.js',
  }]
})

onMounted(()=>{
  document.body.style.backgroundColor = '#FFF';
  document.body.style.color = '#000';
})

onUnmounted(()=>{
  document.body.style.backgroundColor = '#000';
  document.body.style.color = '#FFF';
})


</script>

<style lang="scss">

</style>