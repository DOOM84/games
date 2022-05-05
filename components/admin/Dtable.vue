<template>
  <div class="d-table">
    <data-table :rows="tableData"
                :pagination="pagination"
                :query="query"
                :loading="isLoading"
                top-pagination
                striped
                sn
                filter
                @loadData="loadData"
    >
      <template #thead>
        <slot name="thead"></slot>
      </template>

      <template #tbody="{row}">
        <slot :row="row" name="rows"></slot>
      </template>
    </data-table>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue';

const props = defineProps({
  data: Object,
  toSearch: Object,
  filtering: Object,
  toFilter: Boolean,
});

const emit = defineEmits(['endFilter']);
const tableData = ref([]);
const page = ref(1);
const per_page = ref(10);
const search = ref("");
const pagination = ref({});

const query = ref({
  search: "",
});

watch(() => props.toFilter, (oldVal, newVal) => {

  if (!newVal) {
    emit('endFilter')
    return
  }

  if (newVal) {
    loadData({
      'page': page.value,
      'per_page': per_page.value,
      'search': search.value,
      fTerm: props.filtering[0],
      dir: props.filtering[1]
    })
  }
  emit('endFilter');
});

const isLoading = ref(false);

function loadData(query) {
  isLoading.value = true;

  page.value = query.page;
  per_page.value = query.per_page;
  search.value = query.search;

  if (query.fTerm) {

    if (query.dir) {
      if (query.dir === 'desc') {
        (typeof props.data[0][query.fTerm] !== 'string') ?
            props.data.sort((a, b) => b[query.fTerm] - a[query.fTerm]) :
            props.data.sort((a, b) => b[query.fTerm].localeCompare(a[query.fTerm]))
      } else {
        (typeof props.data[0][query.fTerm] !== 'string') ?
            props.data.sort((a, b) => a[query.fTerm] - b[query.fTerm]) :
            props.data.sort((a, b) => a[query.fTerm].localeCompare(b[query.fTerm]))
      }
    }
  }

  if (query.search) {

    let filtered = [];

    props.toSearch.some(item => {
      const filter = props.data.filter(
          (x) => x[item].toLowerCase().includes(query.search.trim().toLowerCase())
      )
      if (filter.length) {
        filtered = filter;
        return;
      }
    })

    tableData.value = filtered.slice((query.page - 1) * query.per_page, query.page * query.per_page);
    pagination.value = {...pagination.value, page: query.page, total: filtered.length}
  } else {
    tableData.value = props.data.slice((query.page - 1) * query.per_page, query.page * query.per_page);
    pagination.value = {...pagination.value, page: query.page, total: props.data.length}
  }

  isLoading.value = false;
}
</script>


<style lang="scss" scoped>


::v-deep(.dt__table__thead__th) {
  text-align: center !important;
}

::v-deep(.dt__filter__search) {
  color: #000 !important;
}

::v-deep(.dt__pagination_size) {
  color: #000 !important;
}

::v-deep(.dt-hidden) {
  display: flex;
  flex-direction: row;
}

::v-deep(.dt__pagination) {
  justify-content: flex-start !important;
  @media (max-width: 715px) {
    .dt-hidden {
      flex-direction: column;
    }
  }
  @media (max-width: 570px) {
    display: none !important;
  }
}

</style>

