<template>
    <div class="app1">
        <div>This is my app</div>
        <div>
            <X></X>
        </div>
    </div>
</template>
<script setup lang="ts">
import './styles.css';
import { useShadowDom } from '@repo/utils';
import { defineAsyncComponent } from 'vue';

const X = defineAsyncComponent({
    async loader() {
        return await import('./Btn.vue');
    },
})

useShadowDom();
</script>
