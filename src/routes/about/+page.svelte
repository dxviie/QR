<script lang="ts">
  import {Button} from "$lib/components/ui/button";
</script>

<div class="content">
  <p class="intro">
    <b>Hi! :)</b><br/><br/>
    I'm David Vandenbogaerde, or <i><a href="https://www.d17e.dev" target="_blank">d17e</a></i> for short. A software engineer and budding
    artist residing in Amsterdam.<br/><br/>
    Not so long ago I wanted to plot QR codes on my <a href="https://www.axidraw.com">Axidraw</a>, only to realise it wasn't exactly
    straight forward. In fact, this is what my first attempt looked like:
  </p>
  <img src="first_attempt_plotting_qr.jpg" alt="First attempt at plotting QR code on Axidraw"/>
  <p class="intro">
    Looks cute, but not really a success...<br/><br/>
    That's when I thought I could solve this problem once and for all.<br/>For everybody.<br/>Forever.<br/><br/>
    This is what that looks like:<br/>
  </p>
  <img src="qr-detail-working-2024-10-17 191118.png" alt="Functional QR Code With Ruler For Scale"/>
  <p class="intro">
    And below it is in action at 1.38x the actual speed to fit into a 30 second clip. In real time this took ~39 seconds to plot.
    As you might be able to tell I pushed the speed settings on the Axidraw towards the maximum for this test. For reference, on my regular
    speed settings
    (relatively slow) the same code still only took about ~42 seconds.
  </p>
  <video controls muted>
    <source src="qr-plot-reel-square.mp4#t=0.1" type={"video/mp4"}/>
  </video>
  <p class="intro">
    The <a href="https://github.com/dxviie/QR" target="_blank">source code</a> for this <i>entire</i> project is on my github.<br/><br/>
    In case you have some ideas, feedback or just want to say hi, I'd love to hear from you! Please do <a
          href="https://forms.d17e.dev/contact" target="_blank">get
    in touch</a> and let's have a chat!
  </p>
  <Button on:click={() => window.location.href = '/'} class="mt-16 mb-6">
    Generate QR
  </Button>
  or
  <Button on:click={() => window.location.href = '/astley'} class="mt-6 mb-16">
    Convert Image to Plottable SVG
  </Button>
</div>

<style>
    .content {
        padding-top: 8rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100vw;
    }

    img {
        width: 90vw;
        max-width: 40rem;
        margin: 1rem 0;
    }

    video {
        width: 90vw;
        max-width: 40rem;
        margin: 1rem 0;
    }

    .intro {
        width: 90vw;
        max-width: 40rem;
    }
</style>