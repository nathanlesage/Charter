<template>
  <div class="form-group">
    <label v-if="label !== ''"><strong>{{ label }}</strong></label>
    <select
      ref="input"
      class="form-control"
      v-bind:value="modelValue"
      v-bind:disabled="disabled"
      v-on:input="$emit('update:modelValue', input.value)"
    >
      <option
        v-for="(value, key) in options"
        v-bind:value="value"
      >
        {{ key }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Dropdown',
  props: {
    modelValue: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    options: {
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  computed: {
    input: function (): HTMLSelectElement {
      return this.$refs.input as HTMLSelectElement
    }
  }
})
</script>

<style>
</style>
