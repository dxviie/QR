<script>
    import {onMount} from 'svelte';
    import {Input} from "$lib/components/ui/input";

    let fileInput;
    let imagePreview;
    let qrData = [];
    let qrPaths = [];
    let canvas;
    let ctx;
    const qrInputDimension = 75;
    const svgOutputSize = 375;

    const penWidth = 0.5;

    let plottableQrSize = "0mm";
    let plottableQrViewBox = "0 0 0 0";

    onMount(() => {
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');
    });

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview = e.target.result;
                analyzeImageAndGenerateQrPaths();
            };
            reader.readAsDataURL(file);
        }
    }

    function analyzeImageAndGenerateQrPaths() {
        const img = new Image();
        img.onload = () => {
            canvas.width = qrInputDimension;
            canvas.height = qrInputDimension;
            ctx.drawImage(img, 0, 0, qrInputDimension, qrInputDimension);
            const imageData = ctx.getImageData(0, 0, qrInputDimension, qrInputDimension);
            qrData = [];

            for (let y = 0; y < qrInputDimension; y++) {
                const row = [];
                for (let x = 0; x < qrInputDimension; x++) {
                    const index = (y * qrInputDimension + x) * 4;
                    const r = imageData.data[index];
                    const g = imageData.data[index + 1];
                    const b = imageData.data[index + 2];
                    const brightness = (r + g + b) / 3;
                    row.push(brightness < 128);
                }
                qrData.push(row);
            }
            qrPaths = generateQrPaths(qrData);
            const size = qrInputDimension * penWidth;
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
</script>

<div class="generator">
  <div class="header">
    <div class="input">
      <Input type="file" accept="image/*" on:change={handleFileUpload} bind:this={fileInput}/>
      {#if imagePreview}
        <h3>Input Frame:</h3>
        <img src={imagePreview} alt="Uploaded QR Code" width={svgOutputSize} height={svgOutputSize}>
      {/if}
      <!--      <input type="file" accept="image/*" on:change={handleFileUpload} bind:this={fileInput}>-->
      <!--      {#if imagePreview}-->
      <!--        <h3>Input Frame:</h3>-->
      <!--        <img src={imagePreview} alt="Uploaded QR Code" width={svgOutputSize} height={svgOutputSize}>-->
      <!--      {/if}-->
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
        <svg width={svgOutputSize} height={svgOutputSize} viewBox={`0 0 ${qrInputDimension} ${qrInputDimension}`}>
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

</div>

<style>
    .generator {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .html-output {
        padding-top: 2.5rem;
    }

    .header {
        display: flex;
        gap: 1rem;
    }


    table {
        border-collapse: collapse;
    }

    td {
        width: 5px;
        height: 5px;
        padding: 0;
    }

    .black {
        background-color: black;
    }

    .white {
        background-color: white;
    }
</style>