<script lang="ts">

  import {qrOutputStore} from "$lib/components/qrStore";
  import {Button} from "$lib/components/ui/button";

  let qrOutput = {
    svg: '',
    remark: '',
    totalPathLength: 0
  }

  qrOutputStore.subscribe(value => {
    qrOutput = value;
  });

  const downloadSVG = () => {
    const svg = qrOutput.svg;
    const blob = new Blob([svg], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-code.svg';
    a.click();
    URL.revokeObjectURL(url);
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
        <label for="totalPathLength">Total Path Length: {qrOutput.totalPathLength.toFixed(2)} mm </label>
      </div>
    {/if}
  </div>
</div>