<template>
  <div class="filter-container">
    <div class="filter-item" v-for="filter in filters" :key="filter.key">
      <label :for="filter.key">{{ filter.label }}</label>
      <!--实现各种组件 Start-->
      <!--输入框-->
      <input v-if="filter.type === 'text'" :id="filter.key" v-model="filter.value" type="text" />
      <!--下拉框-->
      <select v-else-if="filter.type === 'select'" :id="filter.key" v-model="filter.value">
        <option v-for="option in filter.options" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
      <!--实现各种组件 End-->
    </div>
    <div class="filter-buttons">
      <button @click="search">查询</button>
      <button @click="reset">重置</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    filters: Object,
  },
  methods: {
    search() {
      this.$emit('search');
    },
    reset() {
      this.$emit('reset');
    }
  }
};
</script>
<style scoped>
.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-item {
  flex: 1 1 calc(33.3333% - 15px);
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-item label {
  font-weight: bold;
  font-size: 12px;
  white-space: nowrap;
}

.filter-item input,
.filter-item select {
  max-width: 120px;
  padding: 3px;
  border: 1px solid #ccc;
  border-radius: 2px;
  font-size: 12px;
  flex: 1;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  width: 100%;
  justify-content: flex-start;
}

.filter-buttons button {
  padding: 4px 8px;
  border: none;
  border-radius: 2px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 12px;
}

.filter-buttons button:hover {
  background-color: #0056b3;
}
</style>
