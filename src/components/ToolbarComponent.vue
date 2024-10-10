<template>
  <div class="toolbar-container">
    <button v-for="tool in tools" :key="tool.label" @click="$emit('tool-click', tool.handler)">
      {{ tool.label }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    tools: Array
  }
};
</script>

<style scoped>
.toolbar-container {
  display: flex;
  gap: 10px;
}

.toolbar-container button {
  padding: 4px 8px;
  border: none;
  border-radius: 2px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 12px;
}

.toolbar-container button:hover {
  background-color: #0056b3;
}
</style>


