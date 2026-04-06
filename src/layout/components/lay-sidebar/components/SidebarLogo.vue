<script setup lang="ts">
import { getTopMenu } from "@/router/utils";
import ehmonitorLogo from "@/assets/mc.png";

defineProps({
  collapse: Boolean
});

</script>

<template>
  <div class="sidebar-logo-container" :class="{ collapses: collapse }">
    <transition name="sidebarLogoFade">
      <router-link
        v-if="collapse"
        key="collapse"
        class="sidebar-logo-link"
        :to="getTopMenu()?.path ?? '/'"
      >
        <img :src="ehmonitorLogo" alt="logo" />
      </router-link>
      <router-link
        v-else
        key="expand"
        class="sidebar-logo-link"
        :to="getTopMenu()?.path ?? '/'"
      >
        <img :src="ehmonitorLogo" alt="logo" />
      </router-link>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 48px;
  overflow: hidden;

  .sidebar-logo-link {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    height: 100%;
    padding-left: 10px;

    img {
      display: inline-block;
      height: 50px;
    }

  }
}
</style>
