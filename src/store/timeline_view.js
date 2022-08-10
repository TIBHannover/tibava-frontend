import Vue from "vue";
import axios from "../plugins/axios";
import config from "../../app.config";
import { defineStore } from "pinia";
import { usePlayerStore } from "@/store/player";

export const useTimelineViewStore = defineStore("timelineView", {
  state: () => {
    return {
      timelineViews: {},
      timelineViewList: [],
      isLoading: false,
    };
  },
  getters: {
    forVideo(state) {
      return (videoId) => {
        return state.timelineViewList
          .map((id) => state.timelineViews[id])
          .filter((e) => e.video_id === videoId);
      };
    },
    all(state) {
      return state.timelineViewList.map((id) => state.timelineViews[id]);
    },
    get(state) {
      return (id) => {
        return state.timelineViews[id];
      };
    },
  },
  actions: {
    async fetchForVideo({ videoId = null, clear = true }) {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;

      //use video id or take it from the current video
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
      if (clear) {
        this.clearStore();
      }
      return axios
        .get(`${config.API_LOCATION}/timeline/view/list`, { params })
        .then((res) => {
          if (res.data.status === "ok") {
            this.updateStore(res.data.entries);
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
      // .catch((error) => {
      //     const info = { date: Date(), error, origin: 'collection' };
      //     commit('error/update', info, { root: true });
      // });
    },

    async duplicate({ id, name = null }) {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;

      let params = {
        id: id,
        name: name,
      };
      return axios
        .post(`${config.API_LOCATION}/timeline/view/duplicate`, params)
        .then((res) => {
          if (res.data.status === "ok") {
            this.addToStore([res.data.entry]); // TODO rename
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    async create({ name = "View", videoId = null }) {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;

      let params = {
        name: name,
      };

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
        .post(`${config.API_LOCATION}/timeline/view/create`, params)
        .then((res) => {
          if (res.data.status === "ok") {
            this.addToStore([res.data.entry]);
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
      // .catch((error) => {
      //     const info = { date: Date(), error, origin: 'upload' };
      //     commit('error/update', info, { root: true });
      // });
    },
    async delete(id) {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;

      let params = {
        id: id,
      };

      // update own store
      this.deleteFromStore([id]);

      // TODO update
      //   const timelineSegmentStore = useTimelineSegmentStore();
      //   timelineSegmentStore.deleteTimeline(id);

      return axios
        .post(`${config.API_LOCATION}/timeline/view/delete`, params)
        .then((res) => {
          if (res.data.status === "ok") {
            // commit("delete", timeline_id);
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
      // .catch((error) => {
      //     const info = { date: Date(), error, origin: 'collection' };
      //     commit('error/update', info, { root: true });
      // });
    },

    async rename({ id, name }) {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;

      let params = {
        id: id,
        name: name,
      };

      const newTimelineViews = { ...this.timelineViews };
      newTimelineViews[id].name = name;
      Vue.set(this, "timelineViews", newTimelineViews);

      return axios
        .post(`${config.API_LOCATION}/timeline/view/rename`, params)
        .then((res) => {
          if (res.data.status === "ok") {
            // commit("rename", { id, name });
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    clearStore() {
      this.timelineViews = {};
      this.timelineViewList = [];
    },
    deleteFromStore(ids) {
      ids.forEach((id, i) => {
        let index = this.timelineViewList.findIndex((f) => f === id);
        this.timelineViewList.splice(index, 1);
        delete this.timelineViews[id];
      });
    },
    addToStore(timelines) {
      timelines.forEach((e, i) => {
        this.timelineViews[e.id] = e;
        this.timelineViewList.push(e.id);
      });
    },
    updateStore(timelines) {
      timelines.forEach((e, i) => {
        if (e.id in this.timelineViews) {
          return;
        }
        this.timelineViews[e.id] = e;
        this.timelineViewList.push(e.id);
      });
    },
  },
});
