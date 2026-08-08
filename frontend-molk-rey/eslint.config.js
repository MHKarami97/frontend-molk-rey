import vueEslintConfig from '@vue/eslint-config-typescript';
import pluginVue from 'eslint-plugin-vue';

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vueEslintConfig(),
  {
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
];
