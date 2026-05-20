<script setup>
import { ref } from 'vue'

const user = useSupabaseUser()

const pushNotiser = ref(true)
const botMentions = ref(true)

const loggaUt = async () => {
  console.log("Loggar ut...")
}
</script>

<template>
  <div class="min-h-screen bg-mist-100 text-slate-100 font-sans pb-24 selection:bg-emerald-500/30">
    <AppHeader />
    
    <header class="sticky top-0 z-40 backdrop-blur-md bg-emerald-500/80 rounded-b-2xl border-b border-emerald-700 px-4 py-4 flex items-center justify-center">
      <h1 class="text-xl font-extrabold tracking-tight text-emerald-900 select-none">Settings</h1>
    </header>

    

    <AppDock />

  </div>
</template>