<template>
  <el-dialog
      v-model="dialogVisible"
      title="新建"
      width="50%"
      @close="handleClose"
  >
    <!-- Dialog Content -->
    <el-form :model="form" :key="formKey" ref="form">
      <template v-for="(field, key) in config.req.columns" :key="key">
        <FormItem
            :label="field.label"
            v-model="form[key]"
            :componentType="getComponentType(field)"
            :componentProps="getComponentPropsCache(key)"
        />
      </template>
    </el-form>

    <!-- Footer with Submit Button -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import axios from 'axios';
import FormItem from './FormItem.vue'; // 引入通用表单项组件
import * as auth_handlers from '@/components/utils/auth_handler'; // Import all handlers

export default {
  name: 'CreateDialog',
  components: {
    FormItem
  },
  data() {
    return {
      dialogVisible: false,
      form: {},
      config: {
        req: {
          data: {}
        }
      },
      formKey: 0, // 用于强制重新渲染表单
      componentPropsCache: {} // 用于缓存组件属性
    };
  },
  methods: {
    async create(config) {
      this.config = config || { req: { data: {} } };
      this.resetForm();
      await this.initializeComponentProps();
      this.dialogVisible = true;
      this.formKey++; // 改变 key 值以强制重新渲染表单
    },
    resetForm() {
      this.form = {};
      this.componentPropsCache = {}; // 重置缓存
      if (this.config.req && this.config.req.data) {
        for (const key in this.config.req.data) {
          this.form[key] = '';
        }
      }
    },
    async initializeComponentProps() {
      for (const [key, field] of Object.entries(this.config.req.columns)) {
        if (field.type === 'select' && field.dict_bind !== '') {
          const dictKey = field.dict_bind;
          if (this.$parent.dictCache[dictKey]) {
            // 从缓存中获取字典数据
            this.componentPropsCache[key] = {
              placeholder: field.placeholder,
              options: this.$parent.dictCache[dictKey]
            };
          } else {
            try {
              let options = [];
              const dictConfig = this.$parent.config.dict[dictKey];
              if (dictConfig.source === 'static') {
                options = dictConfig.data.map(item => ({
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
                  options = response.data.map(item => ({
                    value: item.value,
                    label: item.label
                  }));
                } else if (response.data.code === 0 && Array.isArray(response.data.data)) {
                  options = response.data.data.map(item => ({
                    value: item.value,
                    label: item.label
                  }));
                }
              }

              // 缓存字典数据
              this.$parent.dictCache[dictKey] = options;
              this.componentPropsCache[key] = {
                placeholder: field.placeholder,
                options: options
              };
            } catch (error) {
              console.error(`Error loading select options for ${key}:`, error);
            }
          }
        } else {
          this.componentPropsCache[key] = {
            placeholder: field.placeholder
          };
        }
      }
    },
    getComponentPropsCache(key) {
      return this.componentPropsCache[key] || {};
    },
    getComponentType(field) {
      switch (field.type) {
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
    handleClose() {
      this.dialogVisible = false;
    },
    async handleSubmit() {
      if (!this.config.req.url || !this.config.req.method) {
        console.error('Request URL or method is missing');
        return;
      }
      try {
        const response = await axios({
          url: this.config.req.url,
          method: this.config.req.method,
          data: this.form
        });
        console.log('Form submitted:', response.data);
        this.handleClose();
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  }
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
