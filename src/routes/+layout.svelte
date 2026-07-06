<script>
    import '../app.css';
    import {page} from '$app/stores';
    import {Toaster} from "$lib/components/ui/sonner";
    import {ModeWatcher} from "mode-watcher";
    import {toggleMode, mode} from "mode-watcher";
    import {Button} from "$lib/components/ui/button";
    import {CircleHelp, Moon, Sun} from "lucide-svelte";
    import Footer from "$lib/components/BrandFooter.svelte";
    import D17ELogo from "$lib/components/D17ELogo.svelte";
</script>

<div class="app-container">


  {#if !$page.url.pathname.startsWith('/bc')}
    <header>
      <div class="header-left">
        <a href="/" target="_self" aria-label="link to home" class="header-link">
          <D17ELogo/>
          <span class="wordmark">qr.d17e.dev</span>
        </a>
        <span class="tagline">Plottable QR Code Generator</span>
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
        <a href="/about" target="_self" class="header-link">
          <Button variant="ghost" size="icon">
            <CircleHelp/>
            <span class="sr-only">Go to about page</span>
          </Button>
        </a>
      </div>
    </header>
  {/if}
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
        border-bottom: 1px solid hsl(var(--border));
        width: 100%;
        height: 3.5rem;
        position: fixed;
        z-index: 10;
        padding: 0.4rem 1rem;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        align-self: center;
        gap: 0.6rem;
    }

    .header-left {
        display: flex;
        flex-direction: row;
        align-items: baseline;
        gap: 0.6rem;
    }

    .header-right {
        height: 2.5rem;
        display: flex;
        align-items: center;
    }

    .header-link {
        border-bottom-width: 0;
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }

    .header-link:hover {
        opacity: 0.7;
    }

    .wordmark {
        font-family: 'nudica_monobold', monospace;
        font-size: 1.15rem;
        letter-spacing: 0.08em;
    }

    .tagline {
        font-family: 'argesta_regular', serif;
        color: hsl(var(--muted-foreground));
        font-size: 0.8rem;
    }

    @media (max-width: 640px) {
        .tagline {
            display: none;
        }
    }

    main {
        min-height: calc(100vh - 5rem);
        max-width: 1200px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    footer {
        width: 100%;
    }

    :global(button) {
        font-family: 'nudica_monobold', monospace;
        font-weight: normal !important;
    }

    :global(button:hover) {
        background-color: var(--brand-magenta) !important;
        color: #fdfaff !important;
    }

    :global(button:active) {
        transform: translateY(1px);
    }

    :global(a) {
        border-style: dashed;
        border-bottom-width: 1px;
        border-color: hsl(var(--foreground));
    }

    :global(a:hover) {
        border-color: var(--brand-magenta);
    }

</style>
