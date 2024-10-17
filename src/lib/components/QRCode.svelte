<script lang="ts">

  import {qrConfigStore, qrOutputStore} from "$lib/qrStore";
  import type {QrConfig} from "$lib/qr";
  import {generateQrSVGPaths} from "$lib/qrPathGenerator";

  let svgContainer: any;
  let plottableQrViewBox = "0 0 0 0";

  function calculateQRSize(text, ecl) {
    // Estimate the mode based on the content
    let mode;
    if (/^[0-9]+$/.test(text)) {
      mode = 'numeric';
    } else if (/^[A-Z0-9 $%*+\-./:]+$/.test(text)) {
      mode = 'alphanumeric';
    } else {
      mode = 'byte';
    }

    // Capacity in bits for each version and ECL
    const capacities = {
      'L': [152, 272, 440, 640, 864, 1088, 1248, 1552, 1856, 2192, 2592, 2960, 3424, 3688, 4184, 4712, 5176, 5768, 6360, 6888, 7456, 8048, 8752, 9392, 10208, 10960, 11744, 12248, 13048, 13880, 14744, 15640, 16568, 17528, 18448, 19472, 20528, 21616, 22496, 23648],
      'M': [128, 224, 352, 512, 688, 864, 992, 1232, 1456, 1728, 2032, 2320, 2672, 2920, 3320, 3624, 4056, 4504, 5016, 5352, 5712, 6256, 6880, 7312, 8000, 8496, 9024, 9544, 10136, 10984, 11640, 12328, 13048, 13800, 14496, 15312, 15936, 16816, 17728, 18672],
      'Q': [104, 176, 272, 384, 496, 608, 704, 880, 1056, 1232, 1440, 1648, 1952, 2088, 2360, 2600, 2936, 3176, 3560, 3880, 4096, 4544, 4912, 5312, 5744, 6032, 6464, 6968, 7288, 7880, 8264, 8920, 9368, 9848, 10288, 10832, 11408, 12016, 12656, 13328],
      'H': [72, 128, 208, 288, 368, 480, 528, 688, 800, 976, 1120, 1264, 1440, 1576, 1784, 2024, 2264, 2504, 2728, 3080, 3248, 3536, 3712, 4112, 4304, 4768, 5024, 5288, 5608, 5960, 6344, 6760, 7208, 7688, 7888, 8432, 8768, 9136, 9776, 10208]
    };

    // Calculate the bit length of the data
    let bitLength;
    switch (mode) {
      case 'numeric':
        bitLength = Math.ceil(text.length * 3.33);
        break;
      case 'alphanumeric':
        bitLength = Math.ceil(text.length * 6);
        break;
      case 'byte':
      default:
        bitLength = text.length * 8;
    }

    // Find the smallest version that can contain the data
    let version;
    for (version = 0; version < 40; version++) {
      if (capacities[ecl][version] >= bitLength) {
        break;
      }
    }

    // Calculate the module size (each version increases by 4 modules per side)
    const moduleSize = 21 + (version * 4);

    return moduleSize;
  }

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
        const dimension = calculateQRSize(currentConfig.value, currentConfig.ecl);
        const plottableQrSize = dimension * (config?.penMmSize || 0);
        console.debug('qr dimension:', dimension)
        plottableQrViewBox = `0 0 ${plottableQrSize} ${plottableQrSize}`;
        // Create a new QRCode
        const qr = new QRCode({
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
        let paths = generateQrSVGPaths(qrData, config?.penMmSize || 0.5, config?.overlap || false, config?.transparent || false);
        let totalPathLength = paths.pop(); // Remove the last path which is the total path length
        console.log('---------------length:', totalPathLength);
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