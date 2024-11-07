<script lang="ts">
  export let imageUrl: string | null = null;
  export let orientation: 'portrait' | 'landscape' = 'portrait';
  export let offsetY = 0;

  import HatchedLogo from '$lib/components/bc/logo-d17e-hatched.svg?raw';

  // A3 dimensions in millimeters
  const A3_WIDTH = 420;
  const A3_HEIGHT = 297;

  // Business card dimensions in millimeters
  const CARD_WIDTH = 85;
  const CARD_HEIGHT = 55;

  // Logo dimensions from your SVG in millimeters
  const LOGO_WIDTH = 43.700001;
  const LOGO_HEIGHT = 12.6;

  let startX = 0;
  let startY = 0;
  let cardSizeX = CARD_WIDTH;
  let cardSizeY = CARD_HEIGHT;
  let cardsX = 0;
  let cardsY = 0;
  let logoWidth = 0;
  let logoHeight = 0;
  let logoOffsetTop = 0;

  let prevQrCount = 0;
  let qrCount = 0;
  let qrCodes = [];

  $: dimensions = orientation === 'portrait'
    ? {width: A3_HEIGHT, height: A3_WIDTH}
    : {width: A3_WIDTH, height: A3_HEIGHT};

  $: {
    if (orientation === 'portrait') {
      cardSizeX = CARD_WIDTH;
      cardSizeY = CARD_HEIGHT;
      cardsX = 3;
      cardsY = 6;
    } else {
      cardSizeX = CARD_HEIGHT;
      cardSizeY = CARD_WIDTH;
      cardsX = 6;
      cardsY = 3;
    }
    console.debug('orientation', orientation, 'dimensions', dimensions, 'cardSize', cardSizeX, cardSizeY, 'cards', cardsX, cardsY);
    startX = (dimensions.width - (cardSizeX * cardsX)) / 2;
    startY = (dimensions.height - (cardSizeY * cardsY)) / 2;
    logoWidth = cardSizeX - 10;
    logoHeight = (LOGO_HEIGHT / LOGO_WIDTH) * logoWidth;
    logoOffsetTop = cardSizeY - 5 - logoHeight;
    qrCount = cardsX * cardsY;
  }

  $: {
    if (qrCount !== prevQrCount) {
      (async () => {
        try {
          qrCodes = await generateQRCodes(qrCount);
          prevQrCount = qrCount;
          console.debug('qrCodes', qrCodes);
        } catch (error) {
          console.error('Error:', error);
        }
      })();
    }
  }

  async function generateQRCodes(count: number) {
    // Function to generate random 6-char alphanumeric string
    function generateRandomString() {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      return Array.from({length: 6}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    }

    // Function to make a single API call
    async function makeAPICall(randomString: string) {
      console.debug('makeAPICall', randomString);
      const response = await fetch('https://d17e-qrcodewebhook.web.val.run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          value: `https://qr.d17e.dev/bc/${randomString}`,
          ecl: 'H',
          penMmSize: .8
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      return response.text();
    }

    // Generate array of promises
    const promises = Array.from({length: count}, async () => {
      const randomString = generateRandomString();
      const svg = await makeAPICall(randomString);
      return {
        svg: svg,
        code: randomString
      };
    });

    // Wait for all promises to resolve
    return Promise.all(promises);
  }
</script>

<div class="layout-container">
  {#if imageUrl}
    <svg
            width={`${dimensions.width}mm`}
            height={`${dimensions.height}mm`}
            class="layout-svg"
            viewBox="0 0 {dimensions.width} {dimensions.height}"
            xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Background image with horizontal flip and transparency -->
      <defs>
        <g id="flipped-image">
          <image
                  href={imageUrl}
                  width="100%"
                  height="100%"
                  
          />
        </g>
        {@html HatchedLogo}
      </defs>

      <!-- Use the flipped image as background -->
      <use href="#flipped-image"/>

      <!-- Generate grid of business cards -->
      {#each Array(cardsY) as _, row}
        {#each Array(cardsX) as _, col}

          <rect
                  x={startX + (col * cardSizeX)}
                  y={offsetY + startY + (row * cardSizeY)}
                  width={cardSizeX}
                  height={cardSizeY}
                  stroke="#000000FF"
                  stroke-width=".3mm"
                  fill="#FFFFFFDD">
          </rect>

          {#if qrCodes && qrCodes[row * cardsX + col]}
            <g transform={`translate(${startX + (col * cardSizeX) + 5}, ${offsetY + startY + (row * cardSizeY) + 5})`}>
              {@html qrCodes[row * cardsX + col].svg}
            </g>
          {/if}


          <use
                  href="#d17e-hatched-logo"
                  x={startX + (col * cardSizeX) + 5}
                  y={offsetY + startY + logoOffsetTop + (row * cardSizeY)}
                  width={logoWidth}
                  height={logoHeight}
                  preserveAspectRatio="xMidYMid meet"
          />

        {/each}
      {/each}
    </svg>
  {/if}
</div>

<style>
    .layout-container {
        display: flex;
    }

    .layout-svg {
        width: 80vw;
        max-width: 80rem;
    }
</style>