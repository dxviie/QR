<script lang="ts">

  import {qrOutputStore} from "$lib/qrStore";
  import {Button} from "$lib/components/ui/button";
  import {toast} from "svelte-sonner";

  let qrOutput = {
    svg: '',
    remark: '',
    totalPathLength: 0
  }

  qrOutputStore.subscribe(value => {
    qrOutput = value;
  });

  const downloadSVG = async () => {
    const svg = qrOutput.svg;
    const blob = new Blob([svg], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);

    // Create an invisible anchor element
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'd17e.dev-plottable-qr-code.svg';

    // Append it to the document
    document.body.appendChild(a);

    // Trigger a click event on the anchor
    a.click();

    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success('SVG downloaded');
  }
</script>

<div>
  <div class="flex flex-col gap-2">
    {#if qrOutput.svg}
      <div>
        <Button on:click={downloadSVG}>Download SVG</Button>
      </div>
    {/if}
    {#if qrOutput.totalPathLength}
      <div>
        <label for="totalPathLength">Total Path Length =~ {qrOutput.totalPathLength.toFixed(0)} mm </label>
      </div>
    {/if}
  </div>
</div>