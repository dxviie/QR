# QR Code Generator for Pen Plotters

![qr.d17e.dev.screenshot.png](https://github.com/dxviie/QR/blob/main/static/qr.d17e.dev.screenshot.png?raw=true)

This project is a QR Code Generator designed specifically for pen plotters. It works, but the code is a bit of a mess. Enter at your own
risk. 🙃

## Features

- Generate QR codes
- Customize QR code configurations
- Responsive design for various screen sizes

## Main Dependencies

- Svelte+SvelteKit as the backbone
- Shadcn-ui for UI components
- PaperJs for drawing the QR code
- qrcode-svg npm package for generating the QR codes

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
