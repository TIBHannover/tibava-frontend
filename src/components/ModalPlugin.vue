<template>
  <v-dialog v-model="dialog" max-width="90%">
    <v-card>
      <v-card-title class="mb-2">
        {{ $t("modal.plugin.title") }}

        <v-btn icon @click="dialog = false" absolute right>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="3">
              <v-expansion-panels v-model="chosenGroups" multiple>
                <v-expansion-panel v-for="pluginGroup in pluginGroups" :key="pluginGroup.groupName">
                  <v-expansion-panel-header>
                    {{pluginGroup.groupName}}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content class="expansion-content">
                    <v-list dense shaped class="plugin-list">
                      <v-list-item v-for="plugin in pluginGroup.plugins" :key="plugin.name" link @click="choosePlugin(plugin)">
                        <v-icon left> {{ plugin.icon }} </v-icon>
                        <span class="text-button">{{ plugin.name }}</span>
                      </v-list-item>
                    </v-list>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
            <v-col cols="9">
              <v-card flat height="100%" v-if="pluginData !== null">
                <v-card-title> <v-icon left> {{ pluginData.icon }} </v-icon> {{ pluginData.name }} </v-card-title>
                <v-card-text>
                  <Parameters :parameters="pluginData.parameters"> </Parameters>

<<<<<<< HEAD
                <v-expansion-panels v-if="plugin.optional_parameters &&
                  plugin.optional_parameters.length > 0
                  ">
                  <v-expansion-panel>
                    <v-expansion-panel-header expand-icon="mdi-menu-down">
                      Advanced Options
                    </v-expansion-panel-header>
=======
                  <v-expansion-panels
                    v-if="
                      pluginData.optional_parameters &&
                      pluginData.optional_parameters.length > 0
                    "
                  >
                    <v-expansion-panel>
                      <v-expansion-panel-header expand-icon="mdi-menu-down">
                        Advanced Options
                      </v-expansion-panel-header>
>>>>>>> visualization-features

                      <v-expansion-panel-content>
                        <Parameters :parameters="pluginData.optional_parameters">
                        </Parameters>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-card-text>

<<<<<<< HEAD
              <v-card-actions class="pt-0">
                <v-btn @click="
                  runPlugin(
                    plugin.plugin,
                    plugin.parameters,
                    plugin.optional_parameters
                  )
                  ">{{ $t("modal.plugin.run") }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-tab-item>
        </v-tabs>
=======
                <v-card-actions class="pt-0">
                  <v-btn
                    @click="
                      runPlugin(
                        pluginData.plugin,
                        pluginData.parameters,
                        pluginData.optional_parameters
                      )
                    "
                    >{{ $t("modal.plugin.run") }}</v-btn
                  >
                </v-card-actions>
              </v-card>
              <v-card flat height="100%" v-else>
                <v-card-title>
                  {{$t("modal.plugin.choose")}}
                </v-card-title>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
>>>>>>> visualization-features
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-btn @click="dialog = false">{{ $t("modal.plugin.close") }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapStores } from "pinia";
import { usePluginRunStore } from "@/store/plugin_run";
import Parameters from "./Parameters.vue";
// import { useTimelineStore } from "../store/timeline";

