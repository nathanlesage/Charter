<template>
  <div class="checkbox">
        <label>
          <input
            ref="input"
            type="checkbox"
            v-bind:checked="modelValue"
            v-bind:disabled="disabled"
            v-on:input="$emit('update:modelValue', input.checked)"
          > {{ label }}
        </label>
      </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Checkbox',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
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
