<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from 'reka-ui'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-vue-next'
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<CheckboxRootProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<CheckboxRootEmits>()

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props

    return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
    <CheckboxRoot data-slot="checkbox" v-bind="forwarded" :class="cn(`peer border-input
         data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary
         focus-visible:border-ring focus-visible:ring-ring/50
         aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive
         h-6 w-6 shrink-0 rounded-md border-2 shadow-sm transition-all outline-none cursor-pointer
         focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50
         hover:border-primary/70 dark:hover:border-primary/70
         dark:border-gray-500 dark:data-[state=checked]:bg-blue-600 dark:data-[state=checked]:border-blue-600
         dark:bg-gray-800 dark:focus-visible:ring-blue-500/50`,
        props.class)">
        <CheckboxIndicator data-slot="checkbox-indicator"
            class="flex items-center justify-center text-current transition-all">
            <slot>
                <Check class="h-5 w-5 font-bold" stroke-width="3" />
            </slot>
        </CheckboxIndicator>
    </CheckboxRoot>
</template>
