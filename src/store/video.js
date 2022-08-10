import Vue from "vue";
import axios from "../plugins/axios";
import config from "../../app.config";

import { defineStore } from "pinia";
import { usePlayerStore } from "./player";
import { useAnnotationStore } from "./annotation";
import { useShortcutStore } from "./shortcut";
import { useAnnotationShortcutStore } from "./annotation_shortcut";
import { useAnnotationCategoryStore } from "./annotation_category";
import { useTimelineViewStore } from "./timeline_view";
import { useTimelineStore } from "./timeline";
import { useTimelineSegmentStore } from "./timeline_segment";
import { useTimelineSegmentAnnotationStore } from "./timeline_segment_annotation";

import { usePluginRunStore } from "./plugin_run";
import { usePluginRunResultStore } from "./plugin_run_result";

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useVideoStore = defineStore("video", {
  // other options...
  state: () => {
    return {
      videos: {},
      videoList: [],
      isLoading: false,
    };
  },
  getters: {
    all(state) {
      return state.videoList.map((id) => state.videos[id]);
    },
    get(state) {
      return (id) => {
        return state.videos[id];
      };
    },
  },
  actions: {
    async fetch({
      videoId,
      includeTimeline = true,
      includeAnnotation = true,
      includeAnalyser = true,
      includeShortcut = true,
      addResults = true,
    }) {
      this.isLoading = true;
      let promises = [];
      const playerStore = usePlayerStore();
      const annotationCategoryStore = useAnnotationCategoryStore();
      const annotationStore = useAnnotationStore();
      const timelineViewStore = useTimelineViewStore();
      const timelineStore = useTimelineStore();
      const timelineSegmentStore = useTimelineSegmentStore();
      const timelineSegmentAnnotationStore =
        useTimelineSegmentAnnotationStore();
      const pluginRunStore = usePluginRunStore();
      const pluginRunResultStore = usePluginRunResultStore();
      const shortcutStore = useShortcutStore();
      const annotationShortcutStore = useAnnotationShortcutStore();

      promises.push(playerStore.fetchVideo({ videoId }));
      if (includeAnnotation) {
        annotationCategoryStore.clearStore();
        annotationStore.clearStore();
        promises.push(annotationCategoryStore.fetchForVideo({ videoId }));
        promises.push(annotationStore.fetchForVideo({ videoId }));
      }
      if (includeTimeline) {
        promises.push(timelineViewStore.fetchForVideo({ videoId }));
        promises.push(
          timelineStore
            .fetchForVideo({ videoId })
            .then(() => {
              return timelineSegmentStore.fetchForVideo({ videoId });
            })
            .then(() => {
              return timelineSegmentAnnotationStore.fetchForVideo({ videoId });
            })
        );
      }
      if (includeAnalyser) {
        pluginRunStore.clearStore();
        pluginRunResultStore.clearStore();
        promises.push(
          pluginRunStore.fetchForVideo({
            videoId: videoId,
            addResults: addResults,
          })
        );
        promises.push(
          pluginRunResultStore.fetchForVideo({
            videoId: videoId,
            addResults: addResults,
          })
        );
      }
      if (includeShortcut) {
        shortcutStore.clearStore();
        annotationShortcutStore.clearStore();
        promises.push(shortcutStore.fetchForVideo({ videoId }));
        promises.push(annotationShortcutStore.fetchForVideo({ videoId }));
      }
      return Promise.all(promises).finally(() => {
        console.log("Loading done!");
        this.isLoading = false;
      });
    },
    async fetchAll() {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;

      return axios
        .get(`${config.API_LOCATION}/video/list`)
        .then((res) => {
          if (res.data.status === "ok") {
            this.replaceStore(res.data.entries);
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    async delete(video_id) {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;

      const params = {
        id: video_id,
      };
      return axios
        .post(`${config.API_LOCATION}/video/delete`, params)
        .then((res) => {
          if (res.data.status === "ok") {
            this.deleteFromStore([video_id]);
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
      // .catch((error) => {
      //     const info = { date: Date(), error, origin: "collection" };
      //     commit("error/update", info, { root: true });
      // });
    },
    async exportCSV(videoId = null) {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;

      let params = {};
      //use video id or take it from the current video

      if (videoId) {
        params.video_id = videoId;
      } else {
        const playerStore = usePlayerStore();
        const currentVideoId = playerStore.videoId;
        if (currentVideoId) {
          params.video_id = currentVideoId;
        }
      }
      return axios
        .get(`${config.API_LOCATION}/video/export/csv`, { params })
        .then((res) => {
          if (res.data.status === "ok") {
            let blob = new Blob([res.data.file], { type: "text/csv" });
            let link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = `${params.video_id}.csv`;
            link.click();
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
      // .catch((error) => {
      //   const info = { date: Date(), error, origin: 'collection' };
      //   commit('error/update', info, { root: true });
      // });
    },
    async exportJson(videoId = null) {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;

      let params = {};
      //use video id or take it from the current video

      if (videoId) {
        params.video_id = videoId;
      } else {
        const playerStore = usePlayerStore();
        const currentVideoId = playerStore.videoId;
        if (currentVideoId) {
          params.video_id = currentVideoId;
        }
      }
      return axios
        .get(`${config.API_LOCATION}/video/export/json`, { params })
        .then((res) => {
          if (res.data.status === "ok") {
            let blob = new Blob([res.data.file], { type: "text/json" });
            let link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = `${params.video_id}.json`;
            link.click();
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
      // .catch((error) => {
      //   const info = { date: Date(), error, origin: 'collection' };
      //   commit('error/update', info, { root: true });
      // });
    },
    clearStore() {
      this.videos = {};
      this.videoList = [];
    },
    deleteFromStore(ids) {
      ids.forEach((id, i) => {
        let index = this.videoList.findIndex((f) => f === id);
        this.videoList.splice(index, 1);
        delete this.videos[id];
      });
    },
    addToStore(video) {
      this.videos[video.id] = video;
      this.videoList.push(video.id);
    },
    replaceStore(videos) {
      this.videos = {};
      this.videoList = [];
      videos.forEach((e, i) => {
        this.videos[e.id] = e;
        this.videoList.push(e.id);
      });
    },
  },
});
