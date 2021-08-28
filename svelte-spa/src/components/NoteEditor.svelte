<script>
    export let title;
    export let jobName;
    export let contentFuan;
    export let contentWO;
</script>

<div class="editor">
    <input class="title" placeholder="What's your name?" bind:value={title}>
    <br>
    <input class="jobName" placeholder="What kind of career do you want to be?" bind:value={jobName}>
    <br>
    <textarea class="contentFuan" placeholder="What is your 「FUAN」 about looking for job?" bind:value={contentFuan}></textarea>
    <br>
    <textarea class="contentWO" placeholder="What are you working on?" bind:value={contentWO}></textarea>
</div>

<style>
    .editor {
    display: flex;
    margin: 5em 0 0 5em;
    flex-direction: column;
    height: 100%;
    }

    .title {
    display: block;
    background-color: transparent;
    border: none;
    border-left: 3px solid forestgreen;
    font-size: 40px;
    padding: 0.5rem 1rem;
    margin-bottom: 0.5em;
    width: 100%;
    }


    .jobName {
    display: block;
    background-color: transparent;
    border: none;
    border-left: 3px solid forestgreen;
    font-size: 40px;
    padding: 0.5rem 1rem;
    margin-bottom: 0.5em;
    width: 100%;
    }

    
    .contentFuan {
    flex: 1;
    display: block;
    background-color: transparent;
    border: none;
    border-left: 3px solid forestgreen;
    font-size: 30px;
    padding: 1rem 1rem;
    margin-bottom: 0.5em;
    width: 100%;
    resize: none;
    }

    .contentWO {
    flex: 1;
    display: block;
    background-color: transparent;
    border: none;
    border-left: 3px solid forestgreen;
    font-size: 30px;
    padding: 1rem 1rem;
    margin-bottom: 0.3em;
    width: 100%;
    resize: none;
    }
</style>