<script lang="ts">
  import {Label} from "$lib/components/ui/label/index.js";
  import {Input} from "$lib/components/ui/input/index.js";
  import * as Select from '$lib/components/ui/select';
  import {Checkbox} from "$lib/components/ui/checkbox";
  import {qrConfigStore} from "$lib/qrStore";
  import type {QrConfig} from "$lib/qr";
  import {onMount} from "svelte";
  import {Github} from "lucide-svelte";

  // Subscribe to the store to get the initial values
  let qrConfig: QrConfig = {
    value: 'https://qr.d17e.dev/',
    mmSize: 15,
    ecl: 'L',
    penMmSize: .5,
    penTip: 'Round',
    overlap: false,
    transparent: false
  };

  qrConfigStore.subscribe(value => {
    qrConfig = value;
  });

  onMount(() => {
    qrConfigStore.update(() => (qrConfig));
  });

  function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let timeoutId: ReturnType<typeof setTimeout>;

    return function (this: any, ...args: Parameters<T>) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    } as T;
  }

  type UpdateFunction<T> = (value: Partial<T>) => void;

  function createDebouncedUpdate<T>(delay: number = 500): UpdateFunction<T> {
    return debounce((value: Partial<T>) => {
      qrConfigStore.update(store => ({...store, ...value}));
    }, delay);
  }

  // Create debounced update function
  const debouncedUpdate = createDebouncedUpdate<QrConfig>();

  // Event handlers
  function handleQrTextChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    debouncedUpdate({value});
  }

  function handleMmSizeChange(event: Event) {
    const mmSize = Number((event.target as HTMLInputElement).value);
    debouncedUpdate({mmSize});
  }

  function updateEcl(ecl: string) {
    debouncedUpdate({ecl});
  }

  function handlePenMmSizeChange(event: Event) {
    const penMmSize = Number((event.target as HTMLInputElement).value);
    debouncedUpdate({penMmSize});
  }

  function updatePenTip(penTip: string) {
    debouncedUpdate({penTip});
  }

  function updateOverlap(overlap: boolean) {
    debouncedUpdate({overlap});
  }

  function updateTransparent(transparent: boolean) {
    debouncedUpdate({transparent});
  }

</script>

<div class="flex w-full max-w-sm flex-col gap-2">
  <div>
    <Label for="value">QR Text</Label>
    <Input type="text" id="value" value={qrConfig.value} on:change={handleQrTextChange}/>
  </div>

  <div>
    <Label for="mmSize">QR Code Size (10 - 500 mm)</Label>
    <Input type="number" id="mmSize" min="10" max="500" value={qrConfig.mmSize} on:change={handleMmSizeChange}/>
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
    <Label for="penMmSize">Pen Tip Size (>0.05 mm)</Label>
    <Input type="number" id="penMmSize" min="0.05" step="0.05" value={qrConfig.penMmSize} on:change={handlePenMmSizeChange}/>
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

  <div class="flex flex-col items-baseline gap-2.5 space-x-2 mt-2">
    <div>
      <Checkbox id="overlap" aria-labelledby="overlap-label" checked={qrConfig.overlap}
                onCheckedChange={(checked) => updateOverlap(checked)}/>
      <Label id="overlap-label" for="overlap">
        Overlap Allowed
      </Label>
    </div>
    <div>
      <Checkbox id="transparent" aria-labelledby="transparent-label" checked={qrConfig.transparent}
                onCheckedChange={(checked) => updateTransparent(checked)}/>
      <Label id="transparent-label" for="transparent">
        Transparent Lines
      </Label>
    </div>
    <div class="linky">
      <Github class="w-6 h-6"/>
      <a href="https://github.com/dxviie/QR" target="_blank">

        Source Code
      </a>
    </div>
  </div>
</div>

<style>
    .linky {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: hsl(var(--foreground));
    }
</style>