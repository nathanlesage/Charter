import { createApp } from 'vue'
import App from './App.vue'
import createStore from './store'

const appStore = createStore()

// Import the Photon styles
import './css/photon.min.css'

// Instantiate our app and mount it onto the DOM
const app = createApp(App).use(appStore)

app.mount('#app')
