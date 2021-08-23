<script lang="ts">
	import Router from "svelte-spa-router";
    import {push} from "svelte-spa-router";
	import Home from "./Home.svelte";
	import Add from "./Add.svelte";
	import Edit from "./Edit.svelte";
    import FuanList from "./FuanList.svelte";

	const routes = {
		"/": Home,
		"/add": Add,
		"/edit/:id": Edit,
		"/fuanlist": FuanList
	};
</script>

<header>
	<div class="header_container">
		<div class="appTitle">
			<button class="moveHome" on:click={() => push('/')}>FUAN⇨FUN</button>
		</div>
		<div class="header_links">
			<button class="moveAbout" on:click={() => push('/')}>ABOUT THIS SITE</button>
			<button class="moveContact" on:click={() => push('/')}>CONTACT</button>
			<button class="moveFuan" on:click={() => push('/fuanlist')}>CHECK FUAN!</button>	
		</div>
	</div>
</header>

<main>
	<Router routes={routes}></Router>
</main>

<style>
	.header_container{
		position: fixed;
		width: 100%;
		height: 60px;
		padding: 0 20px;
		background-color: rgba(0, 0, 0, 0.8);
	}

	.header_links{
		position: absolute;
		right: 100px;
		bottom: 20px;
		float: right;
	}

	.moveHome{
		background-color: forestgreen;
		padding: 10px 10px;
		margin: 12px 10px;
	}

	main {
		background-color: rgb(255, 251, 246);
		width: 100%;
		height: 100%;
		overflow-y: auto;
	}
</style>