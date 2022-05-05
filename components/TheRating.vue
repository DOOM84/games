<template>
  <div>
    <star-rating :increment="0.1"
                 v-model:rating="userRate"
                 @update:rating="setRating"
                 :show-rating="false"
                 :star-size="40"
                 :glow="10"
                 :read-only="!isLoggedIn"
                 glow-color="#ffd055"
    />
  </div>
</template>

<script setup>
const isLoggedIn = useLoggedIn();
const route = useRoute();
const {$showToast, $logOut} = useNuxtApp();

const emit = defineEmits(['rateChanged'])

const props = defineProps({
  userRate: {type: Number, default: 0},
})

async function setRating(rating) {

  const formData = new FormData();

  formData.append("id", route.params.id);
  formData.append("rating", rating);

  try {

    const {rate} = await $fetch('/api/rate', {
      method: 'POST',
      body: formData,
    })

    emit('rateChanged', rate)

  } catch (e) {
    if (e.response.status === 403) {

      $showToast('Вы не авторизованы', 'error', 2500);

      $logOut();

    }
  }
}

</script>

<style scoped>

</style>