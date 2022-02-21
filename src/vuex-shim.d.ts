import { Store } from 'vuex'

declare module '@vue/runtime-core' {
  // provide typings for `this.$store`
  import { CharterState } from './store.ts'
  interface ComponentCustomProperties {
    $store: Store<CharterState>
    // $data: any
  }
}
