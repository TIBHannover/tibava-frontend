<template>
    <v-dialog v-model="show" width="100%" persistent>
        <template v-slot:activator="{ on }">
            <v-btn @click="openGraph" style="color: rgb(175, 20, 20);">&nbsp; Show as Graph&nbsp;
                <v-icon color="primary">mdi-arrow-top-right-bold-box-outline</v-icon>
            </v-btn>
        </template>
        <v-card style="height: 90vh;">
            <v-card-title>Graph Visualization</v-card-title>
            <v-card-subtitle>Use the mouse to interact and zoom.</v-card-subtitle>

            <div v-if="loading" class="loading-container">
                <div class="spinner">
                    <i class="mdi mdi-loading mdi-spin"></i>
                </div>
                <div class="loading-text">Loading...</div>
            </div>
            <div id="graphContainer">
            </div>

            <v-card-actions variant="tonal">
                <v-row>
                    <v-col cols="1">
                        <v-text-field v-if="!loading" label="Minimum Cluster Size" v-model="desired_min_size" type="number"
                            @input="updateText"></v-text-field>
                    </v-col>
                    <v-col cols="1"></v-col>
                    <v-col cols="4">
                        <v-label>Connect clusters if elements appeared in the same:</v-label>
                        <v-switch v-model="shotVisualization" label="Shot">
                            <template #prepend>
                                <v-label>Frame</v-label>
                            </template>

                        </v-switch>
                    </v-col>
                    <v-col cols="1">
                        <v-switch v-model="includePlacesNodes" label="$t('modal.places_toggle')">
                        </v-switch>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col cols="1">
                        <v-btn @click="close">{{ $t("button.close") }}</v-btn>
                    </v-col>
                </v-row>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import "vis";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import { mapStores } from "pinia";
import { useFaceclusterStore } from "@/store/facecluster";
import { usePlaceclusterStore } from "@/store/placecluster";
import { useShotStore } from "@/store/shot";
import { useClusterTimelineItemStore } from "../store/cluster_timeline_item";

