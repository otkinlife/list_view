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
        <TableComponent :tableData="tableData" :columns="columns" @sort-change="handleFieldSort" />

        <!-- 分页组件 -->
        <PaginationComponent v-if="config.isPageable" :currentPage="currentPage" :pageSize="pageSize" :total="total" @current-change="handleCurrentChange" />
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import FilterComponent from './FilterComponent.vue';
import ToolbarComponent from './ToolbarComponent.vue';
import TableComponent from './TableComponent.vue';
import PaginationComponent from './PaginationComponent.vue';
import * as tool_handlers from './filed_handlers/tools_handler'; // Import all handlers


export default {
  components: {
    FilterComponent,
    ToolbarComponent,
    TableComponent,
    PaginationComponent
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
      sortOrder: ''
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
              label: this.config.level_config[0].columns[key].label
            };

            // 如果是 select 类型，则加载字典数据
            if (filterField.type === 'select' && filterField.load_data_req) {
              try {
                const { url, method, params } = filterField.load_data_req;
                const response = await axios({ method, url, params });
                if (response.data.code === 0 && response.data && Array.isArray(response.data.data)) {
                  filter.options = response.data.data.map(item => ({
                    value: item.value,
                    label: item.label
                  }));
                }
              } catch (error) {
                console.error(`Error loading filter data for ${key}:`, error);
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
        const {method, url, params, headers, contentType} = this.config.level_config[0].request;

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
    handleTool(handler) {
      if (tool_handlers[handler]) {
        tool_handlers[handler]();
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
