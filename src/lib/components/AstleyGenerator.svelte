<script>
    import {onMount} from 'svelte';
    import {Input} from "$lib/components/ui/input";
    import {Label} from "$lib/components/ui/label";
    import {Button} from "$lib/components/ui/button";

    let fileInput;
    let selectedFile;
    let resolution = 75;
    let imagePreview;
    let qrData = [];
    let qrPaths = [];
    let canvas;
    let ctx;
    const svgOutputSize = 300;

    const penWidth = 0.5;

    let plottableQrSize = "0mm";
    let plottableQrViewBox = "0 0 0 0";

    onMount(() => {
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');
    });

    function handleFileUpload(event) {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview = e.target.result;
                analyzeImageAndGenerateQrPaths();
            };
            reader.readAsDataURL(selectedFile);
        }
    }

    function analyzeImageAndGenerateQrPaths() {
        const img = new Image();
        img.onload = () => {
            canvas.width = resolution;
            canvas.height = resolution;
            ctx.drawImage(img, 0, 0, resolution, resolution);
            const imageData = ctx.getImageData(0, 0, resolution, resolution);
            qrData = [];

            for (let y = 0; y < resolution; y++) {
                const row = [];
                for (let x = 0; x < resolution; x++) {
                    const index = (y * resolution + x) * 4;
                    const r = imageData.data[index];
                    const g = imageData.data[index + 1];
                    const b = imageData.data[index + 2];
                    const brightness = (r + g + b) / 3;
                    row.push(brightness < 128);
                }
                qrData.push(row);
            }
            qrPaths = generateQrPaths(qrData);
            const size = resolution * penWidth;
            plottableQrSize = size + "mm";
            plottableQrViewBox = `0 0 ${size} ${size}`;
        };
        img.src = imagePreview;
    }

    function generateQrPaths(qrData) {
        const paths = [];
        const visited = new Array(qrData.length).fill(0).map(() => new Array(qrData[0].length).fill(false));
        const width = qrData[0].length;
        const pathAdjustment = penWidth / 2;
        const height = qrData.length;

        function createPath(startX, startY, endX, endY) {
            return `M${startX},${startY}H${endX}V${endY}`;
        }

        function visitRow(visited, y, startX, endX) {
            for (let x = startX; x <= endX; x++) {
                visited[y][x] = true;
            }
        }

        function visitColumn(visited, x, startY, endY) {
            for (let y = startY; y <= endY; y++) {
                visited[y][x] = true;
            }
        }

        // Scan horizontally
        for (let y = 0; y < height; y++) {
            let startX = null;
            for (let x = 0; x < width; x++) {
                if (qrData[y][x] && startX === null) {
                    startX = x;
                } else if ((!qrData[y][x] || x === width - 1) && startX !== null) {
                    const endX = qrData[y][x] ? x : x - 1;
                    if (startX !== endX) {
                        paths.push(createPath(startX * penWidth + pathAdjustment, y * penWidth + pathAdjustment, (endX + 1) * penWidth - pathAdjustment, y * penWidth + pathAdjustment));
                        visitRow(visited, y, startX, endX);
                    }
                    startX = null;
                }
            }
        }

        // Scan vertically
        for (let x = 0; x < width; x++) {
            let startY = null;
            for (let y = 0; y < height; y++) {
                if (qrData[y][x] && startY === null && !visited[y][x]) {
                    startY = y;
                } else if ((!qrData[y][x] || y === height - 1) && startY !== null && !visited[y][x]) {
                    const endY = qrData[y][x] ? y : y - 1;
                    if (startY !== endY) {
                        paths.push(createPath(x * penWidth + pathAdjustment, startY * penWidth + pathAdjustment, x * penWidth + pathAdjustment, (endY + 1) * penWidth - pathAdjustment));
                        visitColumn(visited, x, startY, endY);
                    }
                    startY = null;
                }
            }
        }
        // Scan for all single black pixels
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (qrData[y][x] && !visited[y][x]) {
                    paths.push(createPath(x * penWidth + pathAdjustment, y * penWidth + pathAdjustment, x * penWidth + penWidth - pathAdjustment, y * penWidth + pathAdjustment));
                }
            }
        }

        return paths;
    }

    function downloadPlottableSVG() {
        const svg = `<svg width="${plottableQrSize}" height="${plottableQrSize}" viewBox="${plottableQrViewBox}" xmlns="http://www.w3.org/2000/svg">
            ${qrPaths.map(path => `<path d="${path}" fill="none" stroke="black" stroke-width="${penWidth}" stroke-linecap="round"/>`).join('')}
        </svg>`;
        const blob = new Blob([svg], {type: 'image/svg+xml'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        let fileName = 'plottable-qr.svg';
        if (selectedFile && selectedFile.name) {
            fileName = selectedFile.name.replace(/\.[^/.]+$/, "") + '-plottable.svg';
        }
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }
</script>

<div class="generator">
  <div class="header inputs">
    <div class="file-input">
      <Label for="file">Select Image:</Label>
      <Input type="file" id="file" accept="image/*" on:change={handleFileUpload} bind:this={fileInput}/>
    </div>
    <div class="resolution-input">
      <Label for="resolution">QR Dimensions:</Label>
      <Input type="number" bind:value={resolution} id="resolution"/></div>
  </div>
  <div class="header">
    <div class="input">

      {#if imagePreview}
        <h3>Input Frame:</h3>
        <img src={imagePreview} alt="Uploaded QR Code" width={svgOutputSize} height={svgOutputSize}>
      {/if}
    </div>

    {#if qrData.length > 0}
      <div class="html-output">
        <h3>HTML Table Output:</h3>
        <table>
          {#each qrData as row}
            <tr>
              {#each row as cell}
                <td class:black={cell} class:white={!cell}></td>
              {/each}
            </tr>
          {/each}
        </table>
      </div>
    {/if}
  </div>
  <div class="header">
    <div>
      {#if qrData.length > 0}
        <h3>RAW SVG Output:</h3>
        <svg width={svgOutputSize} height={svgOutputSize} viewBox={`0 0 ${resolution} ${resolution}`}>
          {#each qrData as row, y}
            {#each row as cell, x}
              {#if cell}
                <rect x={x} y={y} width="1" height="1"/>
              {/if}
            {/each}
          {/each}
        </svg>
      {/if}
    </div>
    <div>
      {#if qrPaths.length > 0}
        <h3>Plottable SVG Output:</h3>
        <svg width={svgOutputSize} height={svgOutputSize} viewBox={plottableQrViewBox}>
          {#each qrPaths as path}
            <path d={path} fill="none" stroke="black" stroke-width={penWidth} stroke-linecap="round"/>
          {/each}
        </svg>
      {/if}
    </div>
  </div>

  <div class="header">
    {#if qrPaths.length > 0}
      <Button on:click={downloadPlottableSVG}>Download Plottable SVG</Button>
    {/if}
  </div>

</div>

<style>
    .generator {
        margin-top: 3rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .header {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: center;
    }

    .inputs {
        flex-direction: row;
    }

    .file-input {
        width: calc(100% - 9rem);
    }

    .resolution-input {
        width: 8rem;
    }

    table {
        border-collapse: collapse;
    }

    td {
        width: 4px;
        height: 4px;
        padding: 0;
    }

    .black {
        background-color: black;
    }

    .white {
        background-color: white;
    }
</style>