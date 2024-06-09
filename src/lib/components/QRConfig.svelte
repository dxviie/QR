<script lang="ts">
  import {Label} from "$lib/components/ui/label/index.js";
  import {Input} from "$lib/components/ui/input/index.js";
  import * as Select from '$lib/components/ui/select';
  import {Checkbox} from "$lib/components/ui/checkbox";
  import {qrConfigStore} from "$lib/components/qrStore";
  import type {QrConfig} from "$lib/qr";
  import {onMount} from "svelte";

  // Subscribe to the store to get the initial values
  let qrConfig: QrConfig = {
    value: 'https://qr.d17e.dev/',
    mmSize: 15,
    ecl: 'L',
    penMmSize: .8,
    penTip: 'Round',
    overlap: false
  };

  qrConfigStore.subscribe(value => {
    qrConfig = value;
  });

  onMount(() => {
    qrConfigStore.update(() => (qrConfig));
  });

  // Event handlers to update the store
  function handleQrTextChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    qrConfigStore.update(store => ({...store, value: inputElement.value}));
  }

  function handleMmSizeChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    qrConfigStore.update(store => ({...store, mmSize: Number(inputElement.value)}));
  }

  function updateEcl(ecl: string) {
    qrConfigStore.update(store => ({...store, ecl: ecl}));
  }

  function handlePenMmSizeChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    qrConfigStore.update(store => ({...store, penMmSize: Number(inputElement.value)}));
  }

  function updatePenTip(penTip: string) {
    qrConfigStore.update(store => ({...store, penTip: penTip}));
  }

  function udpateOverlap(overlap: boolean) {
    qrConfigStore.update(store => ({...store, overlap: overlap}));
  }

</script>

<div class="flex w-full max-w-sm flex-col gap-2">
  <div>
    <Label for="value">QR Text</Label>
    <Input type="text" id="value" value={qrConfig.value} on:input={handleQrTextChange}/>
  </div>

  <div>
    <Label for="mmSize">QR Code Size (mm)</Label>
    <Input type="number" id="mmSize" min="10" value={qrConfig.mmSize} on:input={handleMmSizeChange}/>
  </div>

  <div>
    <Label for="ecl">QR Error Correction Level</Label>
    <Select.Root onSelectedChange={(event) => updateEcl(event.value)}>
      <Select.Trigger>
        {qrConfig.ecl}
      </Select.Trigger>
      <Select.Content id="ecl">
        <Select.Item value="L">L</Select.Item>
        <Select.Item value="M">M</Select.Item>
        <Select.Item value="H">H</Select.Item>
        <Select.Item value="Q">Q</Select.Item>
      </Select.Content>
    </Select.Root>
  </div>

  <div>
    <Label for="penMmSize">Pen Tip Size (mm)</Label>
    <Input type="number" id="penMmSize" min="0.05" value={qrConfig.penMmSize} on:input={handlePenMmSizeChange}/>
  </div>

  <div>
    <Label for="penTip">Pen Tip</Label>
    <Select.Root onSelectedChange={(event) => updatePenTip(event.value)}>
      <Select.Trigger>
        {qrConfig.penTip}
      </Select.Trigger>
      <Select.Content id="penTip">
        <Select.Item value="Round">Round</Select.Item>
        <Select.Item value="Square">Square</Select.Item>
      </Select.Content>
    </Select.Root>
  </div>

  <div class="flex items-center space-x-2 mt-2">
    <Checkbox id="terms" aria-labelledby="terms-label" checked={qrConfig.overlap} onCheckedChange={(checked) => udpateOverlap(checked)}/>
    <Label id="overlap-label" for="overlap">
      Overlap Allowed
    </Label>
  </div>
</div>

<style>
    /* Add your styles here */
    .flex {
        display: flex;
    }

    .w-full {
        width: 100%;
    }

    .max-w-sm {
        max-width: 20rem;
    }

    .flex-col {
        flex-direction: column;
    }
</style>
