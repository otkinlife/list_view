<template>
  <el-table :data="processedTableData" @sort-change="handleSortChange">
    <el-table-column v-for="(column, key) in columns" :key="key" :prop="key" :label="column.label"
                     :sortable="column.isSupportSort ? 'custom' : false">
    </el-table-column>
  </el-table>
</template>

<script>
import * as handlers from '@/components/utils/customer_filed_handler';

export default {
  props: {
    tableData: Array,
    columns: Object
  },
  methods: {
    handleSortChange({ prop, order }) {
      if (order) {
        this.$emit('sort-change', prop, order === 'ascending' ? 'asc' : 'desc');
      } else {
        this.$emit('sort-change', '', '');
      }
    },
    applyHandler(value, handlerName) {
      if (handlers[handlerName]) {
        return handlers[handlerName](value);
      }
      return value;
    }
  },
  computed: {
    processedTableData() {
      return this.tableData.map(row => {
        let processedRow = {};
        for (const key in row) {
          if (this.columns[key] && this.columns[key].handler) {
            processedRow[key] = this.applyHandler(row[key], this.columns[key].handler);
          } else {
            processedRow[key] = row[key];
          }
        }
        return processedRow;
      });
    }
  },
  data() {
    return {
      currentSortProp: '',
      currentSortOrder: ''
    };
  }
};
</script>

<style scoped>
/* 添加样式 */
</style>
