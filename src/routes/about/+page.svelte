<script lang="ts">
  import {Button} from "$lib/components/ui/button";
</script>

<div class="content">

  <p class="intro">
    <b>Hi there!</b><br/>
    I'm David Vandenbogaerde, or <i><a href="https://www.d17e.dev" target="_blank">d17e</a></i> for short.<br/><br/>
    Not so long ago I wanted to plot QR codes on my <a href="https://www.axidraw.com">Axidraw</a>, only to realise it wasn't exactly
    straight forward. In fact, this is what the first attempt using available libraries and tools looked like:
  </p>
  <img src="first_attempt_plotting_qr.jpg" alt="First attempt at plotting QR code on Axidraw"/>
  <p class="intro">
    Looks cute, but not really a success...<br/><br/>
    That's when I thought I could solve this problem once and for all. For everybody. Forever.<br/><br/>
    And this is my attempt.<br/><br/>
    The <a href="https://github.com/dxviie/QR" target="_blank">code is on my github</a> code is on my github, but beware. It is far from my
    best work.
    In case you have some ideas, feedback or just want to say hi, please do <a href="https://forms.d17e.dev/contact" target="_blank">get
    in touch</a> and let's have a chat!
  </p>
  <Button class="mt-16 mb-16">
    <a href="/create">Generate QR</a>
  </Button>
</div>

<style>
    .content {
        padding-top: 2rem;
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

    .intro {
        width: 90vw;
        max-width: 40rem;
    }
</style>