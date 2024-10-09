<template>
  <div class="filter-container">
    <div class="filter-item" v-for="filter in filters" :key="filter.key">
      <FormItem
          :label="filter.label"
          v-model="filter.value"
          :componentType="getComponentType(filter)"
          :componentProps="getComponentProps(filter)"
      />
    </div>
    <div class="filter-buttons">
      <button @click="search">查询</button>
      <button @click="reset">重置</button>
    </div>
  </div>
</template>

<script>
import FormItem from './custom_components/FormItem.vue'; // 引入通用表单项组件

export default {
  name: 'FilterComponent',
  components: {
    FormItem
  },
  props: {
    filters: Array // 这里应该是 Array 类型而不是 Object
  },
  methods: {
    getComponentType(filter) {
      switch (filter.type) {
        case 'text':
          return 'el-input';
        case 'select':
          return 'el-select';
        case 'date_range':
          return 'el-date-picker';
        default:
          return 'el-input'; // 默认类型
      }
    },
    getComponentProps(filter) {
      const props = {
        placeholder: filter.placeholder || ''
      };

      if (filter.type === 'select') {
        props.options = filter.options || [];
      }

      if (filter.type === 'date_range') {
        props.type = 'daterange';
        props.style = { maxWidth: '200px', fontSize: '12px' };
      }

      return props;
    },
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
