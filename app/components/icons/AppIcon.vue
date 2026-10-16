<script setup lang="ts">
// Иконки приложений Dock в духе macOS. Декоративные: подпись даёт кнопка.
defineProps<{ name: 'finder' | 'safari' | 'docker' | 'settings' | 'github' | 'telegram' | 'mail'; size?: number }>()
const uid = useId()
</script>

<template>
  <svg :width="size ?? 54" :height="size ?? 54" viewBox="0 0 54 54" aria-hidden="true">
    <template v-if="name === 'finder'">
      <defs><clipPath :id="`${uid}fc`"><rect width="54" height="54" rx="13" /></clipPath></defs>
      <g :clip-path="`url(#${uid}fc)`"><rect width="54" height="54" fill="#dff1ff" /><path d="M0 0h31c-4 8-6 17-6 27h-4c0 10 2 19 6 27H0z" fill="#1e8ef0" /></g>
      <path d="M17 17v7M37 17v7" stroke="#0d2a4a" stroke-width="3" stroke-linecap="round" />
      <path d="M13 35c8 6 20 6 28 0" fill="none" stroke="#0d2a4a" stroke-width="2.6" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'safari'">
      <rect width="54" height="54" rx="13" fill="#ffffff" />
      <circle cx="27" cy="27" r="21" fill="#1a8cff" />
      <circle cx="27" cy="27" r="17.5" fill="none" stroke="#ffffff" stroke-width="1" stroke-dasharray="1 3.58" />
      <path d="M27 27 38 16 30 30z" fill="#ff3b30" /><path d="M27 27 16 38 24 24z" fill="#ffffff" />
    </template>
    <template v-else-if="name === 'docker'">
      <rect width="54" height="54" rx="13" fill="#1d63ed" />
      <g fill="#ffffff">
        <rect x="10" y="24" width="6" height="5" rx="0.8" /><rect x="17" y="24" width="6" height="5" rx="0.8" /><rect x="24" y="24" width="6" height="5" rx="0.8" />
        <rect x="31" y="24" width="6" height="5" rx="0.8" /><rect x="17" y="18" width="6" height="5" rx="0.8" /><rect x="24" y="18" width="6" height="5" rx="0.8" />
        <rect x="31" y="18" width="6" height="5" rx="0.8" /><rect x="24" y="12" width="6" height="5" rx="0.8" />
        <path d="M6 31h36c1.5-3 4-4 6.5-3.5-.5 2-2 3.5-4.5 3.8C41 39 34 43 24 43 14 43 8 38 6 31z" />
      </g>
    </template>
    <template v-else-if="name === 'settings'">
      <defs><linearGradient :id="`${uid}sg`" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8b8be" /><stop offset="1" stop-color="#6e6e76" /></linearGradient></defs>
      <rect width="54" height="54" rx="13" :fill="`url(#${uid}sg)`" />
      <circle cx="27" cy="27" r="13" fill="none" stroke="#3a3a40" stroke-width="7" stroke-dasharray="4.1 2.7" />
      <circle cx="27" cy="27" r="10" fill="#d4d4d9" /><circle cx="27" cy="27" r="4.5" fill="#6e6e76" />
    </template>
    <template v-else-if="name === 'github'">
      <rect width="54" height="54" rx="13" fill="#1f2328" />
      <path
        d="M27 10a17 17 0 0 0-5.4 33.1c.9.2 1.2-.4 1.2-.8v-3c-4.7 1-5.7-2-5.7-2-.8-2-1.9-2.5-1.9-2.5-1.5-1 .1-1 .1-1 1.7.1 2.6 1.7 2.6 1.7 1.5 2.6 4 1.9 5 1.4.1-1.1.6-1.9 1.1-2.3-3.8-.4-7.7-1.9-7.7-8.4 0-1.9.7-3.4 1.8-4.6-.2-.4-.8-2.2.2-4.5 0 0 1.4-.5 4.7 1.8a16 16 0 0 1 8.5 0c3.3-2.3 4.7-1.8 4.7-1.8 1 2.3.4 4.1.2 4.5 1.1 1.2 1.8 2.7 1.8 4.6 0 6.5-4 8-7.7 8.4.6.5 1.2 1.6 1.2 3.2v4.7c0 .5.3 1 1.2.8A17 17 0 0 0 27 10z"
        fill="#ffffff"
      />
    </template>
    <template v-else-if="name === 'telegram'">
      <defs><linearGradient :id="`${uid}tg`" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#41b4f5" /><stop offset="1" stop-color="#1c93e3" /></linearGradient></defs>
      <rect width="54" height="54" rx="13" :fill="`url(#${uid}tg)`" />
      <path d="M12 26.5 39 16c1.3-.5 2.4.3 2 2.2l-4.6 21.7c-.3 1.5-1.2 1.9-2.5 1.2l-7-5.2-3.4 3.3c-.4.4-.7.7-1.4.7l.5-7.1 13-11.7c.6-.5-.1-.8-.9-.3L18.6 30.5l-6.9-2.2c-1.5-.5-1.5-1.5.3-1.8z" fill="#ffffff" />
    </template>
    <template v-else>
      <defs><linearGradient :id="`${uid}mg`" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5ac8fa" /><stop offset="1" stop-color="#0a6cf0" /></linearGradient></defs>
      <rect width="54" height="54" rx="13" :fill="`url(#${uid}mg)`" />
      <rect x="10" y="16" width="34" height="23" rx="3" fill="#ffffff" /><path d="m11 18 16 12 16-12" fill="none" stroke="#7aa9e8" stroke-width="2" stroke-linejoin="round" />
    </template>
  </svg>
</template>
