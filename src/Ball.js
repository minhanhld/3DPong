import * as THREE from 'three'
import lights from './Lighting.js'

const INITIAL_SPEED = 15;
let hidden = false;

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
		hidden = true;
    } else {
		hidden = false;
    }
});

export default class Ball extends THREE.EventDispatcher{
	velocity = new THREE.Vector3(1, 0, 0.5)
	constructor(scene, boundaries, paddles) {
		super();

		this.scene = scene;
		this.speed = INITIAL_SPEED;
		this.boundaries = boundaries;
		this.paddles = paddles;
		this.radius = 0.5;
		this.geometry = new THREE.SphereGeometry(this.radius);
		this.material = new THREE.MeshStandardMaterial({
			color: 0xffaa00,
			emissive: 0x00000,
			emissiveIntensity: 0.5,
			roughness: 0.5,
			metalness: 0.5
		});
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		this.collision = false;

		this.velocity.multiplyScalar(this.speed);
		this.raycaster = new THREE.Raycaster();
		this.raycaster.near = 0;
		this.raycaster.far = this.boundaries.y * 2.5;

		this.scene.add(this.mesh);
	}

	update(dt) {

		const dir = this.velocity.clone().normalize();
		this.raycaster.set(this.mesh.position, dir);

		const dist = this.velocity.clone().multiplyScalar(dt);
		const new_pos = this.mesh.position.clone().add(dist);

		const dx = (this.boundaries.x - this.radius) - Math.abs(this.mesh.position.x);
		const dz = (this.boundaries.y - this.radius) - Math.abs(this.mesh.position.z);
		if (dx <= 0)
		{
			new_pos.x = (this.boundaries.x - this.radius + dx) * Math.sign(this.mesh.position.x);
			this.velocity.x *= -1;
		}
		if (dz < 0)
		{
			if (!hidden)
			{
				const message = this.mesh.position.z > 0 ? 'player2' : 'player1';
				this.dispatchEvent({type : 'scored', message: message})
			}
			new_pos.set(0,0,0);
			this.speed = INITIAL_SPEED;
			this.velocity.z *= -1;
			this.velocity.normalize().multiplyScalar(this.speed);
		}
		const paddle = this.paddles.find((paddle) => {
			return (Math.sign(paddle.mesh.position.z) === Math.sign(this.velocity.z))
		}) //syntaxe a revoir

		const [intersection] = this.raycaster.intersectObject(paddle.collisionMesh, true);

		if (intersection)
		{
			if (intersection.distance < dist.length())
			{

				new_pos.copy(intersection.point);
				const d = dist.length() - intersection.distance;
				const normal = intersection.normal
				this.velocity.reflect(normal);
				const dS = this.velocity.clone().normalize().multiplyScalar(d);
				new_pos.add(dS);
				this.dispatchEvent({type: 'collision', position: new_pos});
				//Increasing speed whenever ball bounces
				this.speed *= 1.10
				this.velocity.normalize().multiplyScalar(this.speed);
			}
		}
		this.mesh.position.copy(new_pos);
	}
}
