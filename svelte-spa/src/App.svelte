<script lang="ts">
	import Router from "svelte-spa-router";
	import Home from "./Home.svelte";
	import Add from "./Add.svelte";
    import FuanList from "./FuanList.svelte";

	const routes = {
		"/": Home,
		"/add": Add,
		"/fuanlist": FuanList
	};
</script>

<header>
	<div class="header_container">
		<div class="appTitle">
			<a href="#top"><img src="title.png" alt=""  class="moveHome"></a>
		</div>
		<div class="header_links">
			<a href="#about"><img src="about.png" alt=""  class="moveAbout"></a>
			<a href="#/fuanlist"><img src="fuanlist.png" alt=""  class="moveFuan"></a>
		</div>
	</div>
</header>

<main>
	<Router routes={routes}></Router>
</main>

<style>
	.header_container{
		z-index: 1;
		position: fixed;
		width: 100%;
		height: 80px;
		padding: 0 20px;
		background-color: rgba(0, 0, 0, 0.8);
	}

	
	.appTitle{
		position: absolute;
		left: 20px;
		top: 8px;
	}

	.header_links{
		position: absolute;
		right: 100px;
		bottom: 30px;
		float: right;
	}

	.moveHome{
		color: white;
		height: 50px;
		background-color: none;
		outline: none;
		padding: 10px 10px;
		margin: 10px 10px;
		cursor: pointer;
	}

	.moveAbout{
		color: white;
		height: 40px;
		background-color: none;
		outline: none;
		padding: 10px 10px;
		margin: 0px 10px -10px 10px;
		cursor: pointer;
	}

	.moveFuan{
		color: white;
		height: 40px;
		background-color: none;
		outline: none;
		padding: 10px 10px;
		margin: 0px 10px -10px 10px;
		cursor: pointer;
	}

	main {
		background-color: rgb(230, 230, 180);
		width: 100%;
		height: 100%;
		overflow-y: auto;
	}
</style>