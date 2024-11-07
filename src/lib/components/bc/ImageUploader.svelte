<script lang="ts">
  import {createEventDispatcher} from 'svelte';

  const dispatch = createEventDispatcher();

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        dispatch('imageSelected', {
          dataUrl: e.target?.result
        });
      };

      reader.readAsDataURL(file);
    }
  }
</script>

<div class="uploader">
  <input
          type="file"
          accept="image/*"
          on:change={handleFileSelect}
          class="file-input"
  />
</div>

<style>
    .uploader {
        margin: 20px;
        padding: 20px;
        border: 2px dashed #ccc;
        border-radius: 4px;
        text-align: center;
    }

    .file-input {
        display: block;
        margin: 0 auto;
    }
</style>