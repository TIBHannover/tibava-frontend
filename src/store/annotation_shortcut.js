import Vue from 'vue';
import axios from '../plugins/axios';
import config from '../../app.config';
import { defineStore } from 'pinia'

export const useAnnotationShortcutStore = defineStore('annotationShortcut', {
    state: () => {
        return {
            annotationShortcuts: {},
            annotationShortcutList: [],
        }
    },
    getters: {

        all: (state) => {
            return state.annotationShortcutList.map(
                (id) => state.annotationShortcuts[id]
            );
        },
        get: (state) => (id) => {
            return state.annotationShortcuts[id];
        },
    },
    actions: {
        async update({ annotationShortcuts, videoId = null }) {
            const params = {
                annotation_shortcuts: annotationShortcuts,
            };
            if (videoId) {
                params.video_id = videoId;
            } else {
                const video = this.getters["video/current"];
                if (video) {
                    params.video_id = video.id;
                }
            }

            console.log(`ANNOTATION_SHORTCUT_UPDATE ${JSON.stringify(params)}`);
            return axios
                .post(`${config.API_LOCATION}/annotation/shortcut/update`, params)
                .then((res) => {
                    if (res.data.status === "ok") {
                        commit("update", res.data.annotation_shortcuts);
                        commit("shortcut/update", res.data.shortcuts, { root: true });
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async loadForVideo({ videoId = null }) {
            let params = {};

            //use video id or take it from the current video
            if (videoId) {
                params.video_id = videoId;
            } else {
                const video = this.getters["video/current"];
                if (video) {
                    params.video_id = video.id;
                }
            }
            console.log(`annotationShortcut::listUpdate ${JSON.stringify(params)}`);
            return axios
                .get(`${config.API_LOCATION}/annotation/shortcut/list`, {
                    params,
                })
                .then((res) => {
                    if (res.data.status === "ok") {
                        commit("update", res.data.entries);
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        add(categories) {
            categories.forEach((e, i) => {
                state.annotationShortcuts[e.id] = e;
                state.annotationShortcutList.push(e.id);
            });
        },
        update(categories) {
            state.annotationShortcuts = {};
            state.annotationShortcutList = [];
            categories.forEach((e, i) => {
                state.annotationShortcuts[e.id] = e;
                state.annotationShortcutList.push(e.id);
            });
        },
    },
})