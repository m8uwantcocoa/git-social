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

    <main class="max-w-md mx-auto px-4 mt-6 space-y-8">
      
      <section class="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/80 border border-white/10 shadow-lg">
        <div class="w-14 h-14 rounded-full bg-emerald-950 flex items-center justify-center text-xl font-bold text-emerald-400 border border-emerald-500/30">
          {{ user?.email ? user.email.charAt(0).toUpperCase() : 'G' }}
        </div>
        <div>
          <h2 class="text-base cursor-pointer font-medium text-white">@GITHUB</h2>
          <p class="text-sm text-emerald-900">{{ user?.email || 'Loading user...' }}</p>
        </div>
      </section>

      <section class="space-y-3">
        <h3 class="text-xs font-semibold text-emerald-500/80 uppercase tracking-wider pl-2"> -- set ing s</h3>

        
      </section>

      <section class="pt-4 space-x-12 flex items-center justify-center">
        
        <InteractiveHoverButton
            text="xxx"
            class="bg-slate-300 text-slate-800 font-medium border border-rose-500/20 hover:bg-red-400 hover:text-red-900 transition-all active:scale-[0.98]"
        />
        <InteractiveHoverButton
            text="xxx3"
            class="bg-slate-300 text-slate-800 font-medium border border-rose-500/20 hover:bg-slate-400 hover:text-red-900 transition-all active:scale-[0.98]"
        />
        <InteractiveHoverButton
            text="Log Out"
            class="bg-red-300 text-red-800 font-medium border border-rose-500/20 hover:bg-red-400 hover:text-red-900 transition-all active:scale-[0.98]"
        />
      </section>

    </main>

    <AppDock />

  </div>
</template>