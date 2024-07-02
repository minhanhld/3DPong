import { CapsuleGeometry, Mesh, MeshNormalMaterial, MeshStandardMaterial, BoxGeometry} from "three";

const GEOMETRY = new BoxGeometry(1, 5, 1 , 20, 20);
const COLLISION_GEOMETRY = new BoxGeometry(1.5, 5.5, 1.5, 20, 20);
const MATERIAL = new MeshStandardMaterial({
	color: 0xaa00ff,
	emissive: 0x00b4d8,
	emissiveIntensity: 1.5
});
const COLLISION_MATERIAL = new MeshNormalMaterial({transparent: true, opacity: 0.5, visible: false})

GEOMETRY.rotateZ(Math.PI * 0.5);
COLLISION_GEOMETRY.rotateZ(Math.PI * 0.5)

export default class Paddle {
	constructor(scene, boundaries, position) {
		this.scene = scene;
		this.boundaries = boundaries;
		this.geometry = GEOMETRY;
		this.collision_geometry = COLLISION_GEOMETRY;
		this.material = MATERIAL;
		this.mesh = new Mesh(GEOMETRY, MATERIAL);
		this.collisionMesh = new Mesh(COLLISION_GEOMETRY, COLLISION_MATERIAL);
		this.mesh.position.copy(position);
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;

		this.mesh.add(this.collisionMesh);
		this.scene.add(this.mesh);
		this.length = this.geometry.parameters.height;

		this.arrowUp = false;
		this.arrowDown = false;
	}

	setX(new_x)
	{
		if (new_x > this.boundaries.x - this.length / 2)
			new_x = this.boundaries.x - this.length / 2
		else if (new_x < -this.boundaries.x + this.length / 2)
			new_x = -this.boundaries.x + this.length / 2;
		this.mesh.position.x = new_x;
	}
}
