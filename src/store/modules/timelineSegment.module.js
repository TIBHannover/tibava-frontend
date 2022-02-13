import Vue from 'vue';
import router from '../../router';
import axios from '../../plugins/axios';
import config from '../../../app.config';
import { isEqual, lsplit, keyInObj } from '../../plugins/helpers';

const api = {
    namespaced: true,
    state: {
        timelineSegments: {},
        timelineSegmentList: [],
    },
    getters: {
        forTimeline: (state) => (timeline_id) => {
            return state.timelineSegmentList.map(id => state.timelineSegments[id]).filter(e => e.timeline_id === timeline_id)
        },
        get: (state) => (id) => {
            return state.timelineSegments[id];
        }
    },
    actions: {

        listAdd({ commit }, timeline_id) {
            const params = {
                timeline_id: timeline_id
            }
            axios.get(`${config.API_LOCATION}/timeline_segment_list`, { params })
                .then((res) => {
                    if (res.data.status === 'ok') {
                        commit('add', res.data.entries);
                    }
                })
                .catch((error) => {
                    const info = { date: Date(), error, origin: 'collection' };
                    commit('error/update', info, { root: true });
                });
        },

        listUpdate({ commit }, timeline_id) {
            const params = {
                timeline_id: timeline_id
            }
            axios.get(`${config.API_LOCATION}/timeline_segment_list`, { params })
                .then((res) => {
                    if (res.data.status === 'ok') {
                        commit('update', res.data.entries);
                    }
                })
                .catch((error) => {
                    const info = { date: Date(), error, origin: 'collection' };
                    commit('error/update', info, { root: true });
                });
        },


    },
    mutations: {
        addAnnotation(state, annotations) {
            annotations.forEach((e) => {
                state.timelineSegments[e.timelineSegmentId].annotation_ids.push(e.entry.id)
            });
        },
        deleteAnnotation(state, timeline_segment_annotations) {

            timeline_segment_annotations.forEach((f) => {
                state.timelineSegmentList.map(id => state.timelineSegments[id]).forEach((e) => {
                    console.log(`Search ${JSON.stringify(e)}`);
                    console.log(`Search ${JSON.stringify(f)}`);
                    let index = e.annotation_ids.findIndex((k) => k === f)
                    if (index >= 0) {
                        console.log(`Found ${JSON.stringify(e)}`);
                        e.annotation_ids.splice(index, 1);
                    }
                })
            })
        },
        add(state, timelineSegments) {
            timelineSegments.forEach((e, i) => {
                state.timelineSegments[e.id] = e
                state.timelineSegmentList.push(e.id)
            });
        },
        update(state, timelineSegments) {
            this.timelineSegmentList = [];
            this.timelineSegments = {};
            timelineSegments.forEach((e, i) => {
                state.timelineSegments[e.id] = e
                state.timelineSegmentList.push(e.id)
            });
        },
        // delete(state, timeline_id) {
        //     let timeline_index = state.timelines.findIndex(e => e.id === timeline_id);
        //     state.timelines.splice(timeline_index, 1);
        // },

        clear(state) {
            this.timelineSegmentList = [];
            this.timelineSegments = {};
        },
        deleteTimeline(state, timeline_id) {
            const timeline_indexes = state.timelineSegmentList.map(id => state.timelineSegments[id]).filter(e => e.timeline_id === timeline_id)
            timeline_indexes.forEach(e => {
                let segment_index = state.timelineSegmentList.findIndex(f => f === e.id);
                state.timelineSegmentList.splice(segment_index, 1);
                delete state.timelineSegments[e.id]
            });
        },
    },
};
export default api;