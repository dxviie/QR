<script lang="ts">
  export let data;
  $: post = data;
</script>

<div class="bc-page">
  <h1 class="title page-title">{post.title}</h1>
  <p>
    <b>Hi there! :)</b><br/><br/>
    Thank you for scanning my card!<br/>
    Well, that's to say. It's your card now.<br/><br/>
    What would you say if I told you it is one of a kind?<br/><br/>
    Because it is.<br/>
    And I bet it looks just like this:
  </p>

  <div>
    <img src={`https://directus.d17e.dev/assets/${post.blankOutImage}?format=jpg&quality=70`}
         alt={`Image of the actual card for slug ${post.slug}`}>
  </div>

  <p>
    <b>But wait, there's more!</b><br/><br/>
    This is what the full artwork looks like with an outline of where the card was cut out:
  </p>

  <div>
    <img src={`https://directus.d17e.dev/assets/${post.outlineImage}`}
         alt={`Image of the full artwork titled ${post.title} with an outline of where the card was cut out.`}>
  </div>

  <p>
    <b>Why did I make these?</b><br/><br/>
    Well, this is the kind of stuff I love doing and I believe it is a great way of showcasing what I can do.
    Which is coming up with an idea and then making it happen. Turning ideas into art with code. And back again.<br/><br/>
    I hope you like it! <br/>And if you do, <a
          href="https://forms.d17e.dev/contact" target="_blank">let me know</a> and let's have a chat!
  </p>

</div>


<style>
    .bc-page {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        gap: 1rem;
    }

    p {
        max-width: 40rem;
    }

    img {
        transform: scaleX(-1);
        max-width: 40rem;
        margin: 1rem 0;
    }

    .title {
        padding: 0 .7rem 0 0.6rem;
        background-color: hsl(var(--foreground));
        color: hsl(var(--background));
        font-size: xx-large;
        font-weight: bold;
    }

    .page-title {
        margin-top: 1rem;
        margin-bottom: 2rem;
    }
</style>