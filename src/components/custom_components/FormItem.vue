<template>
  <el-form-item :label="label">
    <component
        v-if="componentType !== 'only_read'"
        :is="componentType"
        :model-value="modelValue"
        v-bind="componentProps"
        :style="{ minWidth: minWidth, maxWidth: maxWidth }"
        @input="handleInput"
        @update:model-value="handleUpdateModelValue"
    >
      <template v-if="componentType === 'el-select'">
        <el-option
            v-for="option in componentProps.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
        ></el-option>
      </template>
    </component>
    <span v-else :style="{ minWidth: minWidth, maxWidth: maxWidth }">{{ modelValue }}</span>
  </el-form-item>
</template>

<script>
import dayjs from 'dayjs';

export default {
  name: 'FormItem',
  props: {
    label: String,
    modelValue: [String, Array],
    componentType: String,
    componentProps: Object,
    minWidth: {
      type: String,
      default: '200px'
    },
    maxWidth: {
      type: String,
      default: '400px'
    }
  },
  methods: {
    handleInput(event) {
      const format = this.componentProps.format || 'YYYY-MM-DD';
      this.$emit('update:modelValue', this.formatDateValue(event, format));
    },
    handleUpdateModelValue(value) {
      const format = this.componentProps.format || 'YYYY-MM-DD';
      this.$emit('update:modelValue', this.formatDateValue(value, format));
    },
    formatDateValue(value, format) {
      if (Array.isArray(value)) {
        return value.map(date => dayjs(date).format(format));
      }
      return dayjs(value).format(format);
    }
  }
};
</script>
