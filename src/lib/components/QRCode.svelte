<script lang="ts">

  import paper from "paper";
  import {onMount} from "svelte";
  import {qrConfigStore, qrOutputStore} from "$lib/qrStore";
  import type {QrConfig} from "$lib/qr";

  let canvas: HTMLCanvasElement;
  let project: paper.Project;
  let zoom = 1;

  let config: QrConfig | null = null;
  qrConfigStore.subscribe(
    (currentConfig) => {
      if (!project || !currentConfig || !currentConfig.value) return;
      config = currentConfig;

      console.debug('current qr config', currentConfig);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      import("qrcode-svg").then(({default: QRCode}) => {
        /************************************************************************
         QR CODE GENERATION & PREPARATION
         ************************************************************************/
          // Create a new QRCode
        const qr = new QRCode({
            content: currentConfig.value,
            padding: 0,
            width: 64,
            height: 64,
            color: '#000000',
            background: '#ffffff',
            ecl: currentConfig.ecl,
            join: false,
            predefined: false
          });

        // Generate the SVG string and import to paper
        const svg = qr.svg();
        console.debug('qr svg:', svg);
        project.clear();
        project.view.play();
        qrOutputStore.update(store => ({
          ...store,
          totalPathLength: 0,
          remark: 'rendering'
        }));

        setTimeout(() => {
          project.importSVG(svg);
          project.view.play();
          console.debug('project refresh requested');
        }, 0);
      });
    }
  );

  const PAPERJS_MM_TO_PT = 3.775;
  const HOR_COLOR = 'orange';
  const VERT_COLOR = 'green';

  function hasBlockAt(blocks: paper.Path.Rectangle[], point: paper.PointLike): boolean {
    return blocks.some((block) => block.contains(point));
  }

  onMount(() => {
    paper.setup(canvas);
    project = paper.project;

    project.view.onFrame = (event: { time: number; delta: number; count: number }) => {
      if (!config || !config.value || config.penMmSize <= 0 || config.mmSize <= 0) {
        qrOutputStore.update(() => ({
          svg: '',
          totalPathLength: 0,
          remark: 'Invalid configuration'
        }));
        return;
      }
      let warning = '';
      console.debug('::onFrame::', 'time', event.time, 'delta', event.delta, 'count', event.count, 'config', config);
      if (zoom !== 1) {
        project.view.scale(1 / zoom);
        zoom = 1;
      }
      const items = project.activeLayer.getItems({});
      const width = config.mmSize * PAPERJS_MM_TO_PT;
      const height = config.mmSize * PAPERJS_MM_TO_PT;

      if (items.length > 0) {
        project.clear();
        console.debug('qr items loaded:', items.length);

        // Target size rectangle
        const targetRect = new paper.Path.Rectangle({
          from: [0, 0],
          to: [width, height],
          strokeColor: 'black',
          strokeWidth: 5
        });

        // Make rectangle objects for the items and group on size
        const rectangleMap = new Map<number, paper.Path.Rectangle[]>();
        for (const item of items) {
          const rectangle = new paper.Path.Rectangle({
            from: item.bounds.topLeft,
            to: item.bounds.bottomRight,
            strokeWidth: 1,
            strokeColor: 'orange'
          });
          const width = parseFloat(rectangle.bounds.width.toFixed(8));
          if (rectangleMap.has(width)) {
            rectangleMap.get(width)?.push(rectangle);
          } else {
            rectangleMap.set(width, [rectangle]);
          }
        }

        if (rectangleMap.size !== 2) {
          console.warn('unexpected number of sizes', rectangleMap.size);
        }

        // Remove the large blocks and do some analysis
        const qrFullSize = Math.max(...Array.from(rectangleMap.keys()));
        const qrBlockSize = Math.min(...Array.from(rectangleMap.keys()));
        const qrBlockDimensions = Math.floor(qrFullSize / qrBlockSize) + 1;
        const bigBlocks = rectangleMap.get(qrFullSize) || [];
        const qrBlocks = rectangleMap.get(qrBlockSize) || [];
        rectangleMap.clear();
        for (const rectangle of bigBlocks) {
          rectangle.remove();
        }
        for (const rectangle of qrBlocks) {
          rectangle.remove();
        }
        console.debug(
          'qrFullSize',
          qrFullSize,
          'qrBlockSize',
          qrBlockSize,
          'qrBlockCount',
          qrBlocks.length,
          'qrBlockDimensions',
          qrBlockDimensions
        );

        /************************************************************************
         GROUPING BLOCKS HORIZONTALLY & VERTICALLY
         ************************************************************************/

        const targetBlockSize = width / qrBlockDimensions;
        // In the first pass we group horizontally
        let startX = -1;
        let endX = -1;
        const horizontalRectangles: paper.Path.Rectangle[] = [];
        const singleRectangles: paper.Path.Rectangle[] = [];
        for (let y = 0; y < qrBlockDimensions; y++) {
          for (let x = 0; x < qrBlockDimensions; x++) {
            const point = new paper.Point(
              x * qrBlockSize + qrBlockSize / 2,
              y * qrBlockSize + qrBlockSize / 2
            );
            if (hasBlockAt(qrBlocks, point)) {
              if (startX < 0) startX = x;
              endX = x;
            } else {
              if (startX >= 0 && endX >= 0) {
                const r = new paper.Path.Rectangle({
                  from: [startX * targetBlockSize, y * targetBlockSize],
                  to: [(endX + 1) * targetBlockSize, (y + 1) * targetBlockSize],
                  fillColor: HOR_COLOR,
                  opacity: 0.5
                });
                if (startX == endX) {
                  singleRectangles.push(r);
                } else {
                  horizontalRectangles.push(r);
                }
                startX = -1;
                endX = -1;
              }
            }
          }

          if (startX >= 0 && endX >= 0) {
            const r = new paper.Path.Rectangle({
              from: [startX * targetBlockSize, y * targetBlockSize],
              to: [(endX + 1) * targetBlockSize, (y + 1) * targetBlockSize],
              fillColor: HOR_COLOR,
              opacity: 0.5
            });
            if (startX == endX) {
              singleRectangles.push(r);
            } else {
              horizontalRectangles.push(r);
            }
            startX = -1;
            endX = -1;
          }
        }
        console.debug(
          'horizontalRectangles',
          horizontalRectangles.length,
          'singleRectangles',
          singleRectangles.length
        );

        let startY = -1;
        let endY = -1;
        const verticalRectangles: paper.Path.Rectangle[] = [];
        for (let x = 0; x < qrBlockDimensions; x++) {
          for (let y = 0; y < qrBlockDimensions; y++) {
            let hasBlock = false;
            if (config.overlap) {
              const point = new paper.Point(
                x * qrBlockSize + qrBlockSize / 2,
                y * qrBlockSize + qrBlockSize / 2
              );
              hasBlock = hasBlockAt(qrBlocks, point);
            } else {
              const point = new paper.Point(
                x * targetBlockSize + targetBlockSize / 2,
                y * targetBlockSize + targetBlockSize / 2
              );
              hasBlock = hasBlockAt(singleRectangles, point);
            }
            if (hasBlock) {
              if (startY < 0) startY = y;
              endY = y;
            } else {
              if (startY >= 0 && endY >= 0) {
                if (
                  startY !== endY ||
                  !hasBlockAt(horizontalRectangles, [
                    x * targetBlockSize + targetBlockSize / 2,
                    startY * targetBlockSize + targetBlockSize / 2
                  ])
                ) {
                  const r = new paper.Path.Rectangle({
                    from: [x * targetBlockSize, startY * targetBlockSize],
                    to: [(x + 1) * targetBlockSize, (endY + 1) * targetBlockSize],
                    fillColor: VERT_COLOR,
                    opacity: 0.5
                  });
                  verticalRectangles.push(r);
                }
                startY = -1;
                endY = -1;
              }
            }
          }
          if (startY >= 0 && endY >= 0) {
            if (
              startY !== endY ||
              !hasBlockAt(horizontalRectangles, [
                x * targetBlockSize + targetBlockSize / 2,
                startY * targetBlockSize + targetBlockSize / 2
              ])
            ) {
              const r = new paper.Path.Rectangle({
                from: [x * targetBlockSize, startY * targetBlockSize],
                to: [(x + 1) * targetBlockSize, (endY + 1) * targetBlockSize],
                fillColor: VERT_COLOR,
                opacity: 0.5
              });
              verticalRectangles.push(r);
            }
            startY = -1;
            endY = -1;
          }
        }
        console.debug('verticalRectangles', verticalRectangles.length);
        singleRectangles.forEach((r) => r.remove());
        singleRectangles.length = 0;
        targetRect.remove();

        /************************************************************************
         DRAWING THE ACTUAL PLOTTABLE LINES
         ************************************************************************/

        let penWidth = config.penMmSize * PAPERJS_MM_TO_PT;
        if (penWidth > targetBlockSize) {
          const penMMDisplay = config.penMmSize;
          const targetMMDisplay = (targetBlockSize / PAPERJS_MM_TO_PT).toFixed(2);
          if ((penMMDisplay - (targetBlockSize / PAPERJS_MM_TO_PT)) > 0.05) {
            warning = 'Your pen is too big (' + penMMDisplay + ' mm > ' + targetMMDisplay + ' mm). The physical plot might look different.';
            console.warn(warning);
          }
          penWidth = targetBlockSize;
        }
        const lines = Math.ceil(targetBlockSize / penWidth);
        let totalLineLength = 0;
        let lineHeight = targetBlockSize / lines;
        if (lineHeight < 0) {
          lineHeight = targetBlockSize;
        }
        console.debug(
          'lines',
          lines,
          'lineHeight',
          lineHeight,
          'targetBlockSize',
          targetBlockSize,
          'penWidth',
          penWidth
        );
        const strokeCap = config.penTip === 'Round' ? 'round' : 'square';
        for (const rectangle of horizontalRectangles) {
          const yStart = rectangle.bounds.y + penWidth / 2;
          for (let l = 0; l < lines - 1; l++) {
            const y = yStart + l * lineHeight;
            const lh = new paper.Path.Line({
              from: [rectangle.bounds.x + penWidth / 2, y],
              to: [rectangle.bounds.x + rectangle.bounds.width - penWidth / 2, y],
              strokeColor: 'black',
              strokeWidth: penWidth,
              opacity: config?.transparent ? 0.5 : 1,
              strokeCap: strokeCap
            });
            totalLineLength += lh.length;
          }
          // last line, start from bottom
          const y = rectangle.bounds.y + rectangle.bounds.height - penWidth / 2;
          const lh = new paper.Path.Line({
            from: [rectangle.bounds.x + penWidth / 2, y],
            to: [rectangle.bounds.x + rectangle.bounds.width - penWidth / 2, y],
            strokeColor: 'black',
            strokeWidth: penWidth,
            opacity: config?.transparent ? 0.5 : 1,
            strokeCap: strokeCap
          });
          totalLineLength += lh.length;
          if (lines > 1) {
            // add vertical lines at the ends
            const vle = new paper.Path.Line({
              from: [rectangle.bounds.x + penWidth / 2, rectangle.bounds.y + penWidth / 2],
              to: [
                rectangle.bounds.x + penWidth / 2,
                rectangle.bounds.y + rectangle.bounds.height - penWidth / 2
              ],
              strokeColor: 'black',
              strokeWidth: penWidth,
              opacity: config?.transparent ? 0.5 : 1,
              strokeCap: strokeCap
            });
            totalLineLength += vle.length;
            const vleb = new paper.Path.Line({
              from: [
                rectangle.bounds.x + rectangle.bounds.width - penWidth / 2,
                rectangle.bounds.y + penWidth / 2
              ],
              to: [
                rectangle.bounds.x + rectangle.bounds.width - penWidth / 2,
                rectangle.bounds.y + rectangle.bounds.height - penWidth / 2
              ],
              strokeColor: 'black',
              strokeWidth: penWidth,
              opacity: config?.transparent ? 0.5 : 1,
              strokeCap: strokeCap
            });
            totalLineLength += vleb.length;
          }
          rectangle.remove();
        }

        for (const rectangle of verticalRectangles) {
          for (let l = 0; l < lines - 1; l++) {
            const x = rectangle.bounds.left + l * lineHeight + penWidth / 2;
            const lv = new paper.Path.Line({
              from: [x, rectangle.bounds.y + penWidth / 2],
              to: [x, rectangle.bounds.y + rectangle.bounds.height - penWidth / 2],
              strokeColor: 'black',
              strokeWidth: penWidth,
              opacity: config?.transparent ? 0.5 : 1,
              strokeCap: strokeCap
            });
            totalLineLength += lv.length;
          }
          // last line, start from right
          const x = rectangle.bounds.left + rectangle.bounds.width - penWidth / 2;
          const lv = new paper.Path.Line({
            from: [x, rectangle.bounds.y + penWidth / 2],
            to: [x, rectangle.bounds.y + rectangle.bounds.height - penWidth / 2],
            strokeColor: 'black',
            strokeWidth: penWidth,
            opacity: config?.transparent ? 0.5 : 1,
            strokeCap: strokeCap
          });
          totalLineLength += lv.length;
          if (lines > 1) {
            // add horizontal lines at the ends
            const lhe = new paper.Path.Line({
              from: [rectangle.bounds.x + penWidth / 2, rectangle.bounds.y + penWidth / 2],
              to: [
                rectangle.bounds.x + rectangle.bounds.width - penWidth / 2,
                rectangle.bounds.y + penWidth / 2
              ],
              strokeColor: 'black',
              strokeWidth: penWidth,
              opacity: 0.5,
              strokeCap: strokeCap
            });
            totalLineLength += lhe.length;
            const lheb = new paper.Path.Line({
              from: [
                rectangle.bounds.x + penWidth / 2,
                rectangle.bounds.y + rectangle.bounds.height - penWidth / 2
              ],
              to: [
                rectangle.bounds.x + rectangle.bounds.width - penWidth / 2,
                rectangle.bounds.y + rectangle.bounds.height - penWidth / 2
              ],
              strokeColor: 'black',
              strokeWidth: penWidth,
              opacity: config?.transparent ? 0.5 : 1,
              strokeCap: strokeCap
            });
            totalLineLength += lheb.length;
          }
          rectangle.remove();
        }

        project.activeLayer.position = project.view.center;
        // // Get the bounds of the largest project layer
        const projectSize = Math.max(project.activeLayer.bounds.width, project.activeLayer.bounds.height);
        const viewSize = Math.min(project.view.bounds.width, project.view.bounds.height) * 0.9;
        let exportedSvg = project.exportSVG({asString: true});
        zoom = viewSize / projectSize;
        project.view.scale(zoom);
        qrOutputStore.update(store => ({
          ...store,
          svg: exportedSvg,
          totalPathLength: totalLineLength / PAPERJS_MM_TO_PT,
          remark: warning
        }));
      }
      project.view.pause();
    };
  });
</script>

<canvas id="qr-canvas" bind:this={canvas} data-paper-hidpi="off"></canvas>

<style>
    #qr-canvas {
        display: block;
        width: 100%;
        max-width: 50rem;
        aspect-ratio: 1;
        background-color: white;
        border-radius: .5rem;
    }

    @media (max-width: 850px) {
        #qr-canvas {
            width: 100%;
        }
    }
</style>