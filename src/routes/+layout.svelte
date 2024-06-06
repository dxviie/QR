<script>
    import '../app.css';
</script>

<div class="app-container">
  <header>Plottable QR Code Generator</header>
  <main>
    <slot></slot>
  </main>
  <footer></footer>
</div>

<style>
    .app-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100vw;
    }

    header {
        background-color: #333;
        color: white;
        padding: 1rem;
        font-size: xx-large;
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
        background-color: #333;
        color: white;
        padding: 1rem;
    }
</style>
