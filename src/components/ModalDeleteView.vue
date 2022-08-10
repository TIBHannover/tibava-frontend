<template>
  <v-dialog v-model="show" max-width="1000">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" text block large>
        <v-icon left>{{ "mdi-trash-can-outline" }}</v-icon>
        {{ $t("modal.view.delete.link") }}
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="mb-2">
        {{ $t("modal.view.delete.title") }}

        <v-btn icon @click.native="show = false" absolute top right>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text> {{ $t("modal.view.delete.question") }}</v-card-text>
      <v-card-actions class="pt-0">
        <v-btn class="mr-4" @click="submit" :disable="isSubmitting">
          {{ $t("modal.view.delete.yes") }}
        </v-btn>
        <v-btn @click="show = false">{{
          $t("modal.view.delete.no")
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from "vue";
import { mapStores } from "pinia";
import { useTimelineViewStore } from "@/store/timeline_view";

export default {
  props: ["view"],
  data() {
    return {
      show: false,
      isSubmitting: false,
    };
  },
  computed:{
    ...mapStores(useTimelineViewStore)
  },
  methods: {
    async submit() {
      if (this.isSubmitting) {
        return;
      }
      this.isSubmitting = true;

      await this.timelineViewStore.delete(this.view);

      this.isSubmitting = false;
      this.show = false;
    },
  },
  watch: {
    show(value) {
      if (value) {
        this.$emit("close");
      }
    },
  },
};
</script>



