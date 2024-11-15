<script>
    import '../../../app.css';
    import '@fontsource/bitter';
    import '@fontsource/poppins';
</script>

<div>
  <main>
    <slot></slot>
  </main>
</div>

<style>

    main {
        min-height: calc(100vh - 1rem);
        max-width: 1200px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

</style>
