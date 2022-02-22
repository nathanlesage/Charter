<template>
   <label for="export-resolution"><strong>{{ label }}</strong></label>
      <input
        ref="input"
        class="form-control"
        type="range"
        v-bind:min="min"
        v-bind:max="max"
        v-bind:step="step"
        v-bind:value="modelValue"
        v-on:input="$emit('update:modelValue', parseFloat(input.value))"
      >
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Slider',
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    step: {
      type: Number,
      default: 1
    }
  },
  emits: ['update:modelValue'],
  computed: {
    input: function (): HTMLInputElement {
      return this.$refs.input as HTMLInputElement
    }
  }
})
</script>

<style>
</style>
