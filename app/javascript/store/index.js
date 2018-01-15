import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user.js'
import search from './modules/search.js'
import plan from './modules/plan.js'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    user,
    search,
    plan,
  }
})

export default { store };
