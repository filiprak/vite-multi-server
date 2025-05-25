import { coreFunc } from '@repo/site/core';
import { init, addRemote, loadRemote } from 'virtual:federation';

coreFunc();
init();
addRemote({
    name: 'app1',
    url: '/remote.js',
});

console.log('./src/index.ts');

loadRemote('app1')
