<script>
    export let title;
    export let jobName;
    export let contentFuan;
    export let contentWO;
</script>

<div class="editor">
    <input class="title" placeholder="What's your name?" bind:value={title}>
    <input class="jobName" placeholder="What kind of career do you want to be?" bind:value={jobName}>
    <textarea class="contentFuan" placeholder="What is your 「FUAN」 about looking for job?" bind:value={contentFuan}></textarea>
    <textarea class="contentWO" placeholder="What are you working on?" bind:value={contentWO}></textarea>
</div>

<style>
    .editor {
    display: flex;
    flex-direction: column;
    height: 100%;
    }

    .title {
    display: block;
    background-color: transparent;
    border: none;
    border-left: 2px solid forestgreen;
    font-size: 40px;
    padding: 0.5rem 1rem;
    margin-bottom: 0.3em;
    width: 100%;
    }


    .jobName {
    display: block;
    background-color: transparent;
    border: none;
    border-left: 2px solid forestgreen;
    font-size: 35px;
    padding: 0.5rem 1rem;
    margin-bottom: 0.3em;
    width: 100%;
    }

    
    .contentFuan {
    flex: 1;
    display: block;
    background-color: transparent;
    border: none;
    border-left: 2px solid forestgreen;
    font-size: 25px;
    padding: 1rem 1rem;
    margin-bottom: 0.3em;
    width: 100%;
    resize: none;
    }

    .contentWO {
    flex: 1;
    display: block;
    background-color: transparent;
    border: none;
    border-left: 2px solid forestgreen;
    font-size: 25px;
    padding: 1rem 1rem;
    margin-bottom: 0.3em;
    width: 100%;
    resize: none;
    }
</style>