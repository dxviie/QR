<script>
    import AstleyGenerator from "$lib/components/AstleyGenerator.svelte";
</script>

<svelte:head>
  <meta property="og:title" content="Astley Generator"/>
  <meta property="og:description" content="Transform QR Images Into Plottable SVGs"/>
  <meta property="og:image" content="https://qr.d17e.dev/qr_astley_frame_000001.png"/>
  <meta property="og:url" content="https://qr.d17e.dev/astley"/>
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="Plottable QR Code Generator"/>
  <meta property="og:locale" content="en_US"/>
</svelte:head>

<div class="astley-container">
  <AstleyGenerator/>
</div>

<style>
    .astley-container {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>