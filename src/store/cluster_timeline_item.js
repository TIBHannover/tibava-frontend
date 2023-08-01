import Vue from "vue";
import axios from "../plugins/axios";
import config from "../../app.config";

import { defineStore } from "pinia";

export const useClusterTimelineItemStore = defineStore("clusterTimelineItem", {
    state: () => {
        return {
            clusterTimelineItems: {},
            clusterTimelineItemList: [],
            isLoading: false,
        };
    },
    getters: {
        all(state) {
            return state.clusterTimelineItemList.map((id) => state.clusterTimelineItems[id]);
        },
        get(state){
            return (id) => {
                return state.clusterTimelineItems[id];
            };
        },
        hasTimeline(state){
            return (cluster_id) => {
                if (this.clusterTimelineItemList.length === 0){
                    return false;
                }
                for(const key in state.clusterTimelineItems){
                    if (state.clusterTimelineItems[key].cluster_id.replaceAll("-", "") === cluster_id){
                        return true;
                    }
                };

                return false;
            }
        },
        getNameByCluster(state){
            return (cluster_id) => {
                var index = -1;
                var name = "Not Found";
                for(const key in state.clusterTimelineItems){
                    if (state.clusterTimelineItems[key].cluster_id.replaceAll("-", "") === cluster_id){
                        index = key;
                        name = state.clusterTimelineItems[key].name;
                    }
                };

                return name;
            }
        },
        getTimelineByCluster(state){
            return (cluster_id) => {
                for (const key in state.clusterTimelineItems){
                    if (state.clusterTimelineItems[key].cluster_id.replaceAll("-", "") === cluster_id){
                        return state.clusterTimelineItems[key].timeline_id;
                    }
                }
                return null;
            }
        },
        getIDByCluster(state){
            return (cluster_id) => {
                for (const key in state.clusterTimelineItems){
                    if (state.clusterTimelineItems[key].cluster_id.replaceAll("-", "") === cluster_id){
                        return state.clusterTimelineItems[key].id;
                    }
                }
                return -1;
            }
        }
    },
    actions: {
        async fetchAll() {
            if (this.isLoading) {
                return
            }
            this.isLoading = true

            return axios.get(`${config.API_LOCATION}/clusterTimelineItem/fetch`)
                .then((res) => {
                    if (res.data.status === "ok") {
                        this.replaceStore(res.data.entries);
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        async rename({ cti_id, name }) {
            if (this.isLoading) {
              return;
            }
            this.isLoading = true;
      
            let params = {
              id: cti_id,
              name: name,
            };
      
            const updated_ctis = { ...this.clusterTimelineItems };
            updated_ctis[cti_id].name = name;
            Vue.set(this, "clusterTimelineItems", updated_ctis);
      
            return axios
              .post(`${config.API_LOCATION}/clusterTimelineItem/rename`, params)
              .then((res) => {
                if (res.data.status === "ok") {
                }
              })
              .finally(() => {
                this.isLoading = false;
              });
        },
        setNewNameByCluster(cluster_id, newname){
                for (const key in this.clusterTimelineItems){
                    if (this.clusterTimelineItems[key].cluster_id.replaceAll("-", "") === cluster_id){
                        this.clusterTimelineItems[key].name = newname;
                        return true;
                    }
                }
                return false;
        },
        deleteFromStore(ids) {
            ids.forEach((id, i) => {
                let index = this.clusterTimelineItemList.findIndex((f) => f === id);
                this.clusterTimelineItemList.splice(index, 1);
                delete this.clusterTimelineItems[id];
            });
        },
        addToStore(clusterTimelineItem) {
            this.clusterTimelineItems[clusterTimelineItem.id] = clusterTimelineItem;
            this.clusterTimelineItemList.push(clusterTimelineItem.id);
        },
        replaceStore(items) {
            this.clusterTimelineItems = {};
            this.clusterTimelineItemList = [];
            items.forEach((e, i) => {
                this.clusterTimelineItems[e.id] = e;
                this.clusterTimelineItemList.push(e.id);
            });
        },

    },
});