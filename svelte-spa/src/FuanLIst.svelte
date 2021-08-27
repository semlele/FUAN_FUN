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
        font-size: 1.2em;
    }

    .list_title{
        font-size: 300%;
		margin-top: 150px;
        padding-bottom: 50px;
        text-align: center;
        border-bottom: 3px dashed #000;
	}
</style>
