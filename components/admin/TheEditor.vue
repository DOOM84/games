<template>
  <div style="max-width: 1000px">
    <textarea ref="editor1" id="editor1" name="editor1" :value="content" rows="5" cols="30" />
  </div>
</template>

<script setup>

import {onMounted, ref} from 'vue';

const props = defineProps({
  content: {type: String, default: ''},
})

const emit = defineEmits(['updatedContent'])


const editor1=ref(null)


onMounted(()=>{

  //setTimeout(()=>{
    CKEDITOR.replace( 'editor1', {
      toolbar : 'full',
      filebrowserUploadUrl: '/api/admin/uploader',
      extraPlugins: 'youtube',
      maxWidth: 1200,
      removePlugins: "exportpdf",
    });
  //}, 100);

  CKEDITOR.instances.editor1.on('change', function() {
    const cont = CKEDITOR.instances.editor1.editable().getData();
    emit('updatedContent', cont);
  } );
})

/*onUnmounted(()=>{
  delete CKEDITOR.instances['editor1'];
})*/



</script>

<style scoped>

</style>