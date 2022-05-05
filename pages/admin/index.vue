<template>
  <main  class="center pb-2 adminHome" >
    <h1 class="mt-2 center">Панель управления</h1>
    <h3 class="center" >Добро пожаловать в панель управления сайта. Выберите необходимое действие из меню слева.</h3>
  </main>
</template>

<script setup>

definePageMeta({
  layout: 'admin'
})

useMeta({
  title: 'Панель управления'
})

</script>

<style lang="scss" scoped>
.adminHome{
  border-bottom: 1px solid #dee2e6
}
</style>