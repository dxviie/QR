<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import QRCode from "$lib/components/QRCode.svelte";
  import QRConfig from "$lib/components/QRConfig.svelte";
  import QROutput from "$lib/components/QROutput.svelte";
</script>

<div class="generator-layout">

  <Card.Root>
    <Card.Header>
      <Card.Title>QR Code</Card.Title>
      <Card.Description></Card.Description>
    </Card.Header>
    <Card.Content>
      <QRCode/>
    </Card.Content>
    <Card.Footer>
    </Card.Footer>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>Configuration</Card.Title>
      <Card.Description></Card.Description>
    </Card.Header>
    <Card.Content>
      <QRConfig/>
    </Card.Content>
    <Card.Footer>
    </Card.Footer>
  </Card.Root>

  <QROutput/>
</div>

<style>
    .generator-layout {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        gap: 1rem;
    }
</style>
