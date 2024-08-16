<script>
    import '../app.css';
    import {Toaster} from "$lib/components/ui/sonner";
    import {ModeWatcher} from "mode-watcher";
    import {toggleMode} from "mode-watcher";
    import {Button} from "$lib/components/ui/button";
    import {Moon, Sun} from "lucide-svelte";
    import Footer from "$lib/components/BrandFooter.svelte";
</script>

<div class="app-container">
  <header>
    <div class="header-left">
      <div class="img-container"><img src="favicon.png" alt="qr favicon as logo"/></div>
      <a href="/" target="_self">
        <div class="title"><p class="logo">qr.d17e.dev</p>
          <p class="description">Plottable QR Code Generator</p></div>
      </a>
    </div>
    <Button on:click={toggleMode} variant="ghost" size="icon">
      <Sun
              class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      />
      <Moon
              class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      />
      <span class="sr-only">Toggle theme</span>
    </Button>
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
        height: 100vh;
        width: 100vw;
    }

    header {
        background-color: hsl(var(--foreground));
        color: hsl(var(--background));
        padding: 1rem;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        font-size: large;
    }

    .header-left {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .img-container {
        height: 3.5rem;
        width: 3.5rem;
        margin-right: 1rem;
        overflow: hidden;
    }

    img {
        transform: scale(1.1);
        filter: brightness(1.5) contrast(3);
    }

    .title {
        font-size: xx-large;
        font-weight: bold;
    }

    .description {
        font-size: medium;
        font-weight: normal;
    }

    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-grow: 1;
        padding: 1rem;
    }

    footer {
    }

    :global(body) {
        font-family: Poppins;
        font-size: medium;
    }

    :global(.title) {
        font-family: Bitter, serif;
    }

    :global(.description) {
        font-family: Poppins, sans-serif;
    }
</style>
