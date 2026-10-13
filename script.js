
console.log("SCRIPT FILE LOADED");

const API_BASE_URL = "https://riyadvi-website-api.onrender.com";

/* =====================================
   CONTACT FORM
   ===================================== */

const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

if (contactForm) {
  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const submitButton = contactForm.querySelector(
      'button[type="submit"], input[type="submit"]'
    );

    const originalText = submitButton
      ? submitButton.textContent
      : "";

    if (submitButton) {
      submitButton.disabled = true;
      if (submitButton.tagName === "BUTTON") {
        submitButton.textContent = "Sending...";
      }
    }

    const formData = new FormData(contactForm);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message")
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to submit the form.");
      }

      if (formMessage) {
        formMessage.textContent =
          result.message || "Thank you! Your message has been received.";
      }

      contactForm.reset();
    } catch (error) {
      console.error("Contact form error:", error);

      if (formMessage) {
        formMessage.textContent =
          "Message could not be sent. Please try again.";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        if (submitButton.tagName === "BUTTON") {
          submitButton.textContent = originalText || "Send Message";
        }
      }
    }
  });
}

/* =====================================
   GSAP ANIMATIONS
   ===================================== */

if (window.gsap) {
  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  gsap.from(".hero-content > *", {
    opacity: 0,
    y: 25,
    duration: 0.8,
    stagger: 0.12,
    ease: "power2.out"
  });

  if (window.ScrollTrigger) {
    gsap.utils.toArray(".service").forEach((card) => {
      gsap.from(card, {
        opacity: 0,
        y: 30,
        duration: 0.7,
        scrollTrigger: {
          trigger: card,
          start: "top 88%"
        }
      });
    });
  }
}

/* =====================================
   LARGE THREE.JS SPHERE + ORBIT
   ===================================== */

function initThreeScene() {
  const canvas = document.getElementById("heroCanvas");

  if (!canvas) {
    console.error('Three.js: canvas id="heroCanvas" not found.');
    return;
  }

  if (!window.THREE) {
    console.error("Three.js library did not load.");
    return;
  }

  try {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      1,
      0.1,
      100
    );

    camera.position.z = 4.0;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.setClearColor(0x000000, 0);

    /* Main rotating group */
    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    /* Main gold wireframe sphere */
    const sphereGeometry = new THREE.IcosahedronGeometry(
      2.0,
      2
    );

    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xd9b66f,
      metalness: 0.75,
      roughness: 0.28,
      wireframe: true
    });

    const sphere = new THREE.Mesh(
      sphereGeometry,
      sphereMaterial
    );

    sphereGroup.add(sphere);

    /* Inner glowing sphere */
    const coreGeometry = new THREE.SphereGeometry(
      0.82,
      32,
      32
    );

    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x4b3514,
      transparent: true,
      opacity: 0.35,
      wireframe: false
    });

    const core = new THREE.Mesh(
      coreGeometry,
      coreMaterial
    );

    sphereGroup.add(core);

    /* Orbit ring 1 */
    const orbitGeometry1 = new THREE.TorusGeometry(
      1.85,
      0.012,
      12,
      160
    );

    const orbitMaterial1 = new THREE.MeshBasicMaterial({
      color: 0xf3dba0,
      transparent: true,
      opacity: 0.95
    });

    const orbit1 = new THREE.Mesh(
      orbitGeometry1,
      orbitMaterial1
    );

    orbit1.rotation.x = 1.05;
    orbit1.rotation.y = 0.25;
    sphereGroup.add(orbit1);

    /* Orbit ring 2 */
    const orbitGeometry2 = new THREE.TorusGeometry(
      2.05,
      0.009,
      12,
      160
    );

    const orbitMaterial2 = new THREE.MeshBasicMaterial({
      color: 0xd9b66f,
      transparent: true,
      opacity: 0.7
    });

    const orbit2 = new THREE.Mesh(
      orbitGeometry2,
      orbitMaterial2
    );

    orbit2.rotation.x = 1.8;
    orbit2.rotation.y = -0.4;
    sphereGroup.add(orbit2);

    /* Orbiting particles */
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffe4a1
    });

    const particles = [];

    for (let i = 0; i < 4; i++) {
      const particleGeometry = new THREE.SphereGeometry(
        0.055,
        16,
        16
      );

      const particle = new THREE.Mesh(
        particleGeometry,
        particleMaterial
      );

      particle.userData.angle = (Math.PI * 2 * i) / 4;
      particle.userData.radius = 1.85;
      sphereGroup.add(particle);
      particles.push(particle);
    }

    /* Lighting */
    scene.add(
      new THREE.AmbientLight(0xffffff, 1.8)
    );

    const goldLight = new THREE.PointLight(
      0xffd580,
      35
    );

    goldLight.position.set(3, 4, 5);
    scene.add(goldLight);

    const fillLight = new THREE.PointLight(
      0x9d6d22,
      12
    );

    fillLight.position.set(-4, -2, 2);
    scene.add(fillLight);

    /* Resize canvas to its container */
    function resizeScene() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height, false);
    }

    resizeScene();
    window.addEventListener("resize", resizeScene);

    /* Mouse interaction */
    let targetX = 0;
    let targetY = 0;

    canvas.addEventListener("pointermove", function (event) {
      const rect = canvas.getBoundingClientRect();

      targetY =
        ((event.clientX - rect.left) / rect.width - 0.5) * 0.35;

      targetX =
        ((event.clientY - rect.top) / rect.height - 0.5) * 0.35;
    });

    /* Animation */
    function animate() {
      requestAnimationFrame(animate);

      sphereGroup.rotation.y += 0.003;
      sphereGroup.rotation.x += 0.0015;

      sphereGroup.rotation.x +=
        (targetX - sphereGroup.rotation.x) * 0.01;

      sphereGroup.rotation.y +=
        (targetY - sphereGroup.rotation.y) * 0.01;

      orbit1.rotation.z += 0.002;
      orbit2.rotation.z -= 0.0015;

      particles.forEach((particle, index) => {
        const angle =
          particle.userData.angle + performance.now() * 0.0005;

        particle.position.set(
          Math.cos(angle) * particle.userData.radius,
          Math.sin(angle) * particle.userData.radius * 0.45,
          Math.sin(angle) * 0.65
        );
      });

      renderer.render(scene, camera);
    }

    animate();

    console.log(
      "Three.js sphere and orbit initialized successfully."
    );
  } catch (error) {
    console.error("Three.js initialization failed:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initThreeScene);
} else {
  initThreeScene();
}
