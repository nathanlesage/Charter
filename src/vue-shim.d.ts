// This file is needed so that TypeScript recognises single-file-components.
declare module '*.vue' {
  import { defineComponent } from 'vue'
  const Component: ReturnType<typeof defineComponent>
  export default Component
}
