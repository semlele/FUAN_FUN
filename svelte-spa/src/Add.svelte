<script>
    import { push } from 'svelte-spa-router';
    import NoteEditor from './components/NoteEditor.svelte';
    import { addNote } from './lib/storage';

    let title = '';
    let jobName = '';
    let contentFuan = '';
    let contentWO = '';

    const onSave = () =>  {
    addNote({title, jobName, contentFuan, contentWO});
    push('/fuanlist');
    };
</script>

<div class="add">
    <NoteEditor bind:title={title} bind:jobName={jobName} bind:contentFuan={contentFuan} bind:contentWO={contentWO}></NoteEditor>
    <div class="button-container">
        <button class="save" on:click={onSave} disabled={!title || !jobName || !contentFuan || !contentWO}>FUAN を SHARE する</button>
    </div>
</div>  

<style>
    .add {
    display: flex;
    padding: 100px;
    flex-direction: column;
    height: 100%;
    }

    .button-container {
    padding: 1em 0;
    text-align: right;
    }

    .save {
    background-color:forestgreen;
    border: none;
    border-radius: 30px;
    color: white;
    font-size: 1em;
    padding: 1em 3em;
    cursor: pointer;
    }

    .save:disabled {
    opacity: 0.3;
    cursor: auto;
    }
</style>