import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

let scene, camera, renderer, planet, planet2, skybox
let isRotationStopped = false

const LIGHT_FORCE = 3

const loader = new GLTFLoader()

// Setup
scene = new THREE.Scene()
scene.background = new THREE.Color(0x404040)
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000)
renderer = new THREE.WebGLRenderer({antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight)

const hlight = new THREE.AmbientLight(0x404040, LIGHT_FORCE * .1)// soft white light
scene.add(hlight)
const directionalLight = new THREE.DirectionalLight(0xffffff, LIGHT_FORCE)
directionalLight.position.set(0, 20, 0)
directionalLight.castShadow = true
scene.add(directionalLight)

const directionalLight2 = new THREE.DirectionalLight(0xffffff, LIGHT_FORCE)
directionalLight2.position.set(0, -20, -10)
directionalLight2.castShadow = true
scene.add(directionalLight2)

// To be able to rotate and zoom the planet
const orbit = new OrbitControls(camera, renderer.domElement)
orbit.enabled = true // This is required for the min and max distance to work
orbit.minDistance = 3
orbit.maxDistance = 30
orbit.zoomSpeed = 0.5

const textureLoader = new THREE.TextureLoader()
const geometry = new THREE.SphereBufferGeometry(1.14, 200, 200)
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
sphere.visible = false
// sphere.rotation.x = -Math.PI / 4
scene.add(sphere)
const texturePositions = ['ft', 'bk', 'up', 'dn', 'rt', 'lf']

const skyboxGeometry = new THREE.BoxGeometry(100, 100, 100)
const skyboxMaterialArray = texturePositions.map(pos => {
	return new THREE.MeshBasicMaterial({
		map: textureLoader.load(`./assets/corona_${pos}.png`),
		side: THREE.BackSide,
	})
})
skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterialArray)
scene.add(skybox)

const geometryPositionCount = geometry.attributes.position.count
const positionClone = JSON.parse(JSON.stringify(geometry.attributes.position.array))
const normalsClone = JSON.parse(JSON.stringify(geometry.attributes.normal.array))

loader.load('assets/cristal-decimated-planet.glb', glb => {
	planet = glb.scene.children[0]
	planet2 = glb.scene.children[1]
    scene.add(glb.scene)
}, undefined, err => {
    console.log('Error', err)
})

document.body.appendChild(renderer.domElement)
camera.position.set(0, 7, 7)
camera.lookAt(0, 0, 0)

document.addEventListener('keypress', e => {
	if (e.key == ' ') {
		isRotationStopped = !isRotationStopped
	}
})

let toTheRight = true
const animate = () => {
	requestAnimationFrame(animate)
	const now = Date.now() / 200

	// Iterate all vertices of the water sphere
	for (let i = 0; i < geometryPositionCount; i++) {
		// Use UV to calculate waves
		const uX = geometry.attributes.uv.getX(i) * Math.PI * 16
		const uY = geometry.attributes.uv.getY(i) * Math.PI * 16

		const damping = 0.01
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

	}
	geometry.computeVertexNormals()
	geometry.attributes.position.needsUpdate = true

	// Inside here is where you update the positions
	if (!isRotationStopped) {
		if (toTheRight) {
			directionalLight.position.x += .1
			directionalLight.position.y += .1
		} else {
			directionalLight.position.x -= .1
			directionalLight.position.y -= .1
		}
		if (directionalLight.position.x >= 5) {
			toTheRight = false
		} else if (directionalLight.position.x <= -5) {
			toTheRight = true
		}
		if (planet) planet.rotation.z += 0.004
		if (sphere) sphere.rotation.z += 0.004
		if (planet2) planet2.rotation.y -= 0.004
		if (skybox) skybox.rotation.y -= 0.001
	}

	renderer.render(scene, camera)
}
animate()
