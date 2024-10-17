# QR Code Generator for Pen Plotters

![qr.d17e.dev.screenshot.png](https://github.com/dxviie/QR/blob/main/static/qr.d17e.dev.screenshot.png?raw=true)

This project attempts to solve 1 problem and 1 problem only: generating QR codes that can be efficiently plotted by pen plotters. Or
anything that takes an SVG for that matter.

## Main Dependencies

- Svelte+SvelteKit as the backbone
- Shadcn-ui for UI components
- qrcode-svg npm package for generating the QR codes
- And a big shout-out to [Stanko, from whom I _borrowed_ the mobile UX](https://github.com/Stanko/pulsar)

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm run dev
```

To start the server and open the app in a new browser tab:

```bash
npm run dev -- --open
```

### Building

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Deployment

To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## License

This project is licensed under the MIT License.

```
