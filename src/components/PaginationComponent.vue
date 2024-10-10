<template>
    <el-pagination @current-change="$emit('current-change', $event)" :current-page="currentPage" :page-size="pageSize"
        layout="total, prev, pager, next, jumper" :total="total"></el-pagination>
</template>

<script>
export default {
    props: {
        currentPage: Number,
        pageSize: Number,
        total: Number
    }
};
</script>

<style scoped>
/* 添加样式 */
</style>
