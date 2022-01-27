import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import modules from './modules';

Vue.use(Vuex);
Vue.config.devtools = true;
export default new Vuex.Store({
  modules,
  plugins: [
    createPersistedState({
      paths: [
        // 'api.settings',
        // 'user.data',
        // 'user.drawer',
        // 'bookmark.history',
      ],
      getState(key, storage) {
        let value = storage.getItem(key);
        try {
          value = JSON.parse(value);
        } catch (error) {
          return undefined;
        }
        try {
          const { history } = value.bookmark;
          const lastDate = new Date(history[0].date);
          const updateDate = new Date(2021, 6, 4);
          if (lastDate.valueOf() < updateDate.valueOf()) {
            return undefined;
          }
        } catch (error) {
          // Ignore error
        }
        if (value && Object.keys(value).length) {
          return value;
        }
        return undefined;
      },
    }),
  ],
});
