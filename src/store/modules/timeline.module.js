import Vue from "vue";
import router from "../../router";
import axios from "../../plugins/axios";
import config from "../../../app.config";
import { isEqual, lsplit, keyInObj } from "../../plugins/helpers";

const api = {
  namespaced: true,
  state: {
    timelines: {},
    timelineList: [],
  },
  getters: {
    forVideo: (state) => (videoId) => {
      return state.timelineList
        .map((id) => state.timelines[id])
        .filter((e) => e.video_id === videoId);
    },
    all: (state) => {
      return state.timelineList.map((id) => state.timelines[id]);
    },
    get: (state) => (id) => {
      return state.timelines[id];
    },
    segmentPosition: (state) => (segmentId) => {
      let result = null;
      state.timelineList
        .map((id) => state.timelines[id])
        .forEach((timeline, timelinePos) => {
          if (timeline.segments != null) {
            timeline.segments.forEach((segment, segmentPos) => {
              if (segment.id === segmentId) {
                result = { timeline: timelinePos, segment: segmentPos };
              }
            });
          }
        });
      return result;
    },
    getSegmentByPosition: (state) => (timelinePos, segmentPos) => {
      console.log(timelinePos);
      console.log(segmentPos);
      let result = null;
      state.timelineList
        .map((id) => state.timelines[id])
        .forEach((timeline, iTimelinePos) => {
          if (timeline.segments != null && timelinePos === iTimelinePos) {
            timeline.segments.forEach((segment, iSegmentPos) => {
              if (iSegmentPos === segmentPos) {
                result = segment.id;
              }
            });
          }
        });
      return result;
    },
  },
  actions: {
    async listAdd({ commit }, video_id) {
      let params = {
        id: video_id,
      };
      return axios
        .get(`${config.API_LOCATION}/timeline/list`, { params })
        .then((res) => {
          if (res.data.status === "ok") {
            commit("add", res.data.entries);
          }
        });
      // .catch((error) => {
      //     const info = { date: Date(), error, origin: 'collection' };
      //     commit('error/update', info, { root: true });
      // });
    },

    async listUpdate({ commit }, { videoId = null }) {
      //use video id or take it from the current video
      let params = {};
      if (videoId) {
        params.video_id = videoId;
      } else {
        const video = this.getters["video/current"];
        if (video) {
          params.video_id = video.id;
        }
      }
      return axios
        .get(`${config.API_LOCATION}/timeline/list`, { params })
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

    async duplicate(
      { commit },
      { id, name = null, includeannotations = true }
    ) {
      let params = {
        id: id,
        name: name,
        includeannotations: includeannotations,
      };
      return axios
        .post(`${config.API_LOCATION}/timeline/duplicate`, params)
        .then((res) => {
          if (res.data.status === "ok") {
            commit("add", [res.data.entry]);
          }
        });
      // .catch((error) => {
      //     const info = { date: Date(), error, origin: 'upload' };
      //     commit('error/update', info, { root: true });
      // });
    },
    async create({ commit }, { name, videoId = null }) {
      let params = {
        name: name,
      };

      if (videoId) {
        params.video_id = videoId;
      } else {
        const video = this.getters["video/current"];
        if (video) {
          params.video_id = video.id;
        }
      }
      return axios
        .post(`${config.API_LOCATION}/timeline/create`, params)
        .then((res) => {
          if (res.data.status === "ok") {
            commit("add", res.data.timeline_added);
            commit("timelineSegment/add", res.data.timeline_segment_added, {
              root: true,
            });
          }
        });
      // .catch((error) => {
      //     const info = { date: Date(), error, origin: 'upload' };
      //     commit('error/update', info, { root: true });
      // });
    },
    async importEAF({ commit }, params) {
      const formData = new FormData();

      //use video id or take it from the current video
      const video = this.getters["video/current"];
      formData.append("file", params.importfile);
      formData.append("video_id", video.id);

      console.log(params);
      console.log(formData);

      return axios.post(
        `${config.API_LOCATION}/timeline/import/eaf`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    },
    async delete({ commit }, timeline_id) {
      let params = {
        id: timeline_id,
      };
      return axios
        .post(`${config.API_LOCATION}/timeline/delete`, params)
        .then((res) => {
          if (res.data.status === "ok") {
            commit("delete", timeline_id);
          }
        });
      // .catch((error) => {
      //     const info = { date: Date(), error, origin: 'collection' };
      //     commit('error/update', info, { root: true });
      // });
    },

    async rename({ commit }, { timelineId, name }) {
      let params = {
        id: timelineId,
        name: name,
      };
      return axios
        .post(`${config.API_LOCATION}/timeline/rename`, params)
        .then((res) => {
          if (res.data.status === "ok") {
            commit("rename", { timelineId, name });
          }
        });
      // .catch((error) => {
      //     const info = { date: Date(), error, origin: 'collection' };
      //     commit('error/update', info, { root: true });
      // });
    },
    async changevisualization({ commit }, { timelineId, visualization }) {
      let params = {
        id: timelineId,
        visualization: visualization,
      };
      console.log(timelineId);
      console.log(params);

      commit("changevisualization", { timelineId, visualization });
      return axios
        .post(`${config.API_LOCATION}/timeline/changevisualization`, params)
        .then((res) => {
          if (res.data.status === "ok") {
          }
        });
    },
    async setparent({ commit }, { timelineId, parentId }) {
      let params = {
        timelineId: timelineId,
        parentId: parentId,
      };

      if (!parentId) {
        params.parentId = null;
      }

      console.log(timelineId);
      console.log(params);
      commit("setparent", { timelineId, parentId });
      return axios
        .post(`${config.API_LOCATION}/timeline/setparent`, params)
        .then((res) => {
          if (res.data.status === "ok") {
          }
        });
    },
    async setcollapse({ commit }, { timelineId, collapse }) {
      let params = {
        timelineId: timelineId,
        collapse: collapse,
      };
      console.log(timelineId, collapse);
      commit("setcollapse", { timelineId, collapse });
      return axios
        .post(`${config.API_LOCATION}/timeline/setcollapse`, params)
        .then((res) => {
          if (res.data.status === "ok") {
          }
        });
    },
    async setorder({ commit }, { order }) {
      let params = {
        order: order,
      };
      console.log(order);
      commit("setorder", { order });
      return axios
        .post(`${config.API_LOCATION}/timeline/setorder`, params)
        .then((res) => {
          if (res.data.status === "ok") {
          }
        });
    },
  },
  mutations: {
    add(state, timelines) {
      console.log("Timeline::add");
      console.log(JSON.stringify(timelines));
      timelines.forEach((e, i) => {
        console.log(e.id);
        state.timelines[e.id] = e;
        state.timelineList.push(e.id);
      });
      console.log(JSON.stringify(state.timelineList));
    },
    update(state, timelines) {
      state.timelines = {};
      state.timelineList = [];
      timelines.forEach((e, i) => {
        state.timelines[e.id] = e;
        state.timelineList.push(e.id);
      });
    },
    rename(state, args) {
      const newTimelines = { ...state.timelines };
      newTimelines[args.timelineId].name = args.name;
      Vue.set(state, "timelines", newTimelines);
      // console.log(args);
      // var timeline = state.timelines[args.timelineId];
      // timeline.name = args.name;
      // console.log(Vue.set(state.timelines, args.timelineId, timeline));
    },
    setparent(state, args) {
      const newTimelines = { ...state.timelines };
      newTimelines[args.timelineId].parent_id = args.parentId;
      Vue.set(state, "timelines", newTimelines);
    },
    setcollapse(state, args) {
      const newTimelines = { ...state.timelines };
      newTimelines[args.timelineId].collapse = args.collapse;
      Vue.set(state, "timelines", newTimelines);
    },
    setorder(state, args) {
      Vue.set(state, "timelineList", args.order);
    },
    changevisualization(state, args) {
      const newTimelines = { ...state.timelines };
      newTimelines[args.timelineId].visualization = args.visualization;
      Vue.set(state, "timelines", newTimelines);
    },
    delete(state, timeline_id) {
      let timeline_index = state.timelineList.findIndex(
        (e) => e === timeline_id
      );
      state.timelineList.splice(timeline_index, 1);
      delete state.timelines[timeline_id];
      //TODO we don't need to send changes to the backend
      this.commit("timelineSegment/deleteTimeline", timeline_id, {
        root: true,
      });
    },
  },
};
export default api;
