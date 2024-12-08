<script lang="ts">
  import {onMount} from 'svelte';
  import {Input} from "$lib/components/ui/input";
  import {Label} from "$lib/components/ui/label";
  import {Button} from "$lib/components/ui/button";
  import {generateQrSVGPaths} from "$lib/qrPathGenerator";

  let selectedFile: File | null = null;
  let resolution = 75;
  let imagePreview: string | null;
  let qrData: boolean[][];
  let qrPaths: string[];
  let svgContainer;
  let canvas;
  let ctx;
  const svgOutputSize = 300;

  const penWidth = 0.5;
  const overlap = false;
  const transparent = false;

  let plottableQrSize = "0mm";
  let plottableQrViewBox = "0 0 0 0";

  onMount(() => {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    // auto load qr_astley_frame_000001.png
    fetch('qr_astley_frame_000001.png')
      .then(response => response.blob())
      .then(blob => {
        selectedFile = new File([blob], 'qr_astley_frame_000001.png');
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview = (e && e.target) ? e.target.result : null;
          analyzeImageAndGenerateQrPaths();
        };
        reader.readAsDataURL(selectedFile);
      });
  });

  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    selectedFile = target.files ? target.files[0] : null;
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview = e.target ? e.target.result : null;
        analyzeImageAndGenerateQrPaths();
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  function analyzeImageAndGenerateQrPaths() {
    const img = new Image();
    img.onload = () => {
      canvas.width = resolution;
      canvas.height = resolution;
      ctx.drawImage(img, 0, 0, resolution, resolution);
      const imageData = ctx.getImageData(0, 0, resolution, resolution);
      qrData = [];

      for (let y = 0; y < resolution; y++) {
        const row = [];
        for (let x = 0; x < resolution; x++) {
          const index = (y * resolution + x) * 4;
          const r = imageData.data[index];
          const g = imageData.data[index + 1];
          const b = imageData.data[index + 2];
          const brightness = (r + g + b) / 3;
          row.push(brightness < 128);
        }
        qrData.push(row);
      }
      qrPaths = generateQrSVGPaths(qrData, penWidth, overlap, transparent);
      if (svgContainer) {
        svgContainer.innerHTML = qrPaths.join('');
      }
      const size = resolution * penWidth;
      plottableQrSize = size + "mm";
      plottableQrViewBox = `0 0 ${size} ${size}`;
    };
    img.src = imagePreview;
  }

  function downloadPlottableSVG() {
    const svg = `<svg width="${plottableQrSize}" height="${plottableQrSize}" viewBox="${plottableQrViewBox}" xmlns="http://www.w3.org/2000/svg">
            ${qrPaths.map(path => `<path d="${path}" fill="none" stroke="black" stroke-width="${penWidth}" stroke-linecap="round" opacity=${transparent ? .7 : 1}/>`).join('')}
        </svg>`;
    const blob = new Blob([svg], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    let fileName = 'plottable-qr.svg';
    if (selectedFile && selectedFile.name) {
      fileName = selectedFile.name.replace(/\.[^/.]+$/, "") + '-plottable.svg';
    }
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="generator">
  <div class="header inputs">
    <div class="file-input">
      <Label for="file">Select QR Input Image:</Label>
      <Input type="file" id="file" accept="image/*" on:change={handleFileUpload}/>
    </div>
    <div class="resolution-input">
      <Label for="resolution">QR Dimensions:</Label>
      <Input type="number" bind:value={resolution} id="resolution"/></div>
  </div>
  <div class="header">
    <div class="input">

      {#if imagePreview}
        <h3>Input Image:</h3>
        <img src={imagePreview} alt="Uploaded QR Code" width={svgOutputSize} height={svgOutputSize} class="mt-2">
      {/if}
    </div>
  </div>
  <div class="header">
    <div>
      {#if qrPaths && qrPaths.length > 0}
        <h3>Plottable SVG Output:</h3>
      {/if}
      <svg width={`calc(${svgOutputSize}px + 2rem)`} height={`calc(${svgOutputSize}px + 2rem)`} viewBox={plottableQrViewBox}
           bind:this={svgContainer} class="mt-2">
      </svg>
    </div>
  </div>

  <div class="header mt-6 mb-6">
    {#if qrPaths && qrPaths.length > 0}
      <Button on:click={downloadPlottableSVG}>Download Plottable SVG</Button>
    {/if}
  </div>

  <div class="header mt-6 mb-6">
    <p>This image to plottable SVG conversion is very bare-bones by design. It was really just made to turn pictures of QR codes into
      plottable QR codes. It just doesn't care much if you actually feed it a QR or not and <i>works</i> either way.<br/><br/>
      In case you're in the market for something more elaborate to turn images into plottable SVGs you can check my other little project <a
              href="https://rstr.d17e.dev">RSTR</a>.
    </p>
    <Button on:click={() => window.location.href = 'https://rstr.d17e.dev'}>Visit RSTR</Button>
  </div>
</div>

<style>
    svg {
        background-color: white;
        border-radius: 1rem;
        border-width: 1rem;
        border-color: white;
    }

    .generator {
        margin-top: 3rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 90vw;
        max-width: 30rem;
    }

    .header {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: center;
    }

    .inputs {
        flex-direction: row;
    }

    .file-input {
        width: calc(100% - 9rem);
    }

    .resolution-input {
        width: 8rem;
    }

    @media (max-width: 768px) {
        .inputs {
            flex-direction: column;
            width: 100%;
            align-content: center;
        }

        .file-input {
            width: 85vw;
        }

        .resolution-input {
            width: 85vw;
        }
    }
</style>