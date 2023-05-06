// import * as g from "@akashic/akashic-engine/index.runtime"

function checkEnter(rect1: g.FilledRect, rect2: g.FilledRect) {
	const getRange = (anchor: number, len: number, pos: number) => {
		return {"From": pos - anchor * len, "To": pos - anchor * len + len}
	}

	const rect1X = getRange(rect1.anchorX, rect1.width, rect1.x), rect2X = getRange(rect2.anchorX, rect2.width, rect2.x)
	const rect1Y = getRange(rect1.anchorY, rect1.height, rect1.y), rect2Y = getRange(rect2.anchorY, rect2.height, rect2.y)

	return (rect1X.From <= rect2X.To && rect2X.From <= rect1X.To) && (rect1Y.From <= rect2Y.To && rect2Y.From <= rect1Y.To)
}

function getSpeed(velocity: number, angle: number) {
	return {x: velocity * Math.cos(angle), y: velocity * Math.sin(angle)}
}


function main(param: g.GameMainParameterObject): void {
	const scene = new g.Scene({
		game: g.game
	});
	scene.onLoad.add(() => {

		const blocks: Set<g.FilledRect> = new Set()

		for (const row of Array(5).keys()) {
			for (const column of Array(14).keys()) {
				const block = new g.FilledRect({
					width: 80,
					height: 40,
					scene: scene,
					cssColor: "red",
					x: column * 90 + 10,
					y: row * 50 + 5
				})
	
				scene.append(block)
				blocks.add(block)	
			}
		}

		const bar = new g.FilledRect({
			width: 100,
			height: 20,
			scene: scene,
			cssColor: "black",
			anchorX: 0.5,
			anchorY: 0.5,
			x: g.game.width / 2,
			y: g.game.height - 50
		})
		scene.append(bar)

		// バーを動かす
		scene.onPointDownCapture.add(e => {
			bar.x = e.point.x
			bar.modified()
		})

		const ball = new g.FilledRect({
			width: 5,
			height: 5,
			scene: scene,
			cssColor: "gray",
			anchorX: 0.5,
			anchorY: 1,
			x: g.game.width / 2 - 100,
			y: g.game.height - 150
		})
		scene.append(ball)

		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: "sans-serif",
			size: 48
		});


		let velocity = 8, angle = Math.PI / 4
		let speed = getSpeed(velocity, angle)
		let finish = false
		scene.onUpdate.add(() => {
			ball.moveBy(speed.x, speed.y)

			const enteredBlock = Array.from(blocks).find(v => checkEnter(v, ball))

			// ボールとブロックが衝突したら
			if (!!enteredBlock) {
				enteredBlock.destroy()
				blocks.delete(enteredBlock)
				angle = - angle
			}

			// ボールとバーが衝突したら
			if (checkEnter(bar, ball) && speed.y > 0) {
				angle = - angle
			}

			// ボールと横の壁が衝突したら
			if (ball.x <= 0 || ball.x >= g.game.width) {
				angle = Math.PI - angle
			}

			// ボールが上の壁に衝突したら
			if (ball.y <= 0) {
				angle = - angle
			}

			// ボールが下の壁に衝突したら
			if (ball.y >= g.game.height && !finish) {
				const text = new g.Label({
					scene: scene, // g.Sceneの値
					font: font, // g.Fontの値
					text: "You Lose",
					fontSize: 48,
					anchorX: 0.5,
					anchorY: 0.5,
					x: g.game.width / 2,
					y: g.game.height / 2
				});
				scene.append(text)
				finish = true
			}

			// 全部壊したら
			if (blocks.size === 0 && !finish) {
				const text = new g.Label({
					scene: scene, // g.Sceneの値
					font: font, // g.Fontの値
					text: "You Win!",
					fontSize: 48,
					anchorX: 0.5,
					anchorY: 0.5,
					x: g.game.width / 2,
					y: g.game.height / 2
				});
				scene.append(text)
				finish = true
			}


			speed = getSpeed(velocity, angle)
			ball.modified()
		})
	});
	g.game.pushScene(scene);
}

export = main;
