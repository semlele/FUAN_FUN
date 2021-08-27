<script>
    import NoteList from "./components/NoteList.svelte";
    import {loadNotes} from "./lib/storage";

    const userNotes = loadNotes();
</script>

<div class="fuanlist" id="fuan">
    <h1 class="list_title">Everyone's FUAN</h1>
    <NoteList notes={userNotes}></NoteList>
</div>

<style>
    .fuanlist{
        margin: 80px 0 70px 0;
        font-size: 1em;
    }

    .list_title {
		margin: 30px 0;
	}

</style>
