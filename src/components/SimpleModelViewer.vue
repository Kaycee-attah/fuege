<template>
  <div class="simple-model-viewer">
    <div ref="container" class="viewer-container"></div>
    <div class="viewer-controls">
      <button @click="resetCamera" class="control-btn">Reset View</button>
      <button @click="toggleAutoRotate" class="control-btn">
        {{ autoRotate ? 'Pause' : 'Rotate' }}
      </button>
    </div>
    <div v-if="loading" class="loading-message">Loading 3D Model...</div>
    <div v-if="error" class="error-message">Error loading model: {{ error }}</div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default {
  name: 'SimpleModelViewer',
  props: {
    currentModel: {
      type: Object,
      required: true
    },
    selectedColor: {
      type: String,
      default: '#cccccc'
    },
    selectedFabric: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // ONLY store primitive values or simple objects here
      // DO NOT store Three.js objects in data()
      autoRotate: true,
      animationId: null,
      loading: false,
      error: null
    };
  },
  mounted() {
    this.initializeComponent();
  },
  beforeUnmount() {
    this.cleanup();
  },
  watch: {
    selectedColor() {
      this.updateMaterialColor();
    },
    selectedFabric: {
      handler() {
        this.updateMaterialProperties();
      },
      deep: true
    },
    currentModel: {
      handler(newModel) {
        this.loadNewModel(newModel.src);
      },
      deep: true
    }
  },
  methods: {
    initializeComponent() {
      try {
        this.initializeThreeJS();
      } catch (error) {
        console.error('Error initializing Three.js:', error);
        this.error = error.message;
      }
    },

    initializeThreeJS() {
      // Create Three.js objects as direct instance properties (not reactive)
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xf8f9fa);

      // Create camera with better initial settings
      this.camera = new THREE.PerspectiveCamera(
        45, // Reduced FOV for less distortion
        this.$refs.container.clientWidth / this.$refs.container.clientHeight,
        0.1,
        1000
      );
      
      // Set initial camera position - further back for larger view
      this.camera.position.z = 8;
      this.camera.position.y = 4;

      // Create renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(
        this.$refs.container.clientWidth,
        this.$refs.container.clientHeight
      );
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 7);
      directionalLight.castShadow = true;
      this.scene.add(directionalLight);

      // Add orbit controls with size constraints
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.autoRotate = this.autoRotate;
      
      // ADD THESE CONSTRAINTS TO PREVENT TOO SMALL/TOO LARGE
      this.controls.minDistance = 2;  // Minimum zoom distance (can't get closer than this)
      this.controls.maxDistance = 20; // Maximum zoom distance (can't get further than this)
      this.controls.maxPolarAngle = Math.PI; // Prevent flipping upside down
      this.controls.enablePan = true; // Allow panning
      
      // Optional: Adjust panning limits if needed
      // this.controls.minPan = new THREE.Vector3(-10, -5, -10);
      // this.controls.maxPan = new THREE.Vector3(10, 5, 10);

      // Initialize loader
      this.loader = new GLTFLoader();

      // Add to DOM
      this.$refs.container.appendChild(this.renderer.domElement);

      // Load initial model
      this.loadNewModel(this.currentModel.src);

      // Start animation loop
      this.animate();

      // Handle window resize
      window.addEventListener('resize', this.onWindowResize);
    },

    loadNewModel(modelPath) {
      if (!this.loader || !modelPath) return;

      this.loading = true;
      this.error = null;

      console.log('Loading model from:', modelPath);

      // COMPLETELY remove existing model before loading new one
      if (this.model) {
        // Remove from scene
        this.scene.remove(this.model);
        
        // Clean up materials and geometries to prevent memory leaks
        this.model.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) {
              child.geometry.dispose();
            }
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
        
        this.model = null; // Clear the reference
      }

      this.loader.load(
        modelPath,
        (gltf) => {
          console.log('Model loaded successfully:', modelPath);
          this.model = gltf.scene;
          
          // Enable shadows for all meshes in the model
          this.model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Set initial material properties
              if (child.material) {
                child.material.color.setStyle(this.selectedColor);
                this.applyFabricProperties(child.material);
              }
            }
          });

          // Add model to scene
          this.scene.add(this.model);

          // Center the model and adjust camera
          this.centerModel();

          this.loading = false;
        },
        (progress) => {
          console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
          console.error('Error loading model:', error);
          this.error = `Failed to load model: ${error.message}`;
          this.loading = false;
        }
      );
    },

    centerModel() {
      if (!this.model) return;

      const box = new THREE.Box3().setFromObject(this.model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Center the model
      this.model.position.x = -center.x;
      this.model.position.y = -center.y;
      this.model.position.z = -center.z;

      // Adjust camera to fit model with better scaling
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = this.camera.fov * (Math.PI / 180);
      
      // More controlled camera distance calculation
      let cameraZ;
      if (maxDim === 0) {
        cameraZ = 10; // Default if model has no size
      } else {
        cameraZ = Math.abs(maxDim / Math.tan(fov / 2));
      }

      // Add padding and ensure minimum size
      const padding = 2.5; // Increased padding for larger initial view
      cameraZ *= padding;
      
      // Ensure camera doesn't go beyond our constraints
      cameraZ = Math.max(3, Math.min(15, cameraZ)); // Keep between 3 and 15 units
      
      this.camera.position.z = cameraZ;
      this.camera.position.y = cameraZ * 0.3; // Adjust height proportionally

      // Set controls target to model center
      this.controls.target.copy(center);
      this.controls.update();
      
      console.log(`Model centered. Size: ${maxDim.toFixed(2)}, Camera distance: ${cameraZ.toFixed(2)}`);
    },

    updateMaterialColor() {
      if (!this.model) return;

      this.model.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.color.setStyle(this.selectedColor);
          child.material.needsUpdate = true;
        }
      });
    },

    updateMaterialProperties() {
      if (!this.model) return;

      this.model.traverse((child) => {
        if (child.isMesh && child.material) {
          this.applyFabricProperties(child.material);
        }
      });
    },

    applyFabricProperties(material) {
      if (!this.selectedFabric.name) return;

      switch (this.selectedFabric.name.toLowerCase()) {
        case 'leather':
          material.roughness = 0.3;
          material.metalness = 0.2;
          break;
        case 'velvet':
          material.roughness = 0.9;
          material.metalness = 0.1;
          break;
        case 'cotton':
          material.roughness = 0.7;
          material.metalness = 0.0;
          break;
        case 'linen':
          material.roughness = 0.8;
          material.metalness = 0.0;
          break;
        default:
          material.roughness = 0.7;
          material.metalness = 0.1;
      }
      material.needsUpdate = true;
    },

    animate() {
      this.animationId = requestAnimationFrame(this.animate);
      
      if (this.controls) {
        this.controls.update();
      }
      
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    },

    onWindowResize() {
      if (this.camera && this.renderer && this.$refs.container) {
        this.camera.aspect = this.$refs.container.clientWidth / this.$refs.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(
          this.$refs.container.clientWidth,
          this.$refs.container.clientHeight
        );
      }
    },

    resetCamera() {
      if (this.controls) {
        this.controls.reset();
      }
    },

    toggleAutoRotate() {
      this.autoRotate = !this.autoRotate;
      if (this.controls) {
        this.controls.autoRotate = this.autoRotate;
      }
    },

    cleanup() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }

      // Clean up Three.js objects
      if (this.model) {
        this.model.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }

      if (this.renderer) {
        this.renderer.dispose();
        if (this.renderer.domElement) {
          this.renderer.domElement.remove();
        }
      }

      if (this.scene) {
        while(this.scene.children.length > 0) { 
          this.scene.remove(this.scene.children[0]); 
        }
      }

      window.removeEventListener('resize', this.onWindowResize);
    }
  }
};
</script>

<style scoped>
.simple-model-viewer {
  width: 100%;
  height: 100%;
  position: relative;
}

.viewer-container {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.viewer-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}

.control-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: white;
  transform: translateY(-2px);
}

.loading-message, .error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.error-message {
  background: rgba(255, 0, 0, 0.1);
  color: #d32f2f;
}
</style>