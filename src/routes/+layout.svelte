<script>
    import '../app.css';
    import {Toaster} from "$lib/components/ui/sonner";
    import {ModeWatcher} from "mode-watcher";
    import {toggleMode} from "mode-watcher";
    import {Button} from "$lib/components/ui/button";
    import {Moon, Sun} from "lucide-svelte";
    import {Label} from "$lib/components/ui/label";
</script>

<div class="app-container">
  <header>
    <Label>Plottable QR Code Generator</Label>
    <Button on:click={toggleMode} variant="outline" size="icon">
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
        padding: 1rem;
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-grow: 1;
        padding: 1rem;
    }

    footer {
        padding: 1rem;
    }
</style>
