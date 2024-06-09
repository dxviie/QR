<script lang="ts">

  import {qrOutputStore} from "$lib/components/qrStore";

  let qrOutput = {
    svg: '',
    remark: '',
    totalPathLength: 0
  }

  qrOutputStore.subscribe(value => {
    qrOutput = value;
  });
</script>

<div>
  <div class="flex flex-col gap-2">
    <div>
      <label for="remark">Remark</label>
      <textarea id="remark" rows="10" cols="50" readonly>{qrOutput.remark}</textarea>
    </div>
    <div>
      <label for="totalPathLength">Total Path Length</label>
      <input type="text" id="totalPathLength" value={qrOutput.totalPathLength} readonly>
    </div>
  </div>
</div>