<template>
  <div>
    <div @click="toggleNav(false)" ref="overlay" id="overlay" class="bg"></div>
    <div class="grid pl-2 pr-2 pb-2" id="top">
      <TheHeader @toggleNav="toggleNav"/>
      <TheAside @toggleNav="toggleNav" :navToggle="navToggle"/>
      <article>
        <slot/>
      </article>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';

const navToggle = ref(false);

function toggleNav(flag) {
  navToggle.value = flag;
}

</script>

<style lang="scss" scoped>

</style>