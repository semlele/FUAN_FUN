<script>
    export let notes;
</script>

<div class="note">
    {#each notes as note}
        <div class="card">
            <div class="card-title"><span style="color:green;">Name:</span> &nbsp&nbsp&nbsp;{note.title}</div>
            <div class="card-job"><span style="color:green;">Carrer:</span> &nbsp&nbsp&nbsp;{note.jobName}</div>
            <div class="card-contentFuan"><span style="color:green;">Fuan:</span> &nbsp&nbsp&nbsp;{note.contentFuan}</div>
            <div class="card-contentWO"><span style="color:green;">Working on:</span> &nbsp&nbsp&nbsp;{note.contentWO}</div>
        </div>
    {/each}
</div>

<style>
    .note {
        margin-top: 80px;
        color: rgb(black);
    }

    .card{
        display: table;
        background-color: rgb(255, 254, 253);
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
        padding: 1em;
        margin: 3em auto;
        border-radius: 30px;
        cursor: pointer;
    }

    .card:not(:last-of-type) {
    margin-bottom: 1em;
    }

    .card-title {
    font-size: 1.5em;
    font-weight: bold;
    margin-bottom: 0.5em;
    }

    .card-job {
    font-size: 1.5em;
    font-weight: bold;
    margin-bottom: 0.5em;
    }

    .card-contentFuan {
    white-space: pre-wrap;
    line-height: 1.5;
    font-weight: bold;
    margin-bottom: 0.5em;
    }

    .card-contentWO {
    white-space: pre-wrap;
    line-height: 1.5;
    font-weight: bold;
    margin-bottom: 0.5em;
    }
</style>