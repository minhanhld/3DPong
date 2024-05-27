import * as THREE from 'three';
import { RoundedBoxGeometry, KTX2Loader} from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Ball from './src/Ball.js';
import Paddle from './src/Paddle.js'
import PaddleRectangular from './src/PaddleRectangular.js'
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry'
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js'
import srcFont from 'three/examples/fonts/helvetiker_bold.typeface.json?url'
import lights from './src/Lighting.js'


const STEPS = 10;
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
	antialias: window.devicePixelRatio < 2,
	logarithmicDepthBuffer: true
});
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const cursor = new THREE.Vector2(0,0);
const raycaster = new THREE.Raycaster();
//scene.background = new THREE.Color(0xff99ff)
// FOG scene.fog = new THREE.Fog(0xff99ff, 90, 120)
scene.add(...lights)
const score = {
	player1: 0,
	player2 : 0
}

const TEXT_SETTINGS = {
	size: 4,
	depth: 0.5,
	curveSegments: 10,
	bevelEnabled: true,
	bevelThickness: 0.1,
	bevelSize: 0.1,
	bevelOffset: 0,
	bevelSegments: 5
}
let player1Mesh, player2Mesh, savedFont
const fontLoader = new FontLoader()
const scoreMaterial = new THREE.MeshStandardMaterial({color: 0x0000ff})

// const skyboxLoader = new THREE.CubeTextureLoader();
// const skyboxTexture = skyboxLoader.load([
//     './textures/px.png',
// 	'./textures/nx.png',
// 	'./textures/py.png',
// 	'./textures/ny.png',
// 	'./textures/pz.png',
// 	'./textures/nz.png'
// ]);
// skyboxTexture.generateMipmaps = false;
// skyboxTexture.minFilter = THREE.LinearFilter;
// skyboxTexture.magFilter = THREE.LinearFilter;

// let render;

const loadingManager = new THREE.LoadingManager(() => {

    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('fade-out');
    // optional: remove loader from DOM via event listener
    loadingScreen.addEventListener('transitionend', onTransitionEnd);

});

function onTransitionEnd(event) {
    const loadingScreen = event.target;
    loadingScreen.remove();
}

const texture = new THREE.TextureLoader(loadingManager).load('./textures/big.jpg');
texture.colorSpace = THREE.SRGBColorSpace;
texture.mapping = THREE.EquirectangularReflectionMapping;
texture.generateMipmaps = false;
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.NearestFilter;
texture.needsUpdate = true;

// var textureBasis = new KTX2Loader(loadingManager);
// textureBasis.setTranscoderPath('three/examples/jsm/libs/basis/')
// textureBasis.detectSupport(renderer);
// textureBasis.load('./textures/test2.ktx2')
// scene.background = textureBasis;

scene.background = texture;

//scene.background = skyboxTexture;

fontLoader.load(srcFont, function (font) {
	savedFont = font;
	const geometry = new TextGeometry('0', {
		font: font,
		...TEXT_SETTINGS
	})
	geometry.center();
	player1Mesh = new THREE.Mesh(geometry, scoreMaterial);
	player2Mesh = new THREE.Mesh(geometry, scoreMaterial);
	player1Mesh.castShadow = true;
	player2Mesh.castShadow = true;
	player1Mesh.position.z =  boundaries.y + 0.4;
	player2Mesh.position.z = -boundaries.y - 0.4;
	player1Mesh.position.y = 2
	player2Mesh.position.y = 2
	scene.add(player1Mesh, player2Mesh);
})

function getScoreGeometry(score) {
	const geometry = new TextGeometry(`${score}`, {
		font: savedFont,
		...TEXT_SETTINGS
	})
	geometry.center();
	return geometry;
}
/**
 * render sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}

const fov = 60
const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1)
camera.position.set(-35,20,0);
camera.lookAt(new THREE.Vector3(0, 2.5, 0))

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2, 0);
controls.update();

const boundaries = new THREE.Vector2(20, 20);
const planeGeometry = new THREE.PlaneGeometry(boundaries.x * 5, boundaries.y * 5, boundaries.x * 2, boundaries.y * 2);
planeGeometry.rotateX(-Math.PI * 0.5)
//planeGeometry.rotateY(Math.PI * 0.5)
const planeMaterial = new THREE.MeshLambertMaterial({
	// color: 0xffffff,
	reflectivity: 0.5,
	envMap: scene.background,
	combine: THREE.MixOperation,
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial); //regarder comment ca marche ca
plane.position.y = -2
plane.receiveShadow = true;
scene.add(plane);

const wallGeometry = new RoundedBoxGeometry(1, 2, boundaries.y * 2, 5, 0.5);
const wallMaterial = new THREE.MeshStandardMaterial({
	color: 0x999999,
	transparent: true,
	opacity: 0.3
});
const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
leftWall.castShadow = true;
const rightWall = leftWall.clone();
leftWall.position.x = -boundaries.x - 0.5;
rightWall.position.x = boundaries.x + 0.5;

scene.add(leftWall);
scene.add(rightWall);

const playerPaddle = new PaddleRectangular(scene, boundaries, new THREE.Vector3(0, 0, 15))
const playerPaddle2 = new PaddleRectangular(scene, boundaries, new THREE.Vector3(0, 0, -15))

const addLEDLightToPaddle = (paddle) => {
    const ledColor = 0x00b4d8;
    const pointLight = new THREE.PointLight(ledColor, 35, 1000);
    pointLight.position.set(0, 0, 0);
    paddle.mesh.add(pointLight);
};

addLEDLightToPaddle(playerPaddle);
addLEDLightToPaddle(playerPaddle2);


const ball = new Ball(scene, boundaries, [playerPaddle, playerPaddle2])

ball.addEventListener('scored', (e) => {
	console.log(e.message ,'has scored')
	score[e.message] += 1;
	const playerMesh = e.message === 'player1' ? player1Mesh : player2Mesh
	const geometry = getScoreGeometry(score[e.message]);
	playerMesh.geometry = geometry;
	console.log(score)
})

// function createParticleEffect(position) {
// 	const particleCount = 20;
//     const particles = new THREE.Group();

//     const particleTexture = new THREE.TextureLoader().load('path/to/particle_texture.png');
//     const particleMaterial = new THREE.PointsMaterial({
//         //map: particleTexture,
//         color: 0x00ffff,
//         size: 1,
//         blending: THREE.AdditiveBlending,
//         transparent: true,
//         depthWrite: false
//     });

//     const particleGeometry = new THREE.BufferGeometry();
//     const particlePositions = new Float32Array(particleCount * 3);

//     for (let i = 0; i < particleCount; i++) {
//         const x = position.x + Math.random() * 6 - 5;
//         const y = position.y + Math.random() * 6 - 5;
//         const z = position.z + Math.random() * 6 - 5;
//         particlePositions[i * 3] = x;
//         particlePositions[i * 3 + 1] = y;
//         particlePositions[i * 3 + 2] = z;
//     }

//     particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

//     const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
//     particles.add(particleSystem);

//     scene.add(particles);

//     setTimeout(() => {
//         scene.remove(particles);
//     }, 500); // Remove particles after 0.5 seconds
// }

// Event listener for ball collisions
// ball.addEventListener('collision', (event) => {
//     createParticleEffect(event.position);
// });

const clock = new THREE.Clock();

window.addEventListener('mousemove', function(event)
{
	cursor.x = 2 * (event.clientX / window.innerWidth) - 1
	cursor.y = -2 * (event.clientY / window.innerHeight) + 1}
)

/**
 * test
 **/

