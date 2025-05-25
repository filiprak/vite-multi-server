import { addRemote, loadRemote } from 'virtual:federation';
import { coreFunc } from '@repo/site/core';

coreFunc();
addRemote({
    name: 'app1',
    url: '/remote.js',
});

console.log('./src/index.ts');

loadRemote('app1')
