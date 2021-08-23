<script>
    import {push} from "svelte-spa-router";

</script>


<body>
	<h1 class="app-title">App:titile</h1>
	<button class="getStart" on:click={() => push('/add')}>get started!</button>
	<div class="aboutThisSite">
		about this site
	</div>
</body>

<footer>
	footer
</footer>

<style>
	.app-title{
		color: aliceblue;
		height: 100%;
		background-image: url(forest.jpeg);
		background-size: cover;
	}

	.getStart {
		position: fixed;
		top:2;
		display: block;
		background-color: forestgreen;
		border: none;
		box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
		color: white;
		font-size: 1.5em;
		width: 30%;
		padding: 0.5em 0;
		margin: 15em 25em;
		cursor: pointer;
    }

	.aboutThisSite{
		padding: 1px 0;
	}

	footer{
		padding: 100px 0 0 0;
	}
</style>
