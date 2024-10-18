<script lang="ts">
  import {qrConfigStore, qrOutputStore} from "$lib/qrStore";
  import type {QrConfig} from "$lib/qr";
  import {generateQrSVGPaths} from "$lib/qrPathGenerator";

  let svgContainer: SVGElement | null = null;
  let plottableQrViewBox = "0 0 0 0";

  let config: QrConfig | null = null;
  qrConfigStore.subscribe(
    (currentConfig) => {
      if (!currentConfig || !currentConfig.value) return;
      config = currentConfig;

      console.debug('current qr config', currentConfig);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      import("qrcode-svg").then(({default: QRCode}) => {
        /************************************************************************
         QR CODE GENERATION & PREPARATION
         ************************************************************************/
        let dimension = 21;
        let plottableQrSize = dimension * (config?.penMmSize || 0);
        plottableQrViewBox = `0 0 ${plottableQrSize} ${plottableQrSize}`;
        console.debug('qr dimension:', dimension)
        // Create a new QRCode
        let qr = new QRCode({
          content: currentConfig.value,
          padding: 0,
          width: dimension,
          height: dimension,
          color: '#000000',
          background: '#ffffff',
          ecl: currentConfig.ecl,
          join: false,
          predefined: false
        });

        let qrData = qr.qrcode.modules;
        if (qrData && qrData.length > dimension) {
          dimension = qrData.length;
          plottableQrSize = dimension * (config?.penMmSize || 0);
          plottableQrViewBox = `0 0 ${plottableQrSize} ${plottableQrSize}`;
          console.debug('initial qr dimension too small. adjusting to:', dimension)
        }
        let paths = generateQrSVGPaths(qrData, config?.penMmSize || 0.5, config?.overlap || false, config?.transparent || false);
        let totalPathLength = paths.pop(); // Remove the last path which is the total path length
        const svg = `<svg width="${plottableQrSize}" height="${plottableQrSize}" viewBox="${plottableQrViewBox}" xmlns="http://www.w3.org/2000/svg">
            ${paths.join('')}
        </svg>`;
        qrOutputStore.update(store => ({
          ...store,
          svg: svg,
          outputInfo: `Total Path Length: ~${totalPathLength} mm<br/>QR Dimensions: ${plottableQrSize}x${plottableQrSize} mm`,
          remark: 'generated'
        }));
        if (paths && svgContainer) {
          svgContainer.innerHTML = paths.join('');
        }
      });
    }
  );
</script>

<svg class="qr-svg" viewBox={plottableQrViewBox} bind:this={svgContainer}>
</svg>

<style>
    .qr-svg {
        display: block;
        width: calc(100vw - 42rem);
        max-width: 50rem;
        aspect-ratio: 1;
        background-color: white;
        border-radius: 1rem;
        border-color: white;
        border-width: 1rem;
    }

    @media (max-width: 850px) {
        .qr-svg {
            width: 100%;
        }
    }
</style>