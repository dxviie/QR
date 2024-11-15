<script lang="ts">
  import {marked} from "marked";

  export let data;

  $: post = data;

  $: htmlContent = marked(data.content);

  $: {
    if (post) {
      console.debug('bc slug page post:: ', post)
    }

  }
</script>

<h1>{post.title}</h1>

<img src={`https://directus.d17e.dev/assets/${post.blankOutImage}`}>
<img src={`https://directus.d17e.dev/assets/${post.outlineImage}`}>

<style>
    img {
        transform: scaleX(-1);
    }
</style>