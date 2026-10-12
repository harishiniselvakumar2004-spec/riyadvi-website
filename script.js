
console.log("SCRIPT FILE LOADED");

// Render backend URL
const API_BASE_URL = "https://riyadvi-website-api.onrender.com";

// Contact form
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

if (contactForm && formMessage) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector(
      'button[type="submit"]'
    );

    const formData = new FormData(contactForm);

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !message) {
      formMessage.textContent = "Please fill in all fields.";
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    formMessage.textContent = "";

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, message })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to send enquiry.");
      }

      formMessage.textContent =
        result.message || "Your enquiry was sent successfully!";

      contactForm.reset();
    } catch (error) {
      console.error("Contact form error:", error);

      formMessage.textContent =
        "Could not send your enquiry. Please try again.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Send Enquiry";
      }
    }
  });
}

// GSAP animations
if (window.gsap) {
  gsap.from(".hero-content > *", {
    opacity: 0,
    y: 25,
    duration: 0.8,
    stagger: 0.15,
    ease: "power2.out"
  });

  gsap.from(".orb", {
    opacity: 0,
    scale: 0.7,
    duration: 1.2,
    delay: 0.3,
    ease: "back.out(1.5)"
  });

  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".service", {
      opacity: 0,
      y: 35,
      duration: 0.7,
      stagger: 0.15,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".services",
        start: "top 80%"
      }
    });
  }
}

// Three.js 3D animation
const threeCanvas = document.getElementById("threeCanvas");

if (threeCanvas && window.THREE) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 4;

  const renderer = new THREE.WebGLRenderer({
    canvas: threeCanvas,
    alpha: true,
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const geometry = new THREE.IcosahedronGeometry(1, 2);

  const material = new THREE.MeshStandardMaterial({
    color: 0xd9b66f,
    metalness: 0.8,
    roughness: 0.25,
    wireframe: true
  });

  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
  sphere.rotation.set(0.5, 0.5, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 2));

  const light = new THREE.PointLight(0xffd700, 30);
  light.position.set(2, 3, 4);
  scene.add(light);

  function resizeScene() {
    const width = threeCanvas.clientWidth;
    const height = threeCanvas.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  resizeScene();
  window.addEventListener("resize", resizeScene);

  threeCanvas.addEventListener("pointermove", (event) => {
    const rect = threeCanvas.getBoundingClientRect();

    sphere.rotation.x =
      ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    sphere.rotation.y =
      ((event.clientX - rect.left) / rect.width - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);

    sphere.rotation.x += 0.003;
    sphere.rotation.y += 0.004;
    sphere.rotation.z += 0.002;

    renderer.render(scene, camera);
  }

  animate();
}
