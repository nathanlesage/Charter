<template>
  <div class="form-group">
    <label v-if="label !== ''"><strong>{{ label }}</strong></label>
    <input
      ref="input"
      type="text"
      class="form-control"
      v-bind:placeholder="placeholder"
      v-bind:input="modelValue"
      v-on:input="$emit('update:modelValue', input.value)"
    >
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Text',
  props: {
    modelValue: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
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
