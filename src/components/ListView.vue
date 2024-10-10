<template>
  <div class="container">
    <div v-if="config">
      <div class="card">
        <!-- 工具栏 -->
        <ToolbarComponent :tools="config.tools" @tool-click="handleTool" />
      </div>

      <div class="card">
        <!-- 过滤组件 -->
        <FilterComponent :filters="filters" @update-filter="updateFilter" @search="handleSearch" @reset="handleReset" />
      </div>

      <div class="card">
        <!-- 列表展示 -->
        <TableComponent :tableData="tableData" :columns="columns" @sort-change="handleFieldSort" @tool-click="handleTool" />

        <!-- 分页组件 -->
        <PaginationComponent v-if="config.is_pageable" :currentPage="currentPage" :pageSize="pageSize" :total="total" @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- CreateDialog 组件实例 -->
    <CreateDialog ref="createDialog" />
    <!-- EditDialog 组件实例 -->
    <EditDialog ref="editDialog" />
    <!-- SubListDialog 组件实例 -->
    <SubListDialog ref="subListDialog" />
  </div>
</template>

<script>
import axios from 'axios';
import FilterComponent from './FilterComponent.vue';
import ToolbarComponent from './ToolbarComponent.vue';
import TableComponent from './TableComponent.vue';
import PaginationComponent from './PaginationComponent.vue';

import CreateDialog from './custom_components/CreateDialog.vue';
import EditDialog from './custom_components/EditDialog.vue';
import SubListDialog from "@/components/custom_components/SubListDialog.vue";

import * as tool_handlers from '@/components/utils/tools_handler'; // Import all handlers
import * as auth_handlers from '@/components/utils/auth_handler';

export default {
  components: {
    FilterComponent,
    ToolbarComponent,
    TableComponent,
    PaginationComponent,
    CreateDialog,
    EditDialog,
    SubListDialog
  },
  data() {
    return {
      config: null,
      filters: {},
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      sortField: '',
      sortOrder: '',
      dictCache: {} // 全局字典缓存
    };
  },
  computed: {
    columns() {
      return this.config ? this.config.level_config[0].columns : {};
    }
  },
  methods: {
    // 获取配置信息
    async fetchConfig() {
      try {
        const response = await axios.get('/list_config.json');
        this.config = response.data;
        this.initializeFilters();
        await this.fetchData();
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    },

    // 初始化过滤组件
    async initializeFilters() {
      const filterPromises = Object.keys(this.config.level_config[0].columns)
          .filter(key => this.config.level_config[0].columns[key].filter_field)
          .map(async key => {
            const filterField = this.config.level_config[0].columns[key].filter_field;
            const filter = {
              type: filterField.type,
              value: '',
              placeholder: filterField.placeholder,
              options: [],
              label: this.config.level_config[0].columns[key].label,
              format: filterField.format
            };

            // 如果是 select 类型，则加载字典数据
            if (filterField.type === 'select' && filterField.dict_bind) {
              const dictKey = filterField.dict_bind;
              if (this.dictCache[dictKey]) {
                // 从缓存中获取字典数据
                filter.options = this.dictCache[dictKey];
              } else {
                try {
                  const dictConfig = this.config.dict[dictKey];
                  if (dictConfig.source === 'static') {
                    this.dictCache[dictKey] = dictConfig.data.map(item => ({
                      value: item.value,
                      label: item.label
                    }));
                  } else if (dictConfig.source === 'req') {
                    const { url, method, params, auth } = dictConfig.req;
                    let axiosConfig = { method, url, params };

                    // 如果配置了 auth，则调用对应的鉴权方法
                    if (auth && auth_handlers[auth]) {
                      const authData = await auth_handlers[auth]();
                      axiosConfig = {
                        ...axiosConfig,
                        ...authData
                      };
                    }

                    const response = await axios(axiosConfig);
                    if (response.data && Array.isArray(response.data)) {
                      filter.options = response.data.map(item => ({
                        value: item.value,
                        label: item.label
                      }));
                    } else if (response.data.code === 0 && Array.isArray(response.data.data)) {
                      filter.options = response.data.data.map(item => ({
                        value: item.value,
                        label: item.label
                      }));
                    }
                  }

                  // 缓存字典数据
                  this.dictCache[dictKey] = filter.options;
                } catch (error) {
                  console.error(`Error loading filter data for ${key}:`, error);
                }
              }
            }

            return { key, filter };
          });

      const filtersArray = await Promise.all(filterPromises);
      this.filters = filtersArray.reduce((acc, { key, filter }) => {
        acc[key] = filter;
        return acc;
      }, {});
    },

    // 加载列表数据
    async fetchData() {
      try {
        const {method, url, params, headers, contentType} = this.config.level_config[0].req;

        // 构建请求参数
        let requestData = {
          ...params,
          page: this.currentPage,
          size: this.pageSize,
          ...this.getFilterParams(),
          ...this.getSortParams()
        };

        let axiosConfig = {
          method,
          url,
          headers: headers || {}
        };

        if (contentType === 'application/json') {
          axiosConfig.data = requestData;
          axiosConfig.headers['Content-Type'] = 'application/json';
        } else {
          axiosConfig.data = new URLSearchParams(requestData);
          axiosConfig.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        const response = await axios(axiosConfig);

        // 验证响应格式
        if (response.data && response.data.code === 0) {
          this.tableData = response.data.data.items;
          this.total = response.data.data.total;
        } else {
          console.error('Invalid response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    getFilterParams() {
      let filterParams = {};
      Object.keys(this.filters).forEach(key => {
        if (this.filters[key].value) {
          filterParams[key] = this.filters[key].value;
        }
      });
      return filterParams;
    },
    getSortParams() {
      let sortParams = {};
      if (this.sortField && this.sortOrder) {
        sortParams.orders = JSON.stringify([{ field: this.sortField, order: this.sortOrder }]);
      }
      return sortParams;
    },
    updateFilter({key, value}) {
      this.filters[key].value = value;
    },
    handleSearch() {
      this.currentPage = 1;
      this.fetchData();
    },
    handleReset() {
      Object.keys(this.filters).forEach(key => {
        this.filters[key].value = '';
      });
      this.handleSearch();
    },
    handleFieldSort(field, order) {
      // 确保 field 和 order 是字符串
      const sortField = typeof field === 'string' ? field : '';
      const sortOrder = typeof order === 'string' ? order : '';
      if (sortField === '' && sortOrder === '') {
        return;
      }
      if (this.sortField !== sortField || this.sortOrder !== sortOrder) {
        this.sortField = sortField;
        this.sortOrder = sortOrder;
        this.fetchData();
      }
    },
    handleTool(style_type, config) {
      if (style_type === 'create_dialog') {
        this.$refs.createDialog.createRow(config);
      } else if (style_type === 'edit_dialog') {
        this.$refs.editDialog.editRow(config);
      } else if (style_type === 'custom_handler') {
        tool_handlers[config.handler](config.row);
      } else if (style_type === 'sub_list') {
        let config_path = config.config_path;
        console.log(config_path)
        this.$refs.subListDialog.open(config_path);
      }
    },
    handleCurrentChange(page) {
      this.currentPage = page;
      this.fetchData();
    },
  },
  mounted() {
    this.fetchConfig();
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
}
</style>
