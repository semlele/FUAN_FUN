<script>
    import {push} from "svelte-spa-router";
    import NoteList from "./components/NoteList.svelte";
    import {loadNotes} from "./lib/storage";

    const userNotes = loadNotes();
</script>

<div class="fuanlist">
    <h1 class="list_title">Everyone's FUAN</h1>
    <NoteList notes={userNotes}></NoteList>
</div>

<style>
    .fuanlist{
        margin: 70px 0;
    }

    .list_title {
		margin-bottom: 1em;
	}

</style>
