<template>
  <el-table :data="processedTableData" @sort-change="handleSortChange">
    <el-table-column
        v-for="(column, key) in filteredColumns"
        :key="key"
        :prop="key"
        :label="column.label"
        :sortable="column.isSupportSort ? 'custom' : false"
    >
      <template v-slot="scope">
        <span>{{ scope.row[key] }}</span>
      </template>
    </el-table-column>

    <!-- 操作列 -->
    <el-table-column
        v-if="columns.options"
        :key="'options'"
        :label="columns.options.label"
    >
      <template v-slot="scope">
        <span v-for="(tool, index) in columns.options.tools" :key="tool.label">
          <el-link
              @click="$emit('tool-click', tool.style_type, { ...tool.config, row: scope.row })"
              type="primary"
          >
            {{ tool.label }}
          </el-link>
          <span v-if="index < columns.options.tools.length - 1" class="divider">|</span>
        </span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import * as handlers from '@/components/utils/customer_field_handler';

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
    },
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
    },
    filteredColumns() {
      const filtered = {};
      for (const key in this.columns) {
        if (!this.columns[key].isHint && key !== 'options') {
          filtered[key] = this.columns[key];
        }
      }
      return filtered;
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
.divider {
  margin: 0 8px;
  color: #ccc;
}
</style>
