<script lang="ts">
  import {Button} from "$lib/components/ui/button";

  export let imageUrl: string | null = null;
  export let orientation: 'portrait' | 'landscape' = 'portrait';
  export let offsetX = 0;
  export let offsetY = 0;
  export let artworkTitle = '';
  export let extraText = '';

  import HatchedLogo from '$lib/components/bc/logo-d17e-hatched-optimized.svg?raw';
  import EMSReadability from '$lib/components/bc/EMSReadability.svg?raw';
  import {flattenSVGToPaths} from "$lib/svgFlattener";
  import {generateQrPages} from "$lib/qrPageGenerator";

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
  const subTextHeight = 5;
  const subTextSpacing = 3;
  let logoOffsetTop = 0;
  let subTextOffsetTop = 0;
  let extraTextPath = '';

  let prevQrCount = 0;
  let qrCount = 0;
  let qrCodes: { svg: string, code: string, textPath: string }[] = [];

  let codeSVG = '';
  let artSVG = '';
  let ideasSVG = '';

  $: dimensions = orientation === 'portrait'
    ? {width: A3_HEIGHT, height: A3_WIDTH}
    : {width: A3_WIDTH, height: A3_HEIGHT};

  $ : {
    if (extraText) {
      const glyphMap = parseGlyphs(EMSReadability);
      console.debug('extraText changed', extraText);
      extraTextPath = textToPath(extraText, 0, 0, glyphMap);
    }
  }

  $: {
    if (typeof window !== 'undefined') {
      if (orientation === 'portrait') {
        cardSizeX = CARD_WIDTH;
        cardSizeY = CARD_HEIGHT;
        cardsX = 3;
        cardsY = 6;
      } else {
        cardSizeX = CARD_HEIGHT;
        cardSizeY = CARD_WIDTH;
        cardsX = 7;
        cardsY = 3;
      }
      console.debug('orientation', orientation, 'dimensions', dimensions, 'cardSize', cardSizeX, cardSizeY, 'cards', cardsX, cardsY);
      startX = (dimensions.width - (cardSizeX * cardsX)) / 2;
      startY = (dimensions.height - (cardSizeY * cardsY)) / 2;
      logoWidth = cardSizeX - 10;
      logoHeight = (LOGO_HEIGHT / LOGO_WIDTH) * logoWidth;
      subTextOffsetTop = cardSizeY - 5 - subTextHeight;
      logoOffsetTop = subTextOffsetTop - subTextSpacing - logoHeight;
      qrCount = cardsX * cardsY;
      console.debug('startX', startX, 'startY', startY, 'logoWidth', logoWidth, 'logoHeight', logoHeight, 'logoOffsetTop', logoOffsetTop, 'qrCount', qrCount)
    }
  }

  $: {
    if (qrCount !== prevQrCount) {
      (async () => {
        try {
          const glyphMap = parseGlyphs(EMSReadability);
          codeSVG = textToPath("code.", 0, 0, glyphMap);
          artSVG = textToPath("art.", 0, 0, glyphMap);
          ideasSVG = textToPath("ideas.", 0, 0, glyphMap);
          qrCodes = await generateBusinessCards(qrCount);
          prevQrCount = qrCount;
          console.debug('qrCodes', qrCodes);
        } catch (error) {
          console.error('Error:', error);
        }
      })();
    }
  }

  async function generateBusinessCards(count: number) {
    // Function to generate random 6-char alphanumeric string
    function generateRandomString() {
      const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
      return Array.from({length: 6}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    }

    // Function to make a single API call
    async function createQrObjectForString(randomString: string) {
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
    const promises = Array.from({length: count}, async (item, index) => {
      const glyphMap = parseGlyphs(EMSReadability);
      const randomString = generateRandomString();
      const textPath = textToPath(`qr.d17e.dev/bc/${randomString}`, 0, 0, glyphMap);
      const svg = await createQrObjectForString(randomString);
      const svgPaths = flattenSVGToPaths(svg);
      return {
        svg: svgPaths,
        code: randomString,
        textPath: textPath
      };
    });

    // Wait for all promises to resolve
    return Promise.all(promises);
  }

  function parseGlyphs(fontDefs: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(fontDefs, 'text/xml');
    const glyphMap = new Map();

    doc.querySelectorAll('glyph').forEach(glyph => {
      const unicode = glyph.getAttribute('unicode');
      const d = glyph.getAttribute('d');
      const width = glyph.getAttribute('horiz-adv-x') || "378";
      if (unicode && d) {
        glyphMap.set(unicode, {
          pathData: d,
          width: parseFloat(width)
        });
      }
    });

    console.debug('glyphMap', glyphMap);
    return glyphMap;
  }

  function textToPath(text: string, x = 0, y = 0, glyphMap: Map<string, { pathData: string, width: number }>, scale = 0.0025) { // Added scale parameter
    let currentX = x;
    const paths = [];

    for (const char of text) {
      const glyph = glyphMap.get(char);
      if (glyph) {
        paths.push(`<path
                d="${glyph.pathData}"
                transform="translate(${currentX}, ${y}) scale(${scale}, ${-scale})"
                fill="none"
                stroke="black"
                stroke-width="100"
            />`);
        currentX += glyph.width * scale; // Scale the spacing too
      }
    }

    return paths.join('\n');
  }

  async function downloadSVG() {
    const svg = document.querySelector('.layout-svg');
    if (!svg) {
      console.error('SVG not found');
      return;
    }
    if (!artworkTitle) {
      console.error('Artwork title is required');
      return;
    }
    console.log("==============SVG=====================", svg);
    await generateQrPages(qrCodes, svg, artworkTitle);
    // remove all rects from SVG
    const svgCopy = svg.cloneNode(true) as SVGElement;
    svgCopy.querySelectorAll('rect').forEach(rect => rect.remove());
    // remove all the defs and images from SVG
    svgCopy.querySelectorAll('defs').forEach(defs => defs.remove());

    const svgData = new XMLSerializer().serializeToString(svgCopy);
    const blob = new Blob([svgData], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'business-cards.svg';
    a.click();
    URL.revokeObjectURL(url);
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
                  width={dimensions.width}
                  height={dimensions.height}
                  x="0"
                  y="0"
                  transform="scale(-1, 1) translate(-{dimensions.width}, 0)"
          />
        </g>
      </defs>

      <!-- Use the flipped image as background -->
      <use href="#flipped-image"/>

      <g id="cutting-lines">
        <!-- Drawing cutting marks      -->
        <!--   Horizontal Top   -->
        <path d={`M ${startX + offsetX - 10},${startY + offsetY} L ${startX + offsetX + 3},${startY + offsetY}`} stroke="black"
              fill="none"/>
        <path d={`M ${startX + offsetX + (cardSizeX * cardsX) - 3},${startY + offsetY} L ${startX + offsetX + (cardSizeX * cardsX) + 10},${startY + offsetY}`}
              stroke="black" fill="none"/>
        <!--   Horizontal Bottom   -->
        <path d={`M ${startX + offsetX - 10},${startY + offsetY + (cardSizeY * cardsY)} L ${startX + offsetX + 3},${startY + offsetY + (cardSizeY * cardsY)}`}
              stroke="black" fill="none"/>
        <path d={`M ${startX + offsetX + (cardSizeX * cardsX) - 3},${startY + offsetY + (cardSizeY * cardsY)} L ${startX + offsetX + (cardSizeX * cardsX) + 10},${startY + offsetY + (cardSizeY * cardsY)}`}
              stroke="black" fill="none"/>
        <!--   Vertical Left   -->
        <path d={`M ${startX + offsetX},${startY + offsetY - 10} L ${startX + offsetX},${startY + offsetY - 5}`} stroke="black"
              fill="none"/>
        <path d={`M ${startX + offsetX},${startY + offsetY + (cardSizeY * cardsY) + 5} L ${startX + offsetX},${startY + offsetY + (cardSizeY * cardsY) + 10}`}
              stroke="black" fill="none"/>
        <!--   Vertical Right   -->
        <path d={`M ${startX + offsetX + (cardSizeX * cardsX)},${startY + offsetY - 10} L ${startX + offsetX + (cardSizeX * cardsX)},${startY + offsetY - 5}`}
              stroke="black" fill="none"/>
        <path d={`M ${startX + offsetX + (cardSizeX * cardsX)},${startY + offsetY + (cardSizeY * cardsY) + 5} L ${startX + offsetX + (cardSizeX * cardsX)},${startY + offsetY + (cardSizeY * cardsY) + 10}`}
              stroke="black" fill="none"/>
      </g>

      <g id="card-rects">
        {#each Array(cardsY) as _, row}
          {#each Array(cardsX) as _, col}
            {#if qrCodes && qrCodes[row * cardsX + col]}
              <rect
                      id={`card-${qrCodes[row * cardsX + col].code}`}
                      x={startX + offsetX + (col * cardSizeX)}
                      y={startY + offsetY + (row * cardSizeY)}
                      width={cardSizeX}
                      height={cardSizeY}
                      fill="#FFFFFFBB"
                      stroke="black"
                      stroke-width=".05"
              />
            {/if}
          {/each}
        {/each}
      </g>

      <g id="qr-codes">
        {#each Array(cardsY) as _, row}
          {#each Array(cardsX) as _, col}
            {#if qrCodes && qrCodes[row * cardsX + col]}
              <g transform={`translate(${startX + offsetX + (col * cardSizeX) + 5}, ${offsetY + startY + (row * cardSizeY) + 5})`}>
                {@html qrCodes[row * cardsX + col].svg}
              </g>
            {/if}
          {/each}
        {/each}
      </g>

      <g id="qr-text">
        {#each Array(cardsY) as _, row}
          {#each Array(cardsX) as _, col}
            {#if qrCodes && qrCodes[row * cardsX + col]}
              <g transform={`translate(${startX + offsetX + (col * cardSizeX) + 5}, ${offsetY + startY + (row * cardSizeY) + 35})`}>
                {@html qrCodes[row * cardsX + col].textPath}
              </g>
            {/if}
          {/each}
        {/each}
      </g>

      <g id="extra-text">
        {#each Array(cardsY) as _, row}
          {#each Array(cardsX) as _, col}
            {#if qrCodes && qrCodes[row * cardsX + col] && extraText}
              <g transform="translate({startX + offsetX + (col * cardSizeX) + 5}, {offsetY + startY + (row * cardSizeY) + 42}) scale(1.66)">
                {@html extraTextPath}
              </g>
            {/if}
          {/each}
        {/each}
      </g>

      <g id="logos">
        {#each Array(cardsY) as _, row}
          {#each Array(cardsX) as _, col}
            {#if qrCodes && qrCodes[row * cardsX + col]}
              <g transform="translate({startX + offsetX + (col * cardSizeX) + 5}, {offsetY + startY + logoOffsetTop + (row * cardSizeY)})"
                 stroke-width="20">
                {@html flattenSVGToPaths(HatchedLogo)}
              </g>
            {/if}
          {/each}
        {/each}
      </g>

      <g id="subtext">
        {#each Array(cardsY) as _, row}
          {#each Array(cardsX) as _, col}
            {#if qrCodes && qrCodes[row * cardsX + col]}
              <g transform="translate({startX + offsetX + (col * cardSizeX) + 10.5}, {offsetY + startY + subTextOffsetTop + subTextSpacing + (row * cardSizeY)}) scale(2)"
                 stroke-width="20">
                {@html codeSVG}
              </g>
              <g transform="translate({startX + offsetX + (col * cardSizeX) + 23.25}, {offsetY + startY + subTextOffsetTop + subTextSpacing + (row * cardSizeY)}) scale(2)"
                 stroke-width="20">
                {@html artSVG}
              </g>
              <g transform="translate({startX + offsetX + (col * cardSizeX) + 31.75}, {offsetY + startY + subTextOffsetTop + subTextSpacing + (row * cardSizeY)}) scale(2)"
                 stroke-width="20">
                {@html ideasSVG}
              </g>
            {/if}
          {/each}
        {/each}
      </g>
    </svg>
  {/if}

  <Button on:click={downloadSVG}>Create Pages & Download Plottable SVG</Button>
</div>

<style>
    .layout-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .layout-svg {
        width: 80vw;
        max-width: 80rem;
        height: auto;
        margin-bottom: 1rem;

    }
</style>