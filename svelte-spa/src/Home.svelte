<script>
    import {push} from "svelte-spa-router";
	import Icon from '@iconify/svelte';
	import { fade } from 'svelte/transition';
</script>

<body>
	<h1 class="app-title" id="top"> 
		<div transition:fade="{{delay: 200}}">turn</div>
		<div transition:fade="{{delay: 500}}">
			FUAN
			<Icon icon="whh:minisad" />
		</div>
		<div transition:fade="{{delay: 800}}">into</div>
		<div transition:fade="{{delay: 1100}}">
			FUN
			<Icon icon="fontelico:emo-happy" />
		</div>
	</h1>
	<button class="getStart" on:click={() => push('/add')}>はじめましょう!</button>
	<div class="aboutThisSite" id="about">
		<br class="space">
		<h3>就活が不安なあなたへ...</h3>
		<h2>その"不安"を共有しませんか?</h2>
		<br>
		<div class="explain">本サイトは、不安を吐露し、その課題をどのように解決していくかを皆で共有し合うSNSです。</div>
		<div class="explain">不安を抱える事は悪い事ではありません。それだけ、慎重に将来の事を考えている証拠です。</div>
		<div class="explain">他の人の不安を見る事ができるので、参考になることがあるかもしれません。</div>
		<div class="explain">様々な不安の解決法を知ることで、不安が解消され楽しく就活ができるはずです!</div>
		<div class="pictures">
			<div class="worried"><img src="worried_pic.png" alt="" width="30%" height="30%"></div>
			<div class="think"><img src="think_pic.png" alt="" width="30%" height="30%"></div>
			<div class="find"><img src="find_pic.png" alt="" width="30%" height="30%"></div>
			<h2 class="lets">さあ! あなたも不安を共有して楽しい就活を!</h2>
		</div>
	</div>
	<footer>
		©︎ 2021 semlele
	</footer>	
</body>

<style>


	.app-title{
		font-size: 10em;
		padding: 100px 100px;
		color: aliceblue;
		height: 100%;
		background: linear-gradient(-45deg, rgba(255, 255, 50, 0.6), rgba(10, 255, 0, 0.6)),url(forest.jpeg);
		background-size: cover;
	}

	
	.getStart {
		z-index: 2;
		position: fixed;
		bottom: 75%;
		right: 10%;
		display: block;
		border-radius: 40px;
		font-weight: bold;
		font-family: "Hiragino Kaku Gothic ProN";
		background-color: white;
		border-color: forestgreen;
		color: forestgreen;
		border: none;
		box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
		font-size: 130%;
		width: 20%;
		padding: 1em 1.5em;
		cursor: pointer;
		background-image: linear-gradient(45deg, forestgreen 50%, transparent 50%);
		background-position: 100%;
		background-size: 400%;
		transition: background 300ms ease-in-out;
	}

	.getStart:hover {
		background-position: 0;
		color: white;
	}

	.aboutThisSite{
		padding: 180px 0;
		background-color:rgb(230, 230, 180);
		font-family: "Hiragino Kaku Gothic ProN";
		text-align: center;
	}

	.aboutThisSite h2{
		font-size: 50px;
		margin-bottom: 80px;
	}

	.aboutThisSite h3{
		font-size: 50px;
	}

	.aboutThisSite div{
		font-size: 30px;
	}

	.worried{
		position: relative;
		right: 300px;
	}

	.think{
		position: relative;
		left: 300px;
	}

	.find{
		position: relative;
		right: 300px;
	}

	footer{
		padding: 30px 0 ;
		border-top: 1px ridge black;
		text-align: center;
	}

	.explain{
		margin: 50px;
	}

	.lets{
		margin-top: 100px;
	}
</style>
