import * as THREE from 'three'

export class WorkflowScene {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  raycaster: THREE.Raycaster
  mouse: THREE.Vector2
  helperPlane: THREE.Plane
  resizeObserver?: ResizeObserver

  constructor(container: HTMLElement) {
    // Scene setup
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0a0e27)

    // Camera setup
    const width = container.clientWidth
    const height = container.clientHeight
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    this.camera.position.z = 5

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    container.appendChild(this.renderer.domElement)

    // Raycaster for picking
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    // Helper plane for drag-drop (Z=0)
    this.helperPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 7)
    directionalLight.castShadow = true
    this.scene.add(directionalLight)

    // Responsive sizing
    this.setupResize(container)

    // Start render loop
    this.animate()
  }

  private setupResize(container: HTMLElement) {
    this.resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth
      const height = container.clientHeight

      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
    })

    this.resizeObserver.observe(container)
  }

  private animate = () => {
    requestAnimationFrame(this.animate)
    this.renderer.render(this.scene, this.camera)
  }

  updateMousePosition(event: MouseEvent, container: HTMLElement) {
    const rect = container.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  getIntersectedObject(container: HTMLElement): THREE.Object3D | null {
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(this.scene.children)

    for (let i = 0; i < intersects.length; i++) {
      if ((intersects[i].object as any).userData.draggable) {
        return intersects[i].object
      }
    }
    return null
  }

  getDragPosition(): THREE.Vector3 {
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const target = new THREE.Vector3()
    this.raycaster.ray.intersectPlane(this.helperPlane, target)
    return target
  }

  dispose() {
    this.renderer.dispose()
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
  }
}
