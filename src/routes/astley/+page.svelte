<script>
    import AstleyGenerator from "$lib/components/AstleyGenerator.svelte";
</script>

<meta property="og:title" content="Astley Generator"/>
<meta property="og:description" content="Generate QR codes with Astley frames"/>
<meta property="og:image" content="https://qr.d17e.dev/qr_astley_frame_000001.png"/>
<meta property="og:url" content="https://qr.d17e.dev/astley"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="QR Code Generator"/>
<meta property="og:locale" content="en_US"/>


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