export default {
    props: ["clusters"],
    data() {
        return {
            show: false,
            clusterList: [],
            nodes: null,
            edges: null,
            loading: true,
            cluster_min_size: 0,
            cluster_max_size: null,
            desired_min_size: 0,
            network: null,
            data: null,
            options: null,
            debounceTimer: null,
            shotVisualization: true,
            includePlacesNodes: false
        };
    },
    created() {
        this.fetchClusters();
        this.prepareData();
    },
    mounted() {
        this.isGraphInitialized = true;
    },
    methods: {
        updateText() {
            // Clear the previous debounce timer, if any
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }

            // Set a new debounce timer to update the content after 500 milliseconds (adjust the delay as needed)
            this.debounceTimer = setTimeout(() => {
                // Your update logic here
                this.openGraph();
            }, 500);
        },
        prepareData() {
            if (this.clusterList.length == 0) {
                return;
            }
            const clusterTimelineItemStore = useClusterTimelineItemStore();

            this.clusterList.forEach((cluster) => {
                if (cluster.timestamps.length < this.cluster_min_size) {
                    this.cluster_min_size = cluster.timestamps.length;
                }
                if (cluster.timestamps.length > this.cluster_max_size) {
                    this.cluster_max_size = cluster.timestamps.length;
                }
                if (this.shotVisualization) {
                    cluster.shots = [];
                }
            });


            const shotStore = useShotStore();
            const shots = shotStore.shots;

            if (this.shotVisualization) {
                // for each shot
                for (const shot of shots) {
                    // iterate over all clusters
                    for (const [index, cluster] of Object.entries(this.clusterList)) {
                        // if an object of the cluster is in the shot
                        for (const timestamp of cluster.timestamps) {
                            // console.log(timestamp);
                            if (shot.start <= timestamp & shot.end >= timestamp) {
                                if (!cluster.shots.includes(shot.id)) {
                                    cluster.shots.push(shot.id);
                                }
                            }
                        }
                    }
                }
            }

            // save the shotnumber to this cluster

            let dataset = [];
            this.clusterList.forEach((cluster) => {
                if (cluster.timestamps.length < this.desired_min_size) {
                    return;
                }
                dataset.push({
                    id: cluster.id,
                    label: `${clusterTimelineItemStore.getName(cluster.systemId)} (${cluster.timestamps.length})`,
                    value: cluster.timestamps.length
                })
            });

            // add place clusters nodes
            let placeclusterList = [];
            if (this.includePlacesNodes) {
                placeclusterList = this.placeclusterStore.clusters
                    .filter((item) => this.clusterTimelineItemStore.getID(item.systemId) !== -1)
                    .filter((cluster) => cluster.timestamps.length >= this.desired_min_size);
                placeclusterList.forEach((cluster) => {
                    dataset.push({
                        id: 'place' + cluster.id,
                        label: `Place ${clusterTimelineItemStore.getName(cluster.systemId)} (${cluster.timestamps.length})`,
                        value: cluster.timestamps.length,
                        color: {
                            background: 'white',
                            border: 'blue',
                            highlight: 'blue',
                        },
                    });
                });
            }

            this.nodes = new DataSet(dataset);

            let connections = [];
            let checked = [];
            this.clusterList.forEach((cluster) => {
                if (cluster.timestamps.length < this.desired_min_size) {
                    return;
                }

                this.clusterList.forEach((conn_cluster) => {
                    if (cluster.id === conn_cluster.id) {
                        return;
                    }
                    if (checked.includes(String(cluster.id) + String(conn_cluster.id))) {
                        return;
                    }
                    let value = 0;
                    if (!this.shotVisualization) {
                        cluster.timestamps.forEach((timestamp) => {
                            if (conn_cluster.timestamps.includes(timestamp)) {
                                value++;
                            }
                        });
                    } else { // this.shotVisualization == true
                        cluster.shots.forEach((shot) => {
                            if (conn_cluster.shots.includes(shot)) {
                                value++;
                            }
                        })
                    }
                    if (value > 0) {
                        connections.push({ from: cluster.id, to: conn_cluster.id, value: value, label: String(value) });
                    }
                    checked.push(String(cluster.id) + String(conn_cluster.id));
                    checked.push(String(conn_cluster.id) + String(cluster.id));
                });
                placeclusterList.forEach((place) => {
                    let value = 0;
                    cluster.timestamps.forEach((timestamp) => {
                        if (place.timestamps.includes(timestamp)) {
                            value++;
                        }
                    });
                    if (value > 0) {
                        connections.push({ from: cluster.id, to: 'place' + place.id, value: value, label: String(value), color: 'blue' });
                    }

                });
            });
            this.edges = new DataSet(connections);

        },
        openGraph() {

            if (!this.isGraphInitialized) {
                return;
            }

            this.prepareData();
            // Destroy the existing network (if it exists)
            if (this.network) {
                this.network.destroy();
            }

            this.show = true;
            this.loading = true;

            this.$nextTick(() => {

                // Define your GraphML data here

                this.data = {
                    nodes: this.nodes,
                    edges: this.edges,
                };

                this.options = {
                    nodes: {

                        color: {
                            background: '#ffffff',
                            border: '#ae1313',
                            highlight: '#ae1313',
                        },
                        shape: 'dot',
                        font: {
                            size: 25,
                        },
                        borderWidth: 2,
                        shadow: true,
                        scaling: {
                            max: 50
                        }
                    },
                    edges: {
                        length: 300,
                        smooth: {
                            forceDirection: "none"
                        }
                    },
                };

                const container = document.getElementById("graphContainer");
                this.network = new Network(container, this.data, this.options);

                const functionThatDoesWhatYouNeed = () => {
                    this.loading = false;
                }
                this.network.on('afterDrawing', functionThatDoesWhatYouNeed);
            })
        },
        fetchClusters() {
            let tempList = this.faceclusterStore.clusters;

            if (tempList.length == 0) {
                return
            }

            this.clusterList = tempList.filter((item) => this.clusterTimelineItemStore.getID(item.systemId) !== -1);
        },
        close() {
            this.show = false;
        },
    },
    computed: {
        availableClusters() {
            const clusterTimelineItemStore = useClusterTimelineItemStore();
            return clusterTimelineItemStore.all.length;
        },
        ...mapStores(useFaceclusterStore, usePlaceclusterStore, useClusterTimelineItemStore, useShotStore)
    },
    watch: {
        availableClusters(num) {
            this.fetchClusters();
        },
        shotVisualization(shot) {
            this.openGraph();
        },
        includePlacesNodes() {
            this.openGraph();
        }
    }
};
</script>


<style>
#graphContainer {
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 79%;
    max-height: 75vh;
    margin-bottom: 5px;
}

.clusterslider {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 0px;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 75vh;
    max-height: 75vh;
    overflow-y: auto;
    margin-bottom: 5px;
}

.spinner {
    font-size: 48px;
    color: #ac1414;
}

.loading-text {
    margin-top: 10px;
    font-size: 18px;
}
</style>