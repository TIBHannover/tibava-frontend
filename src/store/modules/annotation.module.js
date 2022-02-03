import Vue from 'vue';
import router from '../../router';
import axios from '../../plugins/axios';
import config from '../../../app.config';
import { isEqual, lsplit, keyInObj } from '../../plugins/helpers';

const api = {
    namespaced: true,
    state: {
        annotations: {},
        annotationList: [],
    },
    actions: {

        add({ commit }, { segment_hash_id, annotation }) {
            const params = {
                hash_id: segment_hash_id,
                annotation: annotation
            }
            axios.post(`${config.API_LOCATION}/annotation_add`, params)
                .then((res) => {
                    if (res.data.status === 'ok') {
                        commit('addAnnotation', params);
                    }
                })
                .catch((error) => {
                    const info = { date: Date(), error, origin: 'collection' };
                    commit('error/update', info, { root: true });
                });
        },
        delete({ commit }, annotation_hash_id) {
            const params = {
                hash_id: annotation_hash_id,
            }
            axios.post(`${config.API_LOCATION}/annotation_delete`, params)
                .then((res) => {
                    if (res.data.status === 'ok') {
                        commit('addAnnotation', params);
                    }
                })
                .catch((error) => {
                    const info = { date: Date(), error, origin: 'collection' };
                    commit('error/update', info, { root: true });
                });
        },
        list({ commit }, segment_hash_id) {
            const params = {
                hash_id: segment_hash_id,
                annotation: annotation
            }
            axios.post(`${config.API_LOCATION}/annotation_list`, params)
                .then((res) => {
                    if (res.data.status === 'ok') {
                        commit('addAnnotation', params);
                    }
                })
                .catch((error) => {
                    const info = { date: Date(), error, origin: 'collection' };
                    commit('error/update', info, { root: true });
                });
        },
    },
    mutations: {
        add(state, { hash_id, annotation }) {
        },
        delete(state, hash_id) {
            let timeline_index = state.timelines.findIndex(e => e.hash_id === timeline_hash_id);
            state.timelines.splice(timeline_index, 1);
        },
        update(state, timelines) {
            state.timelines = timelines;
        },
    },
};
export default api;