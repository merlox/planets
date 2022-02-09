import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

let scene, camera, renderer, planet, planet2

const LIGHT_FORCE = 2

const loader = new GLTFLoader()

// Setup
scene = new THREE.Scene()
scene.background = new THREE.Color(0x404040)
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000)
renderer = new THREE.WebGLRenderer({antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight)

const hlight = new THREE.AmbientLight(0x404040, LIGHT_FORCE)// soft white light
scene.add(hlight)
const directionalLight = new THREE.DirectionalLight(0xffffff, LIGHT_FORCE)
directionalLight.position.set(0, 20, 0)
directionalLight.castShadow = true
scene.add(directionalLight)

// To be able to rotate and zoom the planet
const orbit = new OrbitControls(camera, renderer.domElement)
orbit.minZoom = 100.0
orbit.maxZoom = 110.0
orbit.zoomSpeed = 0.5

const textureLoader = new THREE.TextureLoader()
const geometry = new THREE.SphereBufferGeometry(8.5, 20, 20)
const sphere = new THREE.Mesh(geometry,
	new THREE.MeshStandardMaterial({
		map: textureLoader.load('./assets/Water_002_COLOR.jpg'),
		normalMap: textureLoader.load('./assets/Water_002_NORM.jpg'),
		displacementMap: textureLoader.load('./assets/Water_002_DISP.png'), displacementScale: 0.03,
		roughnessMap: textureLoader.load('./assets/Water_002_ROUGH.jpg'), roughness: 0,
		aoMap: textureLoader.load('./assets/Water_002_OCC.jpg'),
	}))
sphere.receiveShadow = true
sphere.castShadow = true
// sphere.rotation.x = -Math.PI / 4
scene.add(sphere)

const geometryPositionCount = geometry.attributes.position.count
const positionClone = JSON.parse(JSON.stringify(geometry.attributes.position.array))
const normalsClone = JSON.parse(JSON.stringify(geometry.attributes.normal.array))
const damping = 0.2

loader.load('assets/planet.glb', glb => {
	planet = glb.scene.children[0]
	planet2 = glb.scene.children[1]
	planet2.visible = false
    scene.add(glb.scene)
}, undefined, err => {
    console.log('Error', err)
})

document.body.appendChild(renderer.domElement)
camera.position.set(0, 0, 30)
camera.lookAt(0, 0, 0)

let toTheRight = true
const animate = () => {
	requestAnimationFrame(animate)
	const now = Date.now() / 200

	// Iterate all vertices of the water sphere
	for (let i = 0; i < geometryPositionCount; i++) {
		// Use UV to calculate waves
		const uX = geometry.attributes.uv.getX(i) * Math.PI * 16
		const uY = geometry.attributes.uv.getY(i) * Math.PI * 16

		// Calculate current vertex height
		const xAngle = (uX + now)
		const xSin = Math.sin(xAngle) * damping
		const yAngle = (uY + now)
		const yCos = Math.cos(yAngle) * damping

		// Indices
		const iX = i * 3
		const iY = i * 3 + 1
		const iZ = i * 3 + 2

		geometry.attributes.position.setX(i, positionClone[iX] + normalsClone[iX] * (xSin - yCos))
		geometry.attributes.position.setY(i, positionClone[iY] + normalsClone[iY] * (xSin - yCos))
		geometry.attributes.position.setZ(i, positionClone[iZ] + normalsClone[iZ] * (xSin - yCos))

		geometry.computeVertexNormals()
		geometry.attributes.position.needsUpdate = true
	}

	// Inside here is where you update the positions
	if (toTheRight) {
		directionalLight.position.x = directionalLight.position.x + .1
		directionalLight.position.y = directionalLight.position.y + .1
	} else {
		directionalLight.position.x = directionalLight.position.x - .1
		directionalLight.position.y = directionalLight.position.y - .1
	}
	if (directionalLight.position.x >= 100) {
		toTheRight = false
	} else if (directionalLight.position.x <= -100) {
		toTheRight = true
	}

	if (planet) {
		planet.rotation.y += 0.004
		sphere.rotation.y += 0.004
	}
	if (planet2) planet2.rotation.y += 0.004

	renderer.render(scene, camera)
}
animate()