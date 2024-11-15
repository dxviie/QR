<script lang="ts">
  export let data;
  $: post = data;
</script>

<div class="bc-page">
  <h1 class="title page-title">{post.title}</h1>
  <p>
    <b>Hi there! :)</b><br/><br/>
    I'm <b>David Vandenbogaerde</b>, or <i><a href="https://www.d17e.dev" target="_blank">d17e</a></i> for short. A software engineer and
    budding
    artist residing in Amsterdam.<br/><br/>
    <b>Thank you</b> for scanning <i>my</i> card!<br/>
    Well, that's to say... It's <i>your</i> card now.<br/><br/>
    What would you say if I told you it is <b>one of a kind?</b><br/><br/>
    Because <i>it is</i>.<br/>
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
    Well, this is the kind of stuff I 🧡 doing and I thought this is a great way of showcasing what I <i>can</i> do.
    Which is, coming up with ideas and then making them happen. Start to finish.<br/>
    Turning <b>ideas</b> into <b>art</b> through <b>code</b>.<br/>
    And then back again.<br/><br/>
    I hope you like it! <br/><br/>
    And if you do, <a
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
        width: 100vw;
        gap: 1rem;
    }

    p {
        width: 90vw;
        max-width: 40rem;
    }

    img {
        transform: scaleX(-1);
        width: 90vw;
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