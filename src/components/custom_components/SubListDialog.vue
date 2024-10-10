<template>
  <div v-if="config">
  <el-dialog
      v-model="dialogVisible"
     :title="config.title"
     width="80%"
     @close="handleClose"
  >
    <div class="container">
      <div v-if="config">
        <div class="card">
          <ToolbarComponent :tools="config.tools" @tool-click="handleTool" />
        </div>

        <div class="card">
          <FilterComponent :filters="filters" @update-filter="updateFilter" @search="handleSearch" @reset="handleReset" />
        </div>

        <div class="card">
          <TableComponent :tableData="tableData" :columns="columns" @sort-change="handleFieldSort" @tool-click="handleTool" />

          <PaginationComponent v-if="config.isPageable" :currentPage="currentPage" :pageSize="pageSize" :total="total" @current-change="handleCurrentChange" />
        </div>
      </div>
    </div>
  </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import FilterComponent from '../FilterComponent.vue';
import ToolbarComponent from '../ToolbarComponent.vue';
import TableComponent from '../TableComponent.vue';
import PaginationComponent from '../PaginationComponent.vue';
import * as tool_handlers from '@/components/utils/tools_handler'; // Import all handlers
import * as auth_handlers from '@/components/utils/auth_handler';

export default {
  components: {
    FilterComponent,
    ToolbarComponent,
    TableComponent,
    PaginationComponent
  },
  data() {
    return {
      dialogVisible: false,
      config: null,
      filters: {},
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      sortField: '',
      sortOrder: '',
      dictCache: {}
    };
  },
  computed: {
    columns() {
      return this.config ? this.config.level_config[0].columns : {};
    }
  },
  methods: {
    async fetchConfig(configPath) {
      try {
        const response = await axios.get(configPath);
        this.config = response.data;
        this.initializeFilters();
        await this.fetchData();
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    },
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

            if (filterField.type === 'select' && filterField.dict_bind) {
              const dictKey = filterField.dict_bind;
              if (this.dictCache[dictKey]) {
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
    async fetchData() {
      try {
        const { method, url, params, headers, contentType } = this.config.level_config[0].request;

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
    updateFilter({ key, value }) {
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
        const configPath = config.config_path;
        this.open(configPath);
      }
    },
    handleCurrentChange(page) {
      this.currentPage = page;
      this.fetchData();
    },
    handleClose() {
      this.dialogVisible = false;
    },
    open(configPath) {
      this.fetchConfig(configPath);
      this.dialogVisible = true;
    }
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
</style>
