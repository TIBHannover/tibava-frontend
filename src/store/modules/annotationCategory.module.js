import Vue from 'vue';
import router from '../../router';
import axios from '../../plugins/axios';
import config from '../../../app.config';
import { isEqual, lsplit, keyInObj } from '../../plugins/helpers';

const api = {
    namespaced: true,
    state: {
        annotationCategories: {},
        annotationCategoryList: [],
    },
    getters: {
        all: (state) => {
            return state.annotationCategoryList.map(id => state.annotationCategories[id])
        },
        get: (state) => (id) => {
            return state.annotationCategories[id]
        }
    },
    actions: {
        async create({ commit }, { name, color }) {
            const params = {
                name: name,
                color: color
            }
            return axios.post(`${config.API_LOCATION}/annotation_category_create`, params)
                .then((res) => {
                    if (res.data.status === 'ok') {
                        commit('add', [res.data.entry]);
                        return res.data.entry.id;
                    }
                })
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },


        async listUpdate({ commit }) {
            return axios.get(`${config.API_LOCATION}/annotation_category_list`)
                .then((res) => {
                    if (res.data.status === 'ok') {
                        commit('update', res.data.entries);
                    }
                })
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
    },
    mutations: {
        add(state, categories) {
            categories.forEach((e, i) => {
                state.annotationCategories[e.id] = e
                state.annotationCategoryList.push(e.id)
            });
        },
        update(state, categories) {
            state.annotationCategories = {}
            state.annotationCategoryList = []
            categories.forEach((e, i) => {
                state.annotationCategories[e.id] = e
                state.annotationCategoryList.push(e.id)
            });
        },
    },
};
export default api;