function createParticleTrail(position, color) {
    const trailCount = 20; // Number of particles in the trail
    const trailParticles = new THREE.Group();
    const previousPosition = new THREE.Vector3(); // Store the previous position of the paddle
    previousPosition.copy(position);

    // Define particle material with the desired color and fading opacity
    const particleMaterial = new THREE.PointsMaterial({
        color: color,
        size: 0.15,
        transparent: true,
        opacity: 1.0 // Initial opacity
    });

    // Create particle geometry and set positions based on current and previous positions
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(trailCount * 3);
    const fadeOutFactor = 1.0 / trailCount; // Adjust the fade-out speed

    for (let i = 0; i < trailCount; i++) {
        const progress = i / (trailCount - 1); // Calculate progress from 0 to 1
        const interpolatedPosition = new THREE.Vector3().lerpVectors(previousPosition, position, progress);

        particlePositions[i * 3] = interpolatedPosition.x;
        particlePositions[i * 3 + 1] = interpolatedPosition.y;
        particlePositions[i * 3 + 2] = interpolatedPosition.z;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Create particle system and add to the scene
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    trailParticles.add(particleSystem);
    scene.add(trailParticles);

    // Gradually decrease opacity of particles over time to simulate fading out
    const fadeOutInterval = setInterval(() => {
        particleMaterial.opacity -= fadeOutFactor; // Decrease opacity by fadeOutFactor
        if (particleMaterial.opacity <= 0) {
            clearInterval(fadeOutInterval);
            scene.remove(trailParticles);
        }
    }, 1); // Adjust the interval for smoother or faster fading
}

function createTrailingLine(position, color) {
    // Initialize previous position if it's not already defined
    if (!createTrailingLine.previousPosition) {
        createTrailingLine.previousPosition = position.clone();
    }

    const lineMaterial = new THREE.LineBasicMaterial({
        color: color,
        linewidth: 500, // Adjust the line width as needed
        transparent: true,
        opacity: 1.0 // Initial opacity
    });

    const lineGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        createTrailingLine.previousPosition.x, createTrailingLine.previousPosition.y, createTrailingLine.previousPosition.z,
        position.x, position.y, position.z
    ]);

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    const trailingLine = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(trailingLine);

    // Update previous position for the next call
    createTrailingLine.previousPosition.copy(position);

    // Gradually decrease opacity of the line over time to simulate fading out
    const fadeOutInterval = setInterval(() => {
        lineMaterial.opacity -= 0.09; // Adjust the opacity decrement as needed
        if (lineMaterial.opacity <= 0) {
            clearInterval(fadeOutInterval);
            scene.remove(trailingLine);
        }
    }, 1); // Adjust the interval for smoother or faster fading
}

function animate(){
	requestAnimationFrame(animate);

		const deltaTime = clock.getDelta();
		raycaster.setFromCamera(cursor, camera);
		const[intersection] = raycaster.intersectObject(plane);
		const subDeltaTime = deltaTime / STEPS;
		if (intersection)
		{
			const nextX = intersection.point.x;
			const prevX = playerPaddle.mesh.position.x;
			playerPaddle.setX(THREE.MathUtils.lerp(prevX, nextX, 0.1));
		}
		ball.update(deltaTime);
		playerPaddle2.setX(ball.mesh.position.x);
		createTrailingLine(playerPaddle.mesh.position, 0xfffff)
		//createTrailingLine(playerPaddle2.mesh.position, 0xfffff)
		//createParticleTrail(playerPaddle.mesh.position, 0xfffff)
		renderer.render(scene, camera);
}



animate();
