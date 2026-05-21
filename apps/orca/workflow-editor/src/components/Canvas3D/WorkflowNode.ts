import * as THREE from 'three'

const nodeColors: { [key: string]: number } = {
  trigger: 0xff6d5a,
  aiPrompt: 0x7c4dff,
  httpRequest: 0x2196f3,
  condition: 0xffb74d,
  loop: 0x4caf50,
  setVariable: 0xff9800,
  execute: 0x9c27b0,
  end: 0xf44336,
}

export class WorkflowNode {
  id: string
  type: string
  label: string
  mesh: THREE.Mesh
  position: THREE.Vector3
  color: number

  constructor(id: string, type: string, label: string, position: THREE.Vector3) {
    this.id = id
    this.type = type
    this.label = label
    this.position = position.clone()
    this.color = nodeColors[type] || 0x7c4dff

    // Create geometry and material
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({
      color: this.color,
      metalness: 0.3,
      roughness: 0.6,
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.copy(this.position)
    this.mesh.userData = {
      id,
      type,
      label,
      draggable: true,
      isNode: true,
    }
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
  }

  setPosition(position: THREE.Vector3) {
    this.position.copy(position)
    this.mesh.position.copy(position)
  }

  highlight(enable: boolean) {
    if (enable) {
      ;(this.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x444444)
    } else {
      ;(this.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000)
    }
  }

  dispose() {
    ;(this.mesh.geometry as THREE.BoxGeometry).dispose()
    ;(this.mesh.material as THREE.MeshStandardMaterial).dispose()
  }
}
