import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

// Import FontAwesome icons (used in UI)
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faFeatherAlt, faUser, faSignOutAlt, faEdit, 
  faPlusCircle, faHeading, faTags, faMagic, 
  faRobot, faSave, faPaperPlane, faTimes, faFont, 
  faLightbulb, faBold, faItalic, faLink, faListUl, 
  faQuoteRight, faUserCircle, faPencilAlt, faDesktop, 
  faTabletAlt, faMobileAlt, faChevronDown, faTrashAlt,
  faExclamationCircle, faSync, faSyncAlt, faWifi, faSpinner
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Initialize FontAwesome
library.add(
  faFeatherAlt, faUser, faSignOutAlt, faEdit, 
  faPlusCircle, faHeading, faTags, faMagic, 
  faRobot, faSave, faPaperPlane, faTimes, faFont, 
  faLightbulb, faBold, faItalic, faLink, faListUl, 
  faQuoteRight, faUserCircle, faPencilAlt, faDesktop, 
  faTabletAlt, faMobileAlt, faChevronDown, faTrashAlt,
  faExclamationCircle, faSync, faSyncAlt, faWifi, faSpinner
)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(createPinia())
app.use(router)

app.mount('#app')
