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

  <Card.Root>
    <Card.Header>
      <Card.Title><p class="title">QR Code Preview</p></Card.Title>
      <Card.Description><p class="description">(right-click & save-as to download image)</p></Card.Description>
    </Card.Header>
    <Card.Content>
      <QRCode/>
    </Card.Content>
    <Card.Footer>
    </Card.Footer>
  </Card.Root>

  <div class="side-bar">
    {#if qrOutput.svg}
      <Card.Root>
        <Card.Header>
          <!--        <Card.Title>Output</Card.Title>-->
          <!--        <Card.Description></Card.Description>-->
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
        <Card.Title>Configuration</Card.Title>
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
    .title {
        font-size: x-large;
    }

    .description {
        font-size: small;
    }

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
        }
    }

    .side-bar {
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 18rem;
    }
</style>
