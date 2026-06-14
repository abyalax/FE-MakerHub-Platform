<script lang="ts" setup>
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '../../ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut } from 'lucide-vue-next';
import SignOutDialog from './SignOutDialog.vue';
import { useDialogState } from '../../../composable/useDialogState';

const { isMobile } = useSidebar();
const { open, setOpen } = useDialogState(false);
const authStore = useAuthStore();
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <SidebarMenuButton size="lg" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage src="ME" :alt="authStore.user?.name ?? 'User'" />
              <AvatarFallback class="rounded-lg">ME</AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-start text-sm leading-tight">
              <span class="truncate font-semibold">{{ authStore.user?.name ?? 'User' }}</span>
              <span class="truncate text-xs">{{ authStore.user?.email ?? '' }}</span>
            </div>
            <ChevronsUpDown class="ms-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage src="ME" :alt="authStore.user?.name ?? 'User'" />
                <AvatarFallback class="rounded-lg">ME</AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-start text-sm leading-tight">
                <span class="truncate font-semibold">{{ authStore.user?.name ?? 'User' }}</span>
                <span class="truncate text-xs">{{ authStore.user?.email ?? '' }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem as-child>
              <Link href="/settings/account">
                <BadgeCheck />
                Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <Link href="/settings">
                <CreditCard />
                Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <Link href="/settings/notifications">
                <Bell />
                Notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" @click="setOpen()">
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
  <SignOutDialog v-model:open="open" />
</template>
