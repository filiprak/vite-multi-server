import { defineCustomElement } from 'vue';
import MyApp1 from './MyApp1.vue';
import { randId } from '@repo/utils';

console.log('app1', randId())

customElements.define('my-app-1', defineCustomElement(MyApp1));
