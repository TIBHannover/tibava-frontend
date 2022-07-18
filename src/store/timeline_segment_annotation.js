import Vue from 'vue';
import axios from '../plugins/axios';
import config from '../../app.config';
import { defineStore } from 'pinia'


import { useTimelineStore } from "@/store/timeline";
import { useTimelineSegmentStore } from "@/store/timeline_segment";


export const useTimelineSegmentAnnotationStore = defineStore('timelineSegmentAnnotation', {
    state: () => {
        return {
            timelineSegmentAnnotations: {},
            timelineSegmentAnnotationByTime: {},
            timelineSegmentAnnotationList: [],
        }
    },
    getters: {
        all: (state) => {
            return state.timelineSegmentAnnotationList.map(
                (id) => state.timelineSegmentAnnotations[id]
            );
        },
        forTimelineSegment: (state) => (timelineSegmentId) => {
            return state.timelineSegmentAnnotationList
                .map((id) => state.timelineSegmentAnnotations[id])
                .filter((e) => e.timeline_segment_id === timelineSegmentId);
        },
        forTimeLUT: (state) => (time) => {
            const timeSecond = Math.round(time)
            if (timeSecond in state.timelineSegmentAnnotationByTime) {
                const timelineSegmentIds = state.timelineSegmentAnnotationByTime[timeSecond];
                return timelineSegmentIds.map((id) => {
                    return state.timelineSegmentAnnotations[id]
                }
                );
            }
            return []
        }
    },
    actions: {
        async create({ timelineSegmentId, annotationId }) {
            const params = {
                timeline_segment_id: timelineSegmentId,
                annotation_id: annotationId,
            };

            const timelineSegmentStore = useTimelineSegmentStore()

            return axios
                .post(
                    `${config.API_LOCATION}/timeline/segment/annotation/create`,
                    params
                )
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.addToStore([res.data.entry])
                        timelineSegmentStore.addAnnotation([{ timelineSegmentId, entry: res.data.entry }])
                        return res.data.entry.id;
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async toggle({ timelineSegmentId, annotationId }) {
            const params = {
                timeline_segment_id: timelineSegmentId,
                annotation_id: annotationId,
            };


            const annotationCategoryStore = useAnnotationCategoryStore()
            const annotationStore = useAnnotationStore()

            return axios
                .post(
                    `${config.API_LOCATION}/timeline/segment/annotation/toggle`,
                    params
                )
                .then((res) => {
                    if (res.data.status === "ok") {
                        if ("annotation_added" in res.data) {
                            annotationStore.add(res.data.annotation_added);
                        }
                        if ("annotation_category_added" in res.data) {
                            annotationCategoryStore.add(res.data.annotation_category_added);
                        }
                        if ("timeline_segment_annotation_deleted" in res.data) {
                            this.deleteFromStore(res.data.timeline_segment_annotation_deleted);
                        }
                        if ("timeline_segment_annotation_added" in res.data) {
                            this.addToStore(res.data.timeline_segment_annotation_added);
                        }
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async delete(id) {
            const params = {
                timeline_segment_annotation_id: id,
            };

            const timelineSegmentStore = useTimelineSegmentStore()


            return axios
                .post(
                    `${config.API_LOCATION}/timeline/segment/annotation/delete`,
                    params
                )
                .then((res) => {
                    if (res.data.status === "ok") {
                        [res.data.entry].forEach((id, i) => {
                            let index = state.timelineSegmentAnnotationList.findIndex(
                                (f) => f === id
                            );
                            state.timelineSegmentAnnotationList.splice(index, 1);
                            delete state.timelineSegmentAnnotations[id];
                        });
                        timelineSegmentStore.deleteAnnotation([id]);
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        async fetchForVideo({ videoId }) {
            let params = {};
            if (videoId) {
                params.video_id = videoId;
            } else {

                const playerStore = usePlayerStore();
                const videoId = playerStore.videoId;
                if (videoId) {
                    params.video_id = videoId;
                }
            }
            return axios
                .get(`${config.API_LOCATION}/timeline/segment/annotation/list`, {
                    params,
                })
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.replaceStore(res.data.entries)
                    }
                });
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'collection' };
            //     commit('error/update', info, { root: true });
            // });
        },
        deleteFromStore(timelineSegmentAnnotations) {
            timelineSegmentAnnotations.forEach((id, i) => {
                let index = this.timelineSegmentAnnotationList.findIndex(
                    (f) => f === id
                );
                this.timelineSegmentAnnotationList.splice(index, 1);
                delete this.timelineSegmentAnnotations[id];
            });
            this.updateTimeStore()
        },
        addToStore(timelineSegmentAnnotations) {
            timelineSegmentAnnotations.forEach((e, i) => {
                this.timelineSegmentAnnotations[e.id] = e;
                this.timelineSegmentAnnotationList.push(e.id);
            });
            this.updateTimeStore()
        },
        replaceStore(timelineSegmentAnnotations) {
            this.timelineSegmentAnnotations = {};
            this.timelineSegmentAnnotationList = [];
            timelineSegmentAnnotations.forEach((e, i) => {
                this.timelineSegmentAnnotations[e.id] = e;
                this.timelineSegmentAnnotationList.push(e.id);
            });
            this.updateTimeStore()
        },
        updateTimeStore() {
            const timelineSegmentStore = useTimelineSegmentStore()
            timelineSegmentStore.all.forEach((e) => {
                for (var i = Math.floor(e.start); i < Math.ceil(e.end); i++) {
                    if (i in this.timelineSegmentAnnotationByTime) {
                        this.forTimelineSegment(e.id).forEach((timelineSegmentAnnotation) => {
                            this.timelineSegmentAnnotationByTime[i].push(timelineSegmentAnnotation.id)
                        })
                    }
                    else {
                        this.timelineSegmentAnnotationByTime[i] =
                            this.forTimelineSegment(e.id).map((timelineSegmentAnnotation) => timelineSegmentAnnotation.id)
                    }
                }
            })
        }
    },
})