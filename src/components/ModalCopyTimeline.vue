<template>
  <v-dialog v-model="show" max-width="1000">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" text block large>
        <v-icon left>{{ "mdi-content-copy" }}</v-icon>
        {{ $t("modal.timeline.duplicate.link") }}
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="mb-2">
        {{ $t("modal.timeline.duplicate.title") }}

        <v-btn icon @click.native="show = false" absolute top right>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-text-field
          :label="$t('modal.timeline.duplicate.name')"
          prepend-icon="mdi-pencil"
          v-model="name"
        ></v-text-field>

        <v-checkbox
          v-model="includeannotations"
          :label="$t('modal.timeline.duplicate.includeannotations')"
        >
        </v-checkbox>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-btn class="mr-4" @click="submit" :disable="isSubmitting">
          {{ $t("modal.timeline.duplicate.update") }}
        </v-btn>
        <v-btn @click="show = false">{{
          $t("modal.timeline.duplicate.close")
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from "vue";

export default {
  props: ["timeline"],
  data() {
    return {
      show: false,
      isSubmitting: false,
      nameProxy: null,
      includeannotations: true,
      items: [],
    };
  },
  computed: {
    name: {
      get() {
        const name =
          this.$store.getters["timeline/get"](this.timeline).name + " (1)";
        return this.nameProxy === null ? name : this.nameProxy;
      },
      set(val) {
        this.nameProxy = val;
      },
    },
  },
  methods: {
    async submit() {
      if (this.isSubmitting) {
        return;
      }
      this.isSubmitting = true;

      await this.$store.dispatch("timeline/duplicate", {
        id: this.timeline,
        name: this.name,
        includeannotations: this.includeannotations,
      });

      this.isSubmitting = false;
      this.show = false;
    },
  },
  watch: {
    show(value) {
      if (value) {
        this.nameProxy = null;
        this.$emit("close");
      }
    },
  },
};
</script>


