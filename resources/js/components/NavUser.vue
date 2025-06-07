<script setup lang="ts">
import { ref, onMounted } from 'vue';
import UserInfo from '@/components/UserInfo.vue';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { type User } from '@/types';
import { usePage } from '@inertiajs/vue3';
import { ChevronsUpDown } from 'lucide-vue-next';
import UserMenuContent from './UserMenuContent.vue';

const page = usePage();
const user = page.props.auth.user as User;
const { isMobile, state } = useSidebar();
const isMounted = ref(false);

// Ensure component is mounted before rendering dropdown
onMounted(() => {
    isMounted.value = true;
});
</script>

<template>
    <SidebarMenu>
        <SidebarMenuItem>
            <DropdownMenu v-if="isMounted">
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton 
                        size="lg" 
                        class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <UserInfo :user="user" />
                        <ChevronsUpDown class="ml-auto size-4" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    class="min-w-56 rounded-lg"
                    :side="isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'"
                    align="end"
                    :side-offset="4"
                >
                    <UserMenuContent :user="user" />
                </DropdownMenuContent>
            </DropdownMenu>
            <!-- Fallback when not mounted yet -->
            <div v-else>
                <SidebarMenuButton size="lg">
                    <UserInfo :user="user" />
                    <ChevronsUpDown class="ml-auto size-4" />
                </SidebarMenuButton>
            </div>
        </SidebarMenuItem>
    </SidebarMenu>
</template>
