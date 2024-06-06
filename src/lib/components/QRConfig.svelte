<script lang="ts">
  import {Input} from "$lib/components/ui/input/index.js";
  import {Label} from "$lib/components/ui/label/index.js";
  import {qrConfigStore} from "$lib/components/qrStore";

  const handleQrTextChange = (e: Event) => {
    const inputElement = e.target as HTMLInputElement;
    qrConfigStore.update((config) => {
      return {...config, value: inputElement.value};
    });
  }
</script>

<div class="flex w-full max-w-sm flex-col gap-1.5">
  <Label for="email">QR Text</Label>
  <Input type="email" id="email" placeholder="https://qr.d17e.dev/1234" on:change={handleQrTextChange}/>
</div>