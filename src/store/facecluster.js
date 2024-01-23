import config from "../../app.config";
import axios from "../plugins/axios";
import { defineStore } from "pinia";
import { usePlayerStore } from "./player";
import { usePluginRunStore } from "./plugin_run";
import { usePluginRunResultStore } from "./plugin_run_result";

export const useFaceclusterStore = defineStore("facecluster", {
  state: () => {
    return {
      current_clustering: null,
      isLoading: false,
      faceRefDict: {},
    };
  },
  getters: {
    clusters(state) {
      const pluginRunStore = usePluginRunStore();
      const pluginRunResultStore = usePluginRunResultStore();
      const playerStore = usePlayerStore();

      // selection of timeline to be used for the thumbnails
      let face_clustering = pluginRunStore
        .forVideo(playerStore.videoId)
        .filter((e) => {
          return e.type == "face_clustering" && e.status == "DONE";
        })
        .map((e) => {
          e.results = pluginRunResultStore.forPluginRun(e.id);
          return e;
        })
        .sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        })
        ;
      if (!face_clustering.length) {
        return [];
      }
      state.current_clustering = face_clustering.at(0); // use latest face_clustering

      // // if there is more than one face_clustering result for this video, delete all the 'old' ones to preserve memory
      // if (face_clustering.length > 1) {
      //   if (state.isLoading) {
      //     return [];
      //   }
      //   state.isLoading = true;

      //   let plugin_list = [];

      //   face_clustering = face_clustering.slice(1)

      //   face_clustering.forEach((item) => plugin_list.push(item.id));

      //   if (plugin_list.length > 1) {
      //     let params = {
      //       plugin_list: plugin_list
      //     }

      //     axios.post(`${config.API_LOCATION}/plugin/run/delete`, params)
      //       .then((res) => {
      //         if (res.data.status !== "ok") {
      //           console.log("Error in plugin/run/delete");
      //           console.log(res.data);
      //         } else {
      //           pluginRunStore.delete(plugin_list);
      //           pluginRunResultStore.deleteForPluginRuns(plugin_list);
      //         }
      //       })
      //       .finally(() => {
      //         state.isLoading = false;
      //       });
      //   }
      // }


      let clustering = state.current_clustering.results.filter((plugin_run_result) =>
        plugin_run_result.type == "CLUSTER"
      )

      if (clustering.length != 1) {
        return [];
      }
      clustering = clustering[0]

      let images = state.current_clustering.results.filter((plugin_run_result) =>
        plugin_run_result.type == "IMAGES"
      )

      if (images.length != 1) {
        return [];
      }
      images = images[0]

      let images_lut = {}

      // console.log(JSON.stringify(images, null, 2));
      images.data.images.forEach(element => {
        images_lut[element.ref_id] = element
      });

      let faces = state.current_clustering.results.filter((plugin_run_result) =>
        plugin_run_result.type == "FACE"
      )

      if (faces.length != 1) {
        return [];
      }
      faces = faces[0]

      let embeddings = state.current_clustering.results.filter((plugin_run_result) =>
        plugin_run_result.type == "IMAGE_EMBEDDINGS"
      )

      if (embeddings.length != 1) {
        return [];
      }
      embeddings = embeddings[0]



      // console.log(JSON.stringify(clustering, null, 2));
      // console.log(JSON.stringify(embeddings, null, 2));
      let results = clustering.data.cluster
        .sort(
          // bigger clusters should come first
          (a, b) => b.embedding_ref_ids.length - a.embedding_ref_ids.length
        ).map((cluster, index) => {
          return {
            id: index + 1,
            clustering_data_id: clustering.data_id,
            systemId: cluster.id,
            cluster: cluster,
            faces_refs: cluster.embedding_ref_ids,
            timestamps: Array.from(cluster.embedding_ref_ids.map((embedding_ref_id) => {
              return images_lut[embedding_ref_id].time
            })),
            sample_faces_refs: cluster.sample_embedding_ref_ids,
            sample_timestamps: Array.from(cluster.sample_embedding_ref_ids.map((embedding_ref_id) => {
              return images_lut[embedding_ref_id].time
            }))
          }
        })

      return results;
    }
  },
  actions: {
    getFilteredFaceRefs(deletedFaces, cluster_id) {
      let current_cluster_embedding_ref_ids = this.current_clustering.results[0].data.cluster
        .filter((cluster) => cluster.id == cluster_id)[0].embedding_ref_ids;

      if (deletedFaces.length > 0) {
        current_cluster_embedding_ref_ids = current_cluster_embedding_ref_ids
          .filter((ref) => !deletedFaces.includes(ref));
      }

      return current_cluster_embedding_ref_ids.map((ref) => this.faceRefDict[ref]);
    },
  }
},);
