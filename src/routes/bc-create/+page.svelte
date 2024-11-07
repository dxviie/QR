<script lang="ts">
  import ImageUploader from "$lib/components/bc/ImageUploader.svelte";
  import BusinessCardLayout from "$lib/components/bc/BusinessCardLayout.svelte";
  import {Label} from "$lib/components/ui/label";
  import {Input} from "$lib/components/ui/input";

  let imageUrl: string | null = null;
  let orientation: 'portrait' | 'landscape' = 'portrait';
  let offsetY = 0;

  function handleImageSelected(event: CustomEvent) {
    imageUrl = event.detail.dataUrl;

    // Detect orientation from loaded image
    const img = new Image();
    img.onload = () => {
      orientation = img.width > img.height ? 'landscape' : 'portrait';
    };
    img.src = imageUrl;
  }

  function handleOffsetYChange(event: Event) {
    offsetY = Number((event.target as HTMLInputElement).value);
  }
</script>

<main>
  <h1>Business Card Layout Generator</h1>

  <ImageUploader on:imageSelected={handleImageSelected}/>
  <div>
    <Label for="offsetY">Y-Axis Offset (px)</Label>
    <Input type="number" id="offsetY" min="0" step=".1" value={offsetY} on:change={handleOffsetYChange}/>
  </div>

  <div class="layout-wrapper">
    <BusinessCardLayout {imageUrl} {orientation} {offsetY}/>
  </div>
</main>

<style>
    main {
        padding: 1rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    .layout-wrapper {
        margin: 2rem auto;
    }

    h1 {
        text-align: center;
        margin-bottom: 2rem;
    }
</style>