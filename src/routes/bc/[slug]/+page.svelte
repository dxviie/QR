<script lang="ts">
  export let data;
  $: post = data;
</script>

<div class="bc-page">
  <h1 class="title page-title">{post.title}</h1>
  
  <section class="intro-section">
    <h2 class="subtitle">Hi there! :)</h2>
    <p class="body-text">
      I'm <strong>David Vandenbogaerde</strong>, or <em><a href="https://www.d17e.dev" target="_blank">d17e</a></em> for short. A software engineer and
      budding artist residing in Amsterdam.
    </p>
    <p class="body-text">
      <strong>Thank you</strong> for scanning <em>my</em> card!<br/>
      Well, that's to say... It's <em>your</em> card now.
    </p>
    <p class="body-text">
      What would you say if I told you it is <strong>one of a kind?</strong>
    </p>
    <p class="body-text highlight">
      Because <em>it is</em>.<br/>
      And I bet it looks just like this:
    </p>
  </section>

  <div class="image-container">
    <img src={`https://directus.d17e.dev/assets/${post.blankOutImage}?format=jpg&quality=70`}
         alt={`Image of the actual card for slug ${post.slug}`}>
  </div>

  <section class="content-section">
    <h2 class="subtitle">But wait, there's more!</h2>
    <p class="body-text">
      This is what the full artwork looks like with an outline of where the card was cut out:
    </p>
  </section>

  <div class="image-container">
    <img src={`https://directus.d17e.dev/assets/${post.outlineImage}`}
         alt={`Image of the full artwork titled ${post.title} with an outline of where the card was cut out.`}>
  </div>

  <section class="content-section">
    <h2 class="subtitle">Why did I make these?</h2>
    <p class="body-text">
      Well, this is the kind of stuff I 🧡 doing and I thought this is a great way of showcasing what I <em>can</em> do.
      Which is, coming up with ideas and then making them happen. Start to finish.
    </p>
    <p class="body-text highlight">
      Turning <strong>ideas</strong> into <strong>art</strong> through <strong>code</strong>.<br/>
      And then back again.
    </p>
    <p class="body-text">
      I hope you like it!
    </p>
  </section>

  <section class="cta-section">
    <h2 class="subtitle">Let's connect!</h2>
    <p class="body-text">
      Interested in working together or just want to chat?
      <br/>
      I'd love to hear from you!
    </p>
    <div class="cta-buttons">
      <a href="https://www.d17e.dev" target="_blank" class="cta-button primary">
        Visit my website
      </a>
      <a href="https://forms.d17e.dev/contact" target="_blank" class="cta-button secondary">
        Send me a message
      </a>
    </div>
  </section>

</div>


<style>
    @font-face {
        font-family: 'Nudica Mono';
        src: url('/fonts/nudicamono-bold-webfont.woff') format('woff');
        font-weight: bold;
        font-style: normal;
        font-display: swap;
    }

    @font-face {
        font-family: 'Nudica Mono';
        src: url('/fonts/nudicamono-light-webfont.woff') format('woff');
        font-weight: 300;
        font-style: normal;
        font-display: swap;
    }

    @font-face {
        font-family: 'Argesta Text';
        src: url('/fonts/argestatext-regular-webfont.woff') format('woff');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
    }

    .bc-page {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        width: 100%;
        max-width: 50rem;
        margin: 0 auto;
        padding: 2rem 1rem;
        gap: 2.5rem;
    }

    .title {
        font-family: 'Nudica Mono', monospace;
        font-weight: bold;
        padding: 0.5rem 1rem;
        background-color: hsl(var(--primary));
        color: hsl(var(--primary-foreground));
        font-size: clamp(1.75rem, 4vw, 2.5rem);
        letter-spacing: -0.02em;
        margin: 0;
    }

    .page-title {
        margin-bottom: 1rem;
    }

    .subtitle {
        font-family: 'Nudica Mono', monospace;
        font-weight: 300;
        font-size: clamp(1.25rem, 3vw, 1.75rem);
        letter-spacing: -0.01em;
        margin: 0 0 1rem 0;
        color: hsl(var(--foreground));
    }

    .body-text {
        font-family: 'Argesta Text', serif;
        font-size: clamp(1rem, 2vw, 1.125rem);
        line-height: 1.7;
        width: 100%;
        max-width: 40rem;
        margin: 0 0 1.25rem 0;
        color: hsl(var(--foreground));
    }

    .body-text:last-child {
        margin-bottom: 0;
    }

    .body-text strong {
        font-weight: 600;
        color: hsl(var(--foreground));
    }

    .body-text em {
        font-style: italic;
    }

    .body-text a {
        color: hsl(var(--foreground));
        border-bottom: 1px dashed hsl(var(--foreground));
        text-decoration: none;
        transition: border-color 0.2s ease;
    }

    .body-text a:hover {
        border-color: darkorange;
        color: darkorange;
    }

    .highlight {
        font-size: clamp(1.125rem, 2.5vw, 1.25rem);
        font-weight: 500;
        padding: 1rem;
        background-color: hsl(var(--muted));
        border-left: 3px solid darkorange;
        border-radius: 4px;
    }

    .intro-section,
    .content-section {
        width: 100%;
        max-width: 40rem;
    }

    .image-container {
        width: 100%;
        max-width: 40rem;
        margin: 1rem 0;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .image-container img {
        transform: scaleX(-1);
        width: 100%;
        height: auto;
        display: block;
    }

    .cta-section {
        width: 100%;
        max-width: 40rem;
        margin-top: 2rem;
        padding: 2rem;
        background: linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--background)) 100%);
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    .cta-section .subtitle {
        margin-bottom: 0.75rem;
    }

    .cta-section .body-text {
        margin-bottom: 1.5rem;
    }

    .cta-buttons {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
    }

    @media (min-width: 640px) {
        .cta-buttons {
            flex-direction: row;
            justify-content: center;
        }
    }

    .cta-button {
        font-family: 'Nudica Mono', monospace;
        font-weight: 300;
        font-size: 1rem;
        padding: 0.875rem 2rem;
        border-radius: 6px;
        text-decoration: none;
        transition: all 0.2s ease;
        border: 2px solid transparent;
        display: inline-block;
        min-width: 200px;
        text-align: center;
        letter-spacing: -0.01em;
    }

    .cta-button.primary {
        background-color: hsl(var(--primary));
        color: hsl(var(--primary-foreground));
        border-color: hsl(var(--primary));
    }

    .cta-button.primary:hover {
        background-color: darkorange;
        border-color: darkorange;
        color: hsl(var(--primary-foreground));
        transform: translateY(-2px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .cta-button.secondary {
        background-color: transparent;
        color: hsl(var(--foreground));
        border-color: hsl(var(--foreground));
    }

    .cta-button.secondary:hover {
        background-color: hsl(var(--primary));
        color: hsl(var(--primary-foreground));
        transform: translateY(-2px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
</style>