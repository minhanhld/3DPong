import { CapsuleGeometry, Mesh, MeshNormalMaterial, Box3, Box3Helper, BoxGeometry} from "three";

const GEOMETRY = new CapsuleGeometry(0.5, 5, 20, 20);
const MATERIAL = new MeshNormalMaterial();

GEOMETRY.rotateZ(Math.PI * 0.5);

export default class Paddle {
	constructor(scene, boundaries, position) {
		this.scene = scene;
		this.boundaries = boundaries;
		this.geometry = GEOMETRY;
		this.material = MATERIAL;
		this.mesh = new Mesh(GEOMETRY, MATERIAL);
		this.mesh.position.copy(position);
		this.scene.add(this.mesh);
		this.length = this.geometry.parameters.length;
		this.radius = this.geometry.parameters.radius;
		this.width = this.radius * 2 + this.length;
	}

	setX(new_x)
	{
		if (new_x > this.boundaries.x - this.width / 2)
			new_x = this.boundaries.x - this.width / 2
		else if (new_x < -this.boundaries.x + this.width / 2)
			new_x = -this.boundaries.x + this.width / 2;
		this.mesh.position.x = new_x;
	}

}