export default {
  props: ["value"],
  data() {
    return {
      dialog: false,
      pluginData: null,
      chosenGroups: [],
      pluginGroups: [
        {
          groupName: this.$t("modal.plugin.plugin_groups.audio"),
          groupIcon: "",
          plugins: [
            {
<<<<<<< HEAD
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.whisper.timeline_name"),
              text: this.$t("modal.plugin.timeline_name"),
            },
          ],
          optional_parameters: [],
        },
        {
          name: this.$t("modal.plugin.face_clustering.plugin_name"),
          icon: "mdi-ungroup",
          plugin: "face_clustering",
          parameters: [
            {
              field: "slider",
              min: 0.0,
              max: 1.0,
              value: 0.5,
              step: 0.01,
              name: "cluster_threshold",
              hint_right: this.$t("modal.plugin.face_clustering.hint_left"),
              hint_left: this.$t("modal.plugin.face_clustering.hint_right"),
            }
          ],
          optional_parameters: [
            {
              field: "slider",
              min: 1,
              max: 10,
              value: 2,
              step: 1,
              name: "fps",
              text: this.$t("modal.plugin.fps"),
            }
          ],
        },
        {
          name: this.$t("modal.plugin.audio_waveform.plugin_name"),
          icon: "mdi-waveform",
          plugin: "audio_amp",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.audio_waveform.timeline_name"),
              text: this.$t("modal.plugin.timeline_name"),
            },
          ],
          optional_parameters: [
            {
              field: "slider",
              min: 1000,
              max: 24000,
              value: 8000,
              step: 1000,
              name: "sr",
              text: this.$t("modal.plugin.audio_waveform.sr"),
            },
          ],
        },
        {
          name: this.$t("modal.plugin.audio_rms.plugin_name"),
          icon: "mdi-waveform",
          plugin: "audio_rms",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.audio_rms.timeline_name"),
              text: this.$t("modal.plugin.timeline_name"),
            },
          ],
          optional_parameters: [
            // {
            //   field: "slider",
            //   min: 1000,
            //   max: 24000,
            //   value: 8000,
            //   step: 1000,
            //   name: "sr",
            //   text: this.$t("modal.plugin.audio_waveform.sr"),
            // },
          ],
        },
        {
          name: this.$t("modal.plugin.audio_frequency.plugin_name"),
          icon: "mdi-waveform",
          plugin: "audio_freq",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.audio_frequency.timeline_name"),
              text: this.$t("modal.plugin.timeline_name"),
            },
          ],
          optional_parameters: [
            {
              field: "slider",
              min: 1000,
              max: 24000,
              value: 8000,
              step: 1000,
              name: "sr",
              text: this.$t("modal.plugin.audio_frequency.sr"),
            },
            {
              field: "slider",
              min: 64,
              max: 512,
              value: 256,
              step: 64, // TODO: only valid for values with power of 2
              name: "n_fft",
              text: this.$t("modal.plugin.audio_frequency.n_fft"),
            },
          ],
        },
        {
          name: this.$t("modal.plugin.color_analysis.plugin_name"),
          icon: "mdi-palette",
          plugin: "color_analysis",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.color_analysis.timeline_name"),
              text: this.$t("modal.plugin.timeline_name"),
            },
            {
              field: "slider",
              min: 1,
              max: 8,
              value: 1,
              step: 1,
              name: "k",
              text: this.$t("modal.plugin.color_analysis.slider"),
            },
            // {
            //   field: "buttongroup",
            //   text: this.$t("modal.plugin.color_analysis.buttongroup"),
            //   name: "timeline_visualization",
            //   value: 0,
            //   buttons: [
            //     this.$t("modal.plugin.color_analysis.singletimeline"),
            //     this.$t("modal.plugin.color_analysis.multipletimelines"),
            //   ],
            // },
          ],
          optional_parameters: [
            {
              field: "slider",
              min: 1,
              max: 10,
              value: 2,
              step: 1,
              name: "fps",
              text: this.$t("modal.plugin.fps"),
            },
            {
              field: "slider",
              min: 24,
              max: 128,
              value: 48,
              step: 4,
              name: "max_resolution",
              text: this.$t("modal.plugin.color_analysis.max_resolution"),
            },
            {
              field: "slider",
              min: 5,
              max: 25,
              value: 10,
              step: 5,
              name: "max_iter",
              text: this.$t("modal.plugin.color_analysis.max_iter"),
            },
          ],
        },
        {
          name: this.$t("modal.plugin.color_brightness_analysis.plugin_name"),
          icon: "mdi-palette",
          plugin: "color_brightness_analysis",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t(
                "modal.plugin.color_brightness_analysis.timeline_name"
              ),
              text: this.$t("modal.plugin.timeline_name"),
            },
            // {
            //   field: "buttongroup",
            //   text: this.$t("modal.plugin.color_brightness_analysis.buttongroup"),
            //   name: "timeline_visualization",
            //   value: 0,
            //   buttons: [
            //     this.$t("modal.plugin.color_brightness_analysis.singletimeline"),
            //     this.$t("modal.plugin.color_brightness_analysis.multipletimelines"),
            //   ],
            // },
          ],
          optional_parameters: [
            {
              field: "slider",
              min: 1,
              max: 10,
              value: 2,
              step: 1,
              name: "fps",
              text: this.$t("modal.plugin.fps"),
            },
          ],
        },
        {
          name: this.$t("modal.plugin.shot_detection.plugin_name"),
          icon: "mdi-arrow-expand-horizontal",
          plugin: "shotdetection",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.shot_detection.timeline_name"),
              text: this.$t("modal.plugin.timeline_name"),
            },
          ],
          optional_parameters: [
            {
              field: "slider",
              min: 1,
              max: 10,
              value: 2,
              step: 1,
              name: "fps",
              text: this.$t("modal.plugin.fps"),
            },
          ],
        },
        {
          name: this.$t("modal.plugin.shot_density.plugin_name"),
          icon: "mdi-sine-wave",
          plugin: "shot_density",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.shot_density.timeline_name"),
              text: this.$t("modal.plugin.timeline_name"),
            },
            {
              field: "select_timeline",
              name: "shot_timeline_id",
              text: this.$t("modal.plugin.shot_density.input_timeline"),
            },
          ],
          optional_parameters: [
            {
              field: "slider",
              min: 1,
              max: 60,
              value: 10,
              step: 1,
              name: "bandwidth",
              text: this.$t("modal.plugin.shot_density.bandwidth"),
            },
            {
              field: "slider",
              min: 1,
              max: 10,
              value: 10,
              step: 1,
              name: "fps",
              text: this.$t("modal.plugin.fps"),
            },
          ],
        },
        {
          name: this.$t("modal.plugin.shot_type_classification.plugin_name"),
          icon: "mdi-video-switch",
          plugin: "shot_type_classification",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t(
                "modal.plugin.shot_type_classification.timeline_name"
              ),
              text: this.$t("modal.plugin.timeline_name"),
            },
            {
              field: "select_timeline",
              name: "shot_timeline_id",
              // value: this.shot_timelines_names[0],
              // items: this.shot_timelines_names,
              text: this.$t("modal.plugin.shot_timeline_name"),
              hint: this.$t("modal.plugin.shot_timeline_hint"),
            },
          ],
          optional_parameters: [
            {
              field: "slider",
              min: 1,
              max: 10,
              value: 2,
              step: 1,
              name: "fps",
              text: this.$t("modal.plugin.fps"),
            },
          ],
        },
        {
          name: this.$t("modal.plugin.places_classification.plugin_name"),
          icon: "mdi-map-marker",
          plugin: "places_classification",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t(
                "modal.plugin.places_classification.timeline_name"
              ),
              text: this.$t("modal.plugin.timeline_name"),
            },
            {
              field: "select_timeline",
              name: "shot_timeline_id",
              // value: this.shot_timelines_names[0],
              // items: this.shot_timelines_names,
              text: this.$t("modal.plugin.shot_timeline_name"),
              hint: this.$t("modal.plugin.shot_timeline_hint"),
            },
          ],
          optional_parameters: [
            {
              field: "slider",
              min: 1,
              max: 10,
              value: 2,
              step: 1,
              name: "fps",
              text: this.$t("modal.plugin.fps"),
            },
          ],
        },
        // {
        //   name: this.$t("modal.plugin.facedetection.plugin_name"),
        //   icon: "mdi-face-recognition",
        //   plugin: "insightface_detection",
        //   parameters: [
        //     {
        //       field: "text_field",
        //       name: "timeline",
        //       value: this.$t("modal.plugin.facedetection.timeline_name"),
        //       text: this.$t("modal.plugin.timeline_name"),
        //     },
        //   ],
        //   optional_parameters: [
        //     {
        //       field: "slider",
        //       min: 1,
        //       max: 10,
        //       value: 2,
        //       step: 1,
        //       name: "fps",
        //       text: this.$t("modal.plugin.fps"),
        //     },
        //   ],
        // },
        {
          name: this.$t("modal.plugin.facesize.plugin_name"),
          icon: "mdi-face-recognition",
          plugin: "insightface_facesize",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.facesize.timeline_name"),
              text: this.$t("modal.plugin.timeline_name"),
            },
            {
              field: "select_timeline",
              name: "shot_timeline_id",
              // value: this.shot_timelines_names[0],
              // items: this.shot_timelines_names,
              text: this.$t("modal.plugin.shot_timeline_name"),
              hint: this.$t("modal.plugin.shot_timeline_hint"),
            },
          ],
          optional_parameters: [
            {
              field: "slider",
              min: 1,
              max: 10,
              value: 2,
              step: 1,
              name: "fps",
              text: this.$t("modal.plugin.fps"),
            },
          ],
        },
        {
          name: this.$t("modal.plugin.aggregation.plugin_name"),
          icon: "mdi-sigma",
          plugin: "aggregate_scalar",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.aggregation.timeline_name"),
              text: this.$t("modal.plugin.timeline_name"),
            },
            {
              field: "select_scalar_timelines",
              name: "timeline_ids",
              text: this.$t("modal.plugin.scalar_timeline_name"),
              hint: this.$t("modal.plugin.scalar_timeline_hint"),
            },
            {
              field: "buttongroup",
              text: this.$t("modal.plugin.aggregation.method"),
              name: "aggregation",
              value: 0,
              buttons: [
                this.$t("modal.plugin.aggregation.logical_or"),
                this.$t("modal.plugin.aggregation.logical_and"),
                this.$t("modal.plugin.aggregation.mean"),
                this.$t("modal.plugin.aggregation.prod"),
=======
              name: this.$t("modal.plugin.audio_rms.plugin_name"),
              icon: "mdi-waveform",
              plugin: "audio_rms",
              parameters: [
                {
                  field: "text_field",
                  name: "timeline",
                  value: this.$t("modal.plugin.audio_rms.timeline_name"),
                  text: this.$t("modal.plugin.timeline_name"),
                },
              ],
              optional_parameters: [
>>>>>>> visualization-features
              ],
            },
            {
              name: this.$t("modal.plugin.audio_frequency.plugin_name"),
              icon: "mdi-waveform",
              plugin: "audio_freq",
              parameters: [
                {
                  field: "text_field",
                  name: "timeline",
                  value: this.$t("modal.plugin.audio_frequency.timeline_name"),
                  text: this.$t("modal.plugin.timeline_name"),
                },
              ],
              optional_parameters: [
                {
                  field: "slider",
                  min: 1000,
                  max: 24000,
                  value: 8000,
                  step: 1000,
                  name: "sr",
                  text: this.$t("modal.plugin.audio_frequency.sr"),
                },
                {
                  field: "slider",
                  min: 64,
                  max: 512,
                  value: 256,
                  step: 64, // TODO: only valid for values with power of 2
                  name: "n_fft",
                  text: this.$t("modal.plugin.audio_frequency.n_fft"),
                },
              ],
            },
            {
              name: this.$t("modal.plugin.audio_waveform.plugin_name"),
              icon: "mdi-waveform",
              plugin: "audio_amp",
              parameters: [
                {
                  field: "text_field",
                  name: "timeline",
                  value: this.$t("modal.plugin.audio_waveform.timeline_name"),
                  text: this.$t("modal.plugin.timeline_name"),
                },
              ],
              optional_parameters: [
                {
                  field: "slider",
                  min: 1000,
                  max: 24000,
                  value: 8000,
                  step: 1000,
                  name: "sr",
                  text: this.$t("modal.plugin.audio_waveform.sr"),
                },
              ],
            },
            {
              name: this.$t("modal.plugin.whisper.plugin_name"),
              icon: "mdi-waveform",
              plugin: "whisper",
              parameters: [
                {
                  field: "text_field",
                  name: "timeline",
                  value: this.$t("modal.plugin.whisper.timeline_name"),
                  text: this.$t("modal.plugin.timeline_name"),
                },
              ],
              optional_parameters: [],
            }
          ]
        },
        {
          groupName: this.$t("modal.plugin.plugin_groups.face"),
          groupIcon: "",
          plugins: [
            {
              name: this.$t("modal.plugin.face_identification.plugin_name"),
              icon: "mdi-account-search",
              plugin: "insightface_identification",
              parameters: [
                {
                  field: "text_field",
                  name: "timeline",
                  value: this.$t("modal.plugin.face_identification.timeline_name"),
                  text: this.$t("modal.plugin.timeline_name"),
                },
                {
                  field: "image_input",
                  file: null,
                  name: "query_images",
                  text: this.$t("modal.plugin.face_identification.query_images"),
                  hint: this.$t(
                    "modal.plugin.face_identification.query_images_hint"
                  ),
                },
              ],
              optional_parameters: [
                {
                  field: "slider",
                  min: 1,
                  max: 10,
                  value: 2,
                  step: 1,
                  name: "fps",
                  text: this.$t("modal.plugin.fps"),
                },
              ],
            },
            {
              name: this.$t("modal.plugin.faceemotion.plugin_name"),
              icon: "mdi-emoticon-happy-outline",
              plugin: "deepface_emotion",
              parameters: [
                {
                  field: "text_field",
                  name: "timeline",
                  value: this.$t("modal.plugin.faceemotion.timeline_name"),
                  text: this.$t("modal.plugin.timeline_name"),
                },
                {
                  field: "select_timeline",
                  name: "shot_timeline_id",
                  // value: this.shot_timelines_names[0],
                  // items: this.shot_timelines_names,
                  text: this.$t("modal.plugin.shot_timeline_name"),
                  hint: this.$t("modal.plugin.shot_timeline_hint"),
                },
              ],
              optional_parameters: [
                {
                  field: "slider",
                  min: 1,
                  max: 10,
                  value: 2,
                  step: 1,
                  name: "fps",
                  text: this.$t("modal.plugin.fps"),
                },
                {
                  field: "slider",
                  min: 24,
                  max: 256,
                  value: 48,
                  step: 8,
                  name: "min_facesize",
                  text: this.$t("modal.plugin.faceemotion.min_facesize"),
                  disabled: true,
                },
              ],
            },
            {
              name: this.$t("modal.plugin.facesize.plugin_name"),
              icon: "mdi-face-recognition",
              plugin: "insightface_facesize",
              parameters: [
                {
                  field: "text_field",
                  name: "timeline",
                  value: this.$t("modal.plugin.facesize.timeline_name"),
                  text: this.$t("modal.plugin.timeline_name"),
                },
                {
                  field: "select_timeline",
                  name: "shot_timeline_id",
                  // value: this.shot_timelines_names[0],
                  // items: this.shot_timelines_names,
                  text: this.$t("modal.plugin.shot_timeline_name"),
                  hint: this.$t("modal.plugin.shot_timeline_hint"),
                },
              ],
              optional_parameters: [
                {
                  field: "slider",
                  min: 1,
                  max: 10,
                  value: 2,
                  step: 1,
                  name: "fps",
                  text: this.$t("modal.plugin.fps"),
                },
              ],
            },
          ]
        },
        {
          groupName: this.$t("modal.plugin.plugin_groups.color"),
          groupIcon: "",
          plugins: [
            {
              name: this.$t("modal.plugin.color_analysis.plugin_name"),
              icon: "mdi-palette",
              plugin: "color_analysis",
              parameters: [
                {
                  field: "text_field",
                  name: "timeline",
                  value: this.$t("modal.plugin.color_analysis.timeline_name"),
                  text: this.$t("modal.plugin.timeline_name"),
                },
                {
                  field: "slider",
                  min: 1,
                  max: 8,
                  value: 1,
                  step: 1,
                  name: "k",
                  text: this.$t("modal.plugin.color_analysis.slider"),
                },
                // {
                //   field: "buttongroup",
                //   text: this.$t("modal.plugin.color_analysis.buttongroup"),
                //   name: "timeline_visualization",
                //   value: 0,
                //   buttons: [
                //     this.$t("modal.plugin.color_analysis.singletimeline"),
                //     this.$t("modal.plugin.color_analysis.multipletimelines"),
                //   ],
                // },
              ],
              optional_parameters: [
                {
                  field: "slider",
                  min: 1,
                  max: 10,
                  value: 2,
                  step: 1,
                  name: "fps",
                  text: this.$t("modal.plugin.fps"),
                },
                {
                  field: "slider",
                  min: 24,
                  max: 128,
                  value: 48,
                  step: 4,
                  name: "max_resolution",
                  text: this.$t("modal.plugin.color_analysis.max_resolution"),
                },
                {
                  field: "slider",
                  min: 5,
                  max: 25,
                  value: 10,
                  step: 5,
                  name: "max_iter",
                  text: this.$t("modal.plugin.color_analysis.max_iter"),
                },
              ],
            },
            {
              name: this.$t("modal.plugin.color_brightness_analysis.plugin_name"),
              icon: "mdi-palette",
              plugin: "color_brightness_analysis",
              parameters: [
                {
                  field: "text_field",
                  name: "timeline",
                  value: this.$t(
                    "modal.plugin.color_brightness_analysis.timeline_name"
                  ),
                  text: this.$t("modal.plugin.timeline_name"),
                },
                // {
                //   field: "buttongroup",
                //   text: this.$t("modal.plugin.color_brightness_analysis.buttongroup"),
                //   name: "timeline_visualization",
                //   value: 0,
                //   buttons: [
                //     this.$t("modal.plugin.color_brightness_analysis.singletimeline"),
                //     this.$t("modal.plugin.color_brightness_analysis.multipletimelines"),
                //   ],
                // },
              ],
              optional_parameters: [
                {
                  field: "slider",
                  min: 1,
                  max: 10,
                  value: 2,
                  step: 1,
                  name: "fps",
                  text: this.$t("modal.plugin.fps"),
                },
              ],
            },
          ]
        },
        {
          groupName: this.$t("modal.plugin.plugin_groups.shot"),
          groupIcon: "",
          plugins: [
            {
              name: this.$t("modal.plugin.shot_detection.plugin_name"),
              icon: "mdi-arrow-expand-horizontal",
              plugin: "shotdetection",
              parameters: [
                {
                  field: "text_field",
                  name: "timeline",
                  value: this.$t("modal.plugin.shot_detection.timeline_name"),
                  text: this.$t("modal.plugin.timeline_name"),
                },
              ],
              optional_parameters: [
                {
                  field: "slider",
                  min: 1,
                  max: 10,
                  value: 2,
                  step: 1,
                  name: "fps",
                  text: this.$t("modal.plugin.fps"),
                },
              ],
            },
            {
              name: this.$t("modal.plugin.shot_density.plugin_name"),
              icon: "mdi-sine-wave",
              plugin: "shot_density",
              parameters: [
                {
                  field: "text_field",
                  name: "timeline",
                  value: this.$t("modal.plugin.shot_density.timeline_name"),
                  text: this.$t("modal.plugin.timeline_name"),
                },
                {
                  field: "select_timeline",
                  name: "shot_timeline_id",
                  text: this.$t("modal.plugin.shot_density.input_timeline"),
                },
              ],
              optional_parameters: [
                {
                  field: "slider",
                  min: 1,
                  max: 60,
                  value: 10,
                  step: 1,
                  name: "bandwidth",
                  text: this.$t("modal.plugin.shot_density.bandwidth"),
                },
                {
                  field: "slider",
                  min: 1,
                  max: 10,
                  value: 10,
                  step: 1,
                  name: "fps",
                  text: this.$t("modal.plugin.fps"),
                },
              ],
            },
            {
              name: this.$t("modal.plugin.shot_type_classification.plugin_name"),
              icon: "mdi-video-switch",
              plugin: "shot_type_classification",
              parameters: [
                {
                  field: "text_field",
                  name: "timeline",
                  value: this.$t(
                    "modal.plugin.shot_type_classification.timeline_name"
                  ),
                  text: this.$t("modal.plugin.timeline_name"),
                },
                {
                  field: "select_timeline",
                  name: "shot_timeline_id",
                  // value: this.shot_timelines_names[0],
                  // items: this.shot_timelines_names,
                  text: this.$t("modal.plugin.shot_timeline_name"),
                  hint: this.$t("modal.plugin.shot_timeline_hint"),
                },
              ],
              optional_parameters: [
                {
                  field: "slider",
                  min: 1,
                  max: 10,
                  value: 2,
                  step: 1,
                  name: "fps",
                  text: this.$t("modal.plugin.fps"),
                },
              ],
            },
            {
              name: this.$t("modal.plugin.shot_scalar_annotation.plugin_name"),
              icon: "mdi-label-outline",
              plugin: "shot_scalar_annotation",
              parameters: [
                {
                  field: "text_field",
                  name: "timeline",
                  value: this.$t(
                    "modal.plugin.shot_scalar_annotation.timeline_name"
                  ),
                  text: this.$t("modal.plugin.timeline_name"),
                },
                {
                  field: "select_timeline",
                  name: "shot_timeline_id",
                  // value: this.shot_timelines_names[0],
                  // items: this.shot_timelines_names,
                  text: this.$t("modal.plugin.shot_timeline_name"),
                  hint: this.$t("modal.plugin.shot_timeline_hint"),
                },
                {
                  field: "select_scalar_timeline",
                  name: "scalar_timeline_id",
                  // value: this.shot_timelines_names[0],
                  // items: this.shot_timelines_names,
                  text: this.$t("modal.plugin.scalar_timeline_name"),
                  hint: this.$t("modal.plugin.scalar_timeline_hint"),
                },
              ],
              optional_parameters: [],
            },
          ]
        },
        {
          groupName: this.$t("modal.plugin.plugin_groups.identification"),
          groupIcon: "",
          plugins: [
            {
              name: this.$t("modal.plugin.places_classification.plugin_name"),
              icon: "mdi-map-marker",
              plugin: "places_classification",
              parameters: [
                {
                  field: "text_field",
                  name: "timeline",
                  value: this.$t(
                    "modal.plugin.places_classification.timeline_name"
                  ),
                  text: this.$t("modal.plugin.timeline_name"),
                },
                {
                  field: "select_timeline",
                  name: "shot_timeline_id",
                  // value: this.shot_timelines_names[0],
                  // items: this.shot_timelines_names,
                  text: this.$t("modal.plugin.shot_timeline_name"),
                  hint: this.$t("modal.plugin.shot_timeline_hint"),
                },
              ],
              optional_parameters: [
                {
                  field: "slider",
                  min: 1,
                  max: 10,
                  value: 2,
                  step: 1,
                  name: "fps",
                  text: this.$t("modal.plugin.fps"),
                },
              ],
            },
            {
              name: this.$t("modal.plugin.clip_ontology.plugin_name"),
              icon: "mdi-eye",
              plugin: "clip_ontology",
              parameters: [
                {
                  field: "text_field",
                  name: "timeline",
                  value: this.$t("modal.plugin.clip_ontology.timeline_name"),
                  text: this.$t("modal.plugin.timeline_name"),
                },
                {
                  field: "select_timeline",
                  name: "shot_timeline_id",
                  // value: this.shot_timelines_names[0],
                  // items: this.shot_timelines_names,
                  text: this.$t("modal.plugin.shot_timeline_name"),
                  hint: this.$t("modal.plugin.shot_timeline_hint"),
                },
                {
                  field: "csv_input",
                  file: null,
                  name: "concept_csv",
                  text: this.$t("modal.plugin.clip_ontology.concepts"),
                  hint: this.$t("modal.plugin.clip_ontology.concepts_hint"),
                },
              ],
              optional_parameters: [
                {
                  field: "slider",
                  min: 1,
                  max: 10,
                  value: 2,
                  step: 1,
                  name: "fps",
                  text: this.$t("modal.plugin.fps"),
                },
              ],
            },
            {
              name: this.$t("modal.plugin.thumbnail.plugin_name"),
              icon: "mdi-image-multiple",
              plugin: "thumbnail",
              parameters: [],
              optional_parameters: [],
            },
            {
              name: this.$t("modal.plugin.clip.plugin_name"),
              icon: "mdi-eye",
              plugin: "clip",
              parameters: [
                {
                  field: "text_field",
                  name: "timeline",
                  value: this.$t("modal.plugin.clip.timeline_name"),
                  text: this.$t("modal.plugin.timeline_name"),
                },
                {
                  field: "text_field",
                  name: "search_term",
                  value: "",
                  text: this.$t("modal.plugin.clip.search_term"),
                },
              ],
              optional_parameters: [
                {
                  field: "slider",
                  min: 1,
                  max: 10,
                  value: 2,
                  step: 1,
                  name: "fps",
                  text: this.$t("modal.plugin.fps"),
                },
              ],
            },
            {
              name: this.$t("modal.plugin.x_clip.plugin_name"),
              icon: "mdi-eye",
              plugin: "x_clip",
              parameters: [
                {
                  field: "text_field",
                  name: "timeline",
                  value: this.$t("modal.plugin.x_clip.timeline_name"),
                  text: this.$t("modal.plugin.timeline_name"),
                },
                {
                  field: "text_field",
                  name: "search_term",
                  value: "",
                  text: this.$t("modal.plugin.x_clip.search_term"),
                },
              ],
              optional_parameters: [
                {
                  field: "slider",
                  min: 1,
                  max: 10,
                  value: 2,
                  step: 1,
                  name: "fps",
                  text: this.$t("modal.plugin.fps"),
                },
              ],
            },
          ]
        },
        {
          groupName: this.$t("modal.plugin.plugin_groups.aggregation"),
          groupIcon: "",
          plugins: [
            {
              name: this.$t("modal.plugin.aggregation.plugin_name"),
              icon: "mdi-sigma",
              plugin: "aggregate_scalar",
              parameters: [
                {
                  field: "text_field",
                  name: "timeline",
                  value: this.$t("modal.plugin.aggregation.timeline_name"),
                  text: this.$t("modal.plugin.timeline_name"),
                },
                {
                  field: "select_scalar_timelines",
                  name: "timeline_ids",
                  text: this.$t("modal.plugin.scalar_timeline_name"),
                  hint: this.$t("modal.plugin.scalar_timeline_hint"),
                },
                {
                  field: "buttongroup",
                  text: this.$t("modal.plugin.aggregation.method"),
                  name: "aggregation",
                  value: 0,
                  buttons: [
                    this.$t("modal.plugin.aggregation.logical_or"),
                    this.$t("modal.plugin.aggregation.logical_and"),
                    this.$t("modal.plugin.aggregation.mean"),
                    this.$t("modal.plugin.aggregation.prod"),
                  ],
                },
              ],
              optional_parameters: [],
            },
<<<<<<< HEAD
            {
              field: "text_field",
              name: "search_term",
              value: "",
              text: this.$t("modal.plugin.clip.search_term"),
            },
          ],
          optional_parameters: [
            {
              field: "slider",
              min: 1,
              max: 10,
              value: 2,
              step: 1,
              name: "fps",
              text: this.$t("modal.plugin.fps"),
            },
            {
              field: "checkbox",
              text: this.$t("modal.plugin.normalize"),
              name: "normalize",
              value: true,
            }
          ],
        },
        {
          name: this.$t("modal.plugin.x_clip.plugin_name"),
          icon: "mdi-eye",
          plugin: "x_clip",
          parameters: [
            {
              field: "text_field",
              name: "timeline",
              value: this.$t("modal.plugin.x_clip.timeline_name"),
              text: this.$t("modal.plugin.timeline_name"),
            },
            {
              field: "text_field",
              name: "search_term",
              value: "",
              text: this.$t("modal.plugin.x_clip.search_term"),
            },
          ],
          optional_parameters: [
            {
              field: "slider",
              min: 1,
              max: 10,
              value: 2,
              step: 1,
              name: "fps",
              text: this.$t("modal.plugin.fps"),
            },
          ],
        },
=======
          ]
        }
>>>>>>> visualization-features
      ],
    };
  },
  computed: {
    plugins_sorted() {
      return this.plugins.sort((a, b) => a.name.localeCompare(b.name));
    },
    ...mapStores(usePluginRunStore),
  },
  methods: {
    choosePlugin(plugin) {
      this.chosenGroups = [];
      this.pluginData = plugin;
    },
    async runPlugin(plugin, parameters, optional_parameters) {
      parameters = parameters.concat(optional_parameters);
      parameters = parameters.map((e) => {
        if ("file" in e) {
          return { name: e.name, file: e.file };
        } else {
          return { name: e.name, value: e.value };
        }
      });
      this.pluginRunStore
        .submit({ plugin: plugin, parameters: parameters })
        .then(() => {
          this.dialog = false;
        });
    },
  },
  watch: {
    dialog(value) {
      this.$emit("input", value);
    },
    value(value) {
      if (value) {
        this.dialog = true;
      }
    },
  },
  components: { Parameters },
};
</script>

<style>
div.tabs-left [role="tab"] {
  justify-content: flex-start;
}

.expansion-content > div {
  padding: 0;
}
.plugin-list {
  margin: 0;
 }
</style>
