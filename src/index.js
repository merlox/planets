import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

let scene, camera, renderer

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
new OrbitControls(camera, renderer.domElement)

// const light = new THREE.PointLight(0xc4c4c4, LIGHT_FORCE)
// light.position.set(0, 300, 500)
// scene.add(light)
// const light2 = new THREE.PointLight(0xc4c4c4, LIGHT_FORCE)
// light.position.set(500, 100, 0)
// scene.add(light2)
// const light3 = new THREE.PointLight(0xc4c4c4, LIGHT_FORCE)
// light.position.set(0, 100, -500)
// scene.add(light3)
// const light4 = new THREE.PointLight(0xc4c4c4, LIGHT_FORCE)
// light.position.set(-500, 300, 0)
// scene.add(light4)

loader.load('assets/planet.glb', glb => {
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

	renderer.render(scene, camera)
}
animate()
