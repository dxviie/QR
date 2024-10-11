<script>
    import '../app.css';
    import {Toaster} from "$lib/components/ui/sonner";
    import {ModeWatcher} from "mode-watcher";
    import {toggleMode, mode} from "mode-watcher";
    import {Button} from "$lib/components/ui/button";
    import {CircleHelp, Moon, Sun} from "lucide-svelte";
    import Footer from "$lib/components/BrandFooter.svelte";
    import '@fontsource/bitter';
    import '@fontsource/poppins';
</script>

<div class="app-container">
  <header>
    <div class="header-left">
      <a href="/" target="_self" aria-label="link to home">
        <div class="title"><p class="logo">qr.d17e.dev</p></div>
        <div><p class="description">Plottable QR Code Generator</p></div>
      </a>
    </div>
    <div class="header-right">
      <Button on:click={toggleMode} variant="ghost" size="icon">
        {#if $mode === 'dark'}
          <Moon/>
        {:else}
          <Sun/>
        {/if}
        <span class="sr-only">Toggle theme</span>
      </Button>
      <a href="/about" target="_self">
        <Button variant="ghost" size="icon">
          <CircleHelp/>
          <span class="sr-only">Go to about page</span>
        </Button>
      </a>
    </div>
  </header>
  <main>
    <slot></slot>
  </main>
  <footer>
    <Footer/>
    <ModeWatcher/>
    <Toaster/>
  </footer>
</div>

<style>
    .app-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    header {
        background-color: hsl(var(--background));
        width: 100%;
        height: 6rem;
        position: fixed;
        padding: 1rem;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        align-self: center;
        font-size: large;
    }

    .header-left {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .header-right {
        height: 2.5rem;
    }

    .title {
        padding: 0 .7rem 0 0.6rem;
        background-color: hsl(var(--foreground));
        color: hsl(var(--background));
        font-size: xx-large;
        font-weight: bold;
    }

    .description {
        font-size: x-small;
        font-weight: normal;
    }

    main {
        min-height: calc(100vh - 5rem);
        max-width: 1200px;
        padding-top: 6rem;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    footer {
        height: 5rem;
        width: 100%;
    }

    :global(button) {
        font-family: Bitter, serif;
        font-weight: bold !important;
        font-size: large !important;
    }

    :global(button:hover) {
        background-color: darkorange !important;
    }

    :global(button:active) {
        transform: translateY(1px);
    }

    :global(body) {
        font-family: Poppins, sans-serif;
        font-size: medium;
    }

    :global(.title) {
        font-family: Bitter, serif;
    }

    :global(.description) {
        font-family: Poppins, sans-serif;
    }

    :global(a) {
        border-style: dashed;
        border-bottom-width: 1px;
        border-color: hsl(var(--foreground));
    }

    :global(a:hover) {
        border-color: darkorange;
    }

</style>
