<script>
    import {push} from "svelte-spa-router";

</script>


<body>
	<h1 class="app-title">App:titile</h1>
	<button class="getStart" on:click={() => push('/add')}>get started!</button>
	<div class="aboutThisSite">
		<h2>about this site</h2>
		<div>hoge</div>
		<div>paya</div>
	</div>
	<footer>
		footer
	</footer>	
</body>


<style>
	.app-title{
		font-size: 80px;
		padding: 100px 10px;
		color: aliceblue;
		height: 100%;
		background-image: url(forest.jpeg);
		background-size: cover;
	}

	.getStart {
		position: fixed;
		bottom: 20%;
		right: 10%;
		display: block;
		background-color: forestgreen;
		border: none;
		box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
		color: white;
		font-size: 1.5em;
		width: 30%;
		padding: 0.5em 0;
		cursor: pointer;
    }

	.aboutThisSite{
		padding: 10px 0;
		font-size: 50px;
	}

	footer{
		padding: 100px 0 30px 0;
	}
</style>
