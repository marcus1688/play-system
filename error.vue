<template>
  <div class="min-h-screen relative overflow-hidden bg-gray-300">
    <canvas ref="canvas" class="absolute top-0 left-0 w-full h-full"></canvas>
    <div
      class="relative z-10 min-h-screen flex items-center justify-center p-4"
    >
      <div
        class="max-w-2xl w-full px-8 py-12 bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/60"
      >
        <div class="text-center">
          <div class="mb-20 flex justify-center">
            <div class="relative group">
              <div
                class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-70 lg:group-hover:opacity-100 transition-opacity duration-300 scale-110"
              ></div>
              <div
                class="relative bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-sm"
              >
                <img
                  src="/logo.png"
                  alt="Logo"
                  class="h-16 mx-auto filter drop-shadow-lg"
                />
                <div
                  class="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-indigo-400 rounded-tl-lg"
                ></div>
                <div
                  class="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-indigo-400 rounded-tr-lg"
                ></div>
                <div
                  class="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-indigo-400 rounded-bl-lg"
                ></div>
                <div
                  class="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-indigo-400 rounded-br-lg"
                ></div>
              </div>
            </div>
          </div>

          <div class="relative mb-12">
            <div class="absolute inset-0 flex items-center justify-center">
              <div
                class="w-48 h-48 bg-gradient-to-r from-indigo-200/30 to-purple-200/30 rounded-full animate-pulse"
              ></div>
              <div
                class="absolute w-36 h-36 bg-gradient-to-r from-indigo-300/40 to-purple-300/40 rounded-full animate-ping"
              ></div>
              <div
                class="absolute w-24 h-24 bg-gradient-to-r from-indigo-400/50 to-purple-400/50 rounded-full animate-pulse"
                style="animation-delay: 0.5s"
              ></div>
            </div>

            <div class="relative">
              <span
                class="text-8xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg"
              >
                {{ error.statusCode === 404 ? "404" : error.statusCode }}
              </span>
            </div>
          </div>

          <div class="mb-6">
            <h1
              class="text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent mb-3 tracking-tight"
            >
              {{
                error.statusCode === 404
                  ? "Page Not Found"
                  : error.message || "Something Went Wrong"
              }}
            </h1>

            <div class="flex items-center justify-center mb-4">
              <div
                class="w-16 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
              ></div>
              <div class="mx-3 w-2 h-2 bg-indigo-400 rounded-full"></div>
              <div
                class="w-16 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
              ></div>
            </div>
          </div>

          <div class="mb-10">
            <p class="text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
              {{
                error.statusCode === 404
                  ? "The page you're looking for seems to have wandered off into the digital wilderness. Let's guide you back to familiar territory."
                  : "Our engineering team has been notified and is working to resolve this issue. Thank you for your patience."
              }}
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              @click="handleError"
              class="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl overflow-hidden transition-all duration-300 lg:hover:from-indigo-500 lg:hover:to-purple-500 lg:hover:scale-105 lg:hover:shadow-xl transform"
            >
              <span
                class="relative z-10 flex items-center justify-center gap-3 font-semibold"
              >
                <Icon icon="heroicons:home" class="w-5 h-5" />
                Back to Home
              </span>
              <div
                class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300"
              ></div>
              <div
                class="absolute -top-1 -right-1 w-3 h-3 bg-white/50 rounded-full animate-ping"
              ></div>
            </button>

            <button
              @click="refresh"
              class="group px-6 py-3 bg-gray-100 lg:hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-300 lg:hover:scale-105 border border-gray-200 lg:hover:border-gray-300"
            >
              <span class="flex items-center gap-2 font-medium">
                <Icon
                  icon="heroicons:arrow-path"
                  class="w-4 h-4 lg:group-hover:rotate-180 transition-transform duration-300"
                />
                Refresh Page
              </span>
            </button>
          </div>

          <div
            class="flex justify-center items-center gap-4 text-sm text-gray-500"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-2 h-2 bg-green-400 rounded-full animate-pulse"
              ></div>
              <span>System Online</span>
            </div>
            <div class="w-1 h-4 bg-gray-300"></div>
            <div class="flex items-center gap-2">
              <div
                class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                style="animation-delay: 0.3s"
              ></div>
              <span>Support Available</span>
            </div>
          </div>

          <div
            class="absolute top-8 right-8 w-20 h-20 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-xl"
          ></div>
          <div
            class="absolute bottom-8 left-8 w-16 h-16 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-xl"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import * as THREE from "three";

defineProps({
  error: {
    type: Object,
    required: true,
  },
});

const canvas = ref(null);
let scene, camera, renderer, particles;
let animationFrameId;

onMounted(() => {
  initThree();
  animate();
  window.addEventListener("resize", onWindowResize, false);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
  cancelAnimationFrame(animationFrameId);
  if (renderer) {
    renderer.dispose();
  }
});

const initThree = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const textureLoader = new THREE.TextureLoader();
  const particleTexture = textureLoader.load("/bubble.png");
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 150;
  const positions = new Float32Array(particlesCount * 3);
  const speeds = new Float32Array(particlesCount);

  for (let i = 0; i < particlesCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 80;
    positions[i + 1] = Math.random() * -30;
    positions[i + 2] = (Math.random() - 0.5) * 50;
    speeds[i / 3] = Math.random() * 0.02 + 0.02;
  }
  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const particlesMaterial = new THREE.PointsMaterial({
    size: 1,
    map: particleTexture,
    color: "#4f46e5",
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
  });
  particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);
  particles.userData.speeds = speeds;
  camera.position.z = 40;
};

const animate = () => {
  animationFrameId = requestAnimationFrame(animate);
  if (particles) {
    const positions = particles.geometry.attributes.position.array;
    const speeds = particles.userData.speeds;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += speeds[i / 3];
      positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.01;
      if (positions[i + 1] > 30) {
        positions[i + 1] = -30;
        positions[i] = (Math.random() - 0.5) * 50;
        positions[i + 2] = (Math.random() - 0.5) * 50;
      }
    }
    particles.geometry.attributes.position.needsUpdate = true;
  }

  renderer.render(scene, camera);
};

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

const handleError = () => {
  clearError();
  navigateTo("/");
};

const refresh = () => {
  window.location.reload();
};
</script>
