import Vue from 'vue'
import App from './App.vue'
import '@/assets/styles/main.css' //so that my whole project uses the same font
import DatePicker from 'vuejs-datepicker'

Vue.component('DatePicker', DatePicker)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

//if we need new packeges you have to do it here