<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import QRCode from "$lib/components/QRCode.svelte";
  import QRConfig from "$lib/components/QRConfig.svelte";
  import QROutput from "$lib/components/QROutput.svelte";
  import {qrOutputStore} from "$lib/qrStore";

  let qrOutput = {
    svg: '',
    remark: '',
    totalPathLength: 0
  }

  qrOutputStore.subscribe(value => {
    qrOutput = value;
  });
</script>

<div class="generator-layout">

  <div class="qr-wrapper">
    <Card.Root>
      <Card.Header>
      </Card.Header>
      <Card.Content>
        <QRCode/>
      </Card.Content>
      <Card.Footer>
      </Card.Footer>
    </Card.Root>
  </div>

  <div class="controls">
    {#if qrOutput.svg}
      <Card.Root>
        <Card.Header>
        </Card.Header>
        <Card.Content>
          <QROutput/>
        </Card.Content>
        <Card.Footer>
        </Card.Footer>
      </Card.Root>
    {/if}

    <Card.Root>
      <Card.Header>
        <Card.Title tag="h6">Configuration</Card.Title>
        <Card.Description></Card.Description>
      </Card.Header>
      <Card.Content>
        <QRConfig/>
      </Card.Content>
      <Card.Footer>
        {#if qrOutput.remark}
          <div>
            <p>⚠️{qrOutput.remark}</p>
          </div>
        {/if}
      </Card.Footer>
    </Card.Root>
  </div>
</div>

<style>

    .generator-layout {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        gap: 1rem;
    }

    @media (max-width: 768px) {
        .generator-layout {
            flex-direction: column;
            min-height: 100svh;
            max-width: 1200px;
        }

        .qr-wrapper {
            position: sticky;
            top: 5rem;
        }

        .controls {
            z-index: 1;
            backdrop-filter: blur(5px);
        }
    }

    .controls {
        padding: 1rem;
        background-color: hsl(var(--background));
        border-radius: 0.5rem;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    }

    .controls > * {
        margin-bottom: 1rem;
    }

    .controls > *:last-child {
        margin-bottom: 0;
    }
</style>
