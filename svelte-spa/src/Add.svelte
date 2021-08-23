<script>
    import { push } from 'svelte-spa-router';
    import NoteEditor from './components/NoteEditor.svelte';
    import { addNote } from './lib/storage';

    let title = 'your name';
    let contentFuan = 'What is "FUAN" about looking for job?';
    let contentWO = 'What are you working on?';

    const onSave = () =>  {
    addNote({title, contentFuan, contentWO});
    push('/fuanlist');
    };
</script>

<div class="add">
    <NoteEditor bind:title={title} bind:contentFuan={contentFuan} bind:contentWO={contentWO}></NoteEditor>
    <div class="button-container">
        <button class="save" on:click={onSave} disabled={!title || !contentFuan || !contentWO}>FUAN を SHARE する</button>
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
    background-color: rgb(62, 68, 163);
    border: none;
    border-radius: 3px;
    color: white;
    font-size: 1em;
    padding: 0.5em 1em;
    cursor: pointer;
    }

    .save:disabled {
    opacity: 0.3;
    cursor: auto;
    }
</style>