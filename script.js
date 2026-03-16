(function () {
  const projectConfig = {
    project: {
      name: "Aurelia Coffee Marketing Experience",
      engine: "Three.js + GSAP + Vanilla JS",
      style: "coffee brand marketing immersive 3D",
      descriptionColor: "#00FFFF"
    },
    theme: {
      background: "#050505",
      primary: "#4A2C2A",
      accent: "#C89B3C",
      description: "#00FFFF"
    },
    assets: {
      frameSequencePath: "/images/",
      framePrefix: "coffee_",
      frameExtension: ".jpg",
      frameCount: 180,
      artImages: {
        hero: "/coffeeHero.jpg",
        beans: "/beans.jpg",
        espresso: "/espresso.jpg",
        latte: "/latte.jpg",
        grinder: "/grinder.jpg"
      }
    },
    introSequence: {
      autoPlay: true,
      playOnce: true,
      duration: 6,
      stopFrame: 180,
      camera: {
        type: "perspective",
        fov: 60,
        position: [0, 0, 5]
      },
      lighting: {
        ambient: {
          color: "#ffffff",
          intensity: 0.6
        },
        directional: {
          color: "#C89B3C",
          intensity: 1.2,
          position: [5, 10, 7]
        }
      }
    },
    interaction: {
      activateOn: "scroll",
      timelineControlled: true,
      gsapTimeline: {
        scrub: true,
        ease: "power2.out",
        duration: 4
      }
    },
    scenes: [
      {
        id: "hero",
        type: "frameSequence",
        description: {
          text: "Sell more coffee with story-driven campaigns",
          color: "#00FFFF",
          position: "center"
        },
        frames: {
          path: "/images/",
          start: 1,
          end: 180
        }
      },
      {
        id: "coffeeBeans",
        type: "3dScene",
        camera: {
          position: [0, 1, 6]
        },
        objects: [
          {
            type: "model",
            name: "coffeeBeans",
            geometry: "sphere",
            material: "phong",
            color: "#4A2C2A",
            count: 100,
            animation: "floating"
          }
        ],
        description: {
          text: "Position bean origin as premium market value",
          color: "#00FFFF"
        }
      },
      {
        id: "espressoExtraction",
        type: "3dScene",
        camera: {
          position: [0, 2, 5]
        },
        objects: [
          {
            type: "liquidStream",
            color: "#3B1E16",
            animation: "flow"
          }
        ],
        description: {
          text: "Use espresso theater to convert viewers into buyers",
          color: "#00FFFF"
        }
      }
    ],
    carouselCards: {
      type: "3dCarousel",
      radius: 6,
      rotationSpeed: 0.3,
      cards: [
        {
          title: "Espresso",
          image: "/espresso.jpg",
          description: "Bold flagship offer for high-intent buyers"
        },
        {
          title: "Cappuccino",
          image: "/latte.jpg",
          description: "Creamy comfort angle for broad reach"
        },
        {
          title: "Latte",
          image: "/latte.jpg",
          description: "Smooth daily ritual for repeat purchases"
        },
        {
          title: "Americano",
          image: "/coffeeHero.jpg",
          description: "Classic all-day option for retention"
        }
      ],
      animation: {
        type: "carouselRotation",
        gsap: true
      }
    },
    performance: {
      lazyLoadFrames: true,
      useWebP: true,
      maxTextureSize: 2048
    }
  };

  const descriptionContent = {
    hero: {
      title: projectConfig.scenes[0].description.text,
      subtext:
        "We engineer full-funnel coffee campaigns that turn attention into repeat coffee orders."
    },
    coffeeBeans: {
      title: projectConfig.scenes[1].description.text,
      subtext:
        "Origin-led messaging increases perceived value and helps your brand command stronger margins."
    },
    espressoExtraction: {
      title: projectConfig.scenes[2].description.text,
      subtext:
        "Cinematic extraction content powers high-CTR ads, conversion pages, and launch-day momentum."
    },
    carousel: {
      title: "Conversion-ready beverage lineup for every audience segment",
      subtext:
        "Map each drink to acquisition, upsell, and retention campaigns in one interactive funnel view."
    }
  };

  const frameCanvas = document.getElementById("frameCanvas");
  const threeCanvas = document.getElementById("threeCanvas");
  const sceneDescriptionEl = document.getElementById("sceneDescription");
  const sceneSubtextEl = document.getElementById("sceneSubtext");
  const scrollTrackEl = document.getElementById("scrollTrack");

  if (!frameCanvas || !threeCanvas || !sceneDescriptionEl || !sceneSubtextEl || !scrollTrackEl) {
    return;
  }

  const frameCtx = frameCanvas.getContext("2d", { alpha: false, desynchronized: true });
  if (!frameCtx) {
    return;
  }

  const runtime = {
    hasThree: false,
    hasGsap: false,
    hasScrollTrigger: false,
    hasEnhanced: false
  };

  function detectRuntimeCapabilities() {
    runtime.hasThree = typeof window.THREE !== "undefined";
    runtime.hasGsap = typeof window.gsap !== "undefined";
    runtime.hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";
    runtime.hasEnhanced = runtime.hasThree && runtime.hasGsap && runtime.hasScrollTrigger;
  }

  detectRuntimeCapabilities();

  const frameStart = projectConfig.scenes[0].frames.start;
  const frameEnd = projectConfig.scenes[0].frames.end;

  const frameState = { index: frameStart };
  const sceneState = {
    beansWeight: 0,
    espressoWeight: 0,
    carouselWeight: 0,
    carouselSpin: 0
  };

  const frameCache = new Map();
  const frameInFlight = new Map();
  const framePatternState = {
    builder: null,
    detected: false,
    webpAvailable: false
  };
  let activeDescription = "";

  applyThemeTokens();
  setSceneDescription("hero");

  function applyThemeTokens() {
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--bg", projectConfig.theme.background);
    rootStyle.setProperty("--primary", projectConfig.theme.primary);
    rootStyle.setProperty("--accent", projectConfig.theme.accent);
    rootStyle.setProperty("--description", projectConfig.theme.description);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function normalizePath(path) {
    if (!path) {
      return "";
    }
    if (/^https?:\/\//i.test(path)) {
      return path;
    }
    if (window.location.protocol === "file:" && path.startsWith("/")) {
      return `.${path}`;
    }
    if (path.startsWith("/") || path.startsWith("./") || path.startsWith("../")) {
      return path;
    }
    return `./${path}`;
  }

  function asWebp(path) {
    return path.replace(/\.(png|jpe?g)$/i, ".webp");
  }

  function getFramePatternBuilders() {
    const sequencePath = projectConfig.assets.frameSequencePath;
    const prefix = projectConfig.assets.framePrefix;
    const ext = projectConfig.assets.frameExtension;
    return [
      function (index) {
        return `${sequencePath}${String(index).padStart(5, "0")}${ext}`;
      },
      function (index) {
        return `${sequencePath}${prefix}${String(index).padStart(5, "0")}${ext}`;
      },
      function (index) {
        return `${sequencePath}${prefix}${index}${ext}`;
      },
      function (index) {
        return `${sequencePath}${String(index).padStart(4, "0")}${ext}`;
      },
      function (index) {
        return `${sequencePath}${index}${ext}`;
      }
    ];
  }

  async function detectFramePattern() {
    if (framePatternState.detected) {
      return;
    }

    framePatternState.detected = true;
    const builders = getFramePatternBuilders();

    for (let i = 0; i < builders.length; i += 1) {
      const base = normalizePath(builders[i](frameStart));
      const probeCandidates = projectConfig.performance.useWebP ? [base, asWebp(base)] : [base];
      try {
        const image = await loadImageFromCandidates(probeCandidates);
        framePatternState.builder = builders[i];
        framePatternState.webpAvailable = /\.(webp)(\?|$)/i.test(image.currentSrc || image.src || "");
        frameCache.set(frameStart, image);
        return;
      } catch (error) {
        continue;
      }
    }

    framePatternState.builder = builders[0];
    framePatternState.webpAvailable = false;
  }

  function createFrameCandidates(index) {
    if (framePatternState.builder) {
      const base = normalizePath(framePatternState.builder(index));
      if (projectConfig.performance.useWebP && framePatternState.webpAvailable) {
        return [asWebp(base), base];
      }
      return [base];
    }

    const sequencePath = projectConfig.assets.frameSequencePath;
    const ext = projectConfig.assets.frameExtension;
    return [normalizePath(`${sequencePath}${String(index).padStart(5, "0")}${ext}`)];
  }

  function loadImageFromCandidates(candidates) {
    return new Promise((resolve, reject) => {
      let pointer = 0;

      const tryNext = function () {
        if (pointer >= candidates.length) {
          reject(new Error("Unable to load image candidates"));
          return;
        }

        const image = new Image();
        image.decoding = "async";
        image.loading = "eager";
        image.src = candidates[pointer];
        pointer += 1;

        image.onload = function () {
          resolve(image);
        };

        image.onerror = tryNext;
      };

      tryNext();
    });
  }

  function loadFrame(index) {
    const clamped = clamp(index, frameStart, frameEnd);

    if (frameCache.has(clamped)) {
      return Promise.resolve(frameCache.get(clamped));
    }

    if (frameInFlight.has(clamped)) {
      return frameInFlight.get(clamped);
    }

    const promise = loadImageFromCandidates(createFrameCandidates(clamped))
      .then((image) => {
        frameCache.set(clamped, image);
        frameInFlight.delete(clamped);
        return image;
      })
      .catch((error) => {
        frameInFlight.delete(clamped);
        throw error;
      });

    frameInFlight.set(clamped, promise);
    return promise;
  }

  function findNearestCachedFrame(target) {
    if (frameCache.has(target)) {
      return frameCache.get(target);
    }

    for (let offset = 1; offset <= frameEnd - frameStart; offset += 1) {
      const lower = target - offset;
      const upper = target + offset;
      if (lower >= frameStart && frameCache.has(lower)) {
        return frameCache.get(lower);
      }
      if (upper <= frameEnd && frameCache.has(upper)) {
        return frameCache.get(upper);
      }
    }

    return null;
  }

  function drawFrame(index) {
    const target = clamp(Math.round(index), frameStart, frameEnd);
    const exactImage = frameCache.get(target);
    const image = exactImage || findNearestCachedFrame(target);
    const width = frameCanvas.clientWidth;
    const height = frameCanvas.clientHeight;

    if (!image) {
      frameCtx.fillStyle = projectConfig.theme.background;
      frameCtx.fillRect(0, 0, width, height);
      loadFrame(target)
        .then(() => {
          drawFrame(target);
        })
        .catch(() => {
          return;
        });
      return;
    }

    const scale = Math.max(width / image.width, height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const x = (width - drawWidth) * 0.5;
    const y = (height - drawHeight) * 0.5;
    frameCtx.drawImage(image, x, y, drawWidth, drawHeight);

    if (!exactImage) {
      loadFrame(target).catch(() => {
        return;
      });
    }
  }

  function resizeFrameCanvas(shouldDraw) {
    const canDraw = shouldDraw !== false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    frameCanvas.width = Math.floor(window.innerWidth * dpr);
    frameCanvas.height = Math.floor(window.innerHeight * dpr);
    frameCanvas.style.width = `${window.innerWidth}px`;
    frameCanvas.style.height = `${window.innerHeight}px`;
    frameCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (canDraw) {
      drawFrame(frameState.index);
    }
  }

  function preloadSeedFrames() {
    const indices = [
      frameStart,
      frameStart + 1,
      frameStart + 2,
      Math.floor((frameEnd - frameStart) * 0.35),
      Math.floor((frameEnd - frameStart) * 0.7)
    ]
      .map((offset) => clamp(offset, frameStart, frameEnd))
      .filter((value, idx, array) => array.indexOf(value) === idx);

    return Promise.all(indices.map((index) => loadFrame(index).catch(() => null)));
  }

  function preloadIntroFrames() {
    const introBufferEnd = clamp(frameStart + 60, frameStart, frameEnd);
    const jobs = [];
    for (let index = frameStart; index <= introBufferEnd; index += 1) {
      jobs.push(loadFrame(index).catch(() => null));
    }
    return Promise.all(jobs);
  }

  function lazyLoadFrames() {
    const begin = function () {
      let pointer = frameStart + 1;
      const batchSize = 8;

      const enqueue = function () {
        const limit = Math.min(pointer + batchSize, frameEnd + 1);
        for (; pointer < limit; pointer += 1) {
          loadFrame(pointer).catch(() => null);
        }

        if (pointer <= frameEnd) {
          setTimeout(enqueue, 75);
        }
      };

      enqueue();
    };

    if (!projectConfig.performance.lazyLoadFrames) {
      begin();
      return;
    }

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(begin, { timeout: 1200 });
      return;
    }

    setTimeout(begin, 450);
  }

  function setSceneDescription(sceneId) {
    if (activeDescription === sceneId || !descriptionContent[sceneId]) {
      return;
    }

    activeDescription = sceneId;
    const payload = descriptionContent[sceneId];

    if (!runtime.hasGsap) {
      sceneDescriptionEl.textContent = payload.title;
      sceneDescriptionEl.style.color = projectConfig.theme.description;
      sceneSubtextEl.textContent = payload.subtext;
      return;
    }

    gsap.to([sceneDescriptionEl, sceneSubtextEl], {
      y: 16,
      opacity: 0,
      duration: 0.16,
      ease: "power1.out",
      stagger: 0.03,
      onComplete: function () {
        sceneDescriptionEl.textContent = payload.title;
        sceneDescriptionEl.style.color = projectConfig.theme.description;
        sceneSubtextEl.textContent = payload.subtext;
        gsap.to([sceneDescriptionEl, sceneSubtextEl], {
          y: 0,
          opacity: 1,
          duration: 0.36,
          ease: "power2.out",
          stagger: 0.04
        });
      }
    });
  }

  function buildBeansScene(scene) {
    const beanGroup = new THREE.Group();
    const beanGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const beanMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(projectConfig.theme.primary),
      shininess: 55,
      transparent: true,
      opacity: 0
    });
    const beans = [];
    const count = projectConfig.scenes[1].objects[0].count;

    for (let i = 0; i < count; i += 1) {
      const bean = new THREE.Mesh(beanGeometry, beanMaterial);
      const spread = 6.8;
      bean.position.set(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * 3.6,
        (Math.random() - 0.5) * spread
      );
      bean.scale.setScalar(0.8 + Math.random() * 0.85);
      bean.scale.y *= 0.78;
      bean.userData.phase = Math.random() * Math.PI * 2;
      bean.userData.baseY = bean.position.y;
      bean.userData.speed = 0.45 + Math.random() * 0.9;
      beans.push(bean);
      beanGroup.add(bean);
    }

    beanGroup.visible = false;
    scene.add(beanGroup);
    return { beanGroup, beanMaterial, beans };
  }

  function buildEspressoScene(scene) {
    const espressoGroup = new THREE.Group();
    const streamGeometry = new THREE.CylinderGeometry(0.065, 0.105, 2.7, 28, 1, true);
    const streamMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color("#3B1E16"),
      shininess: 90,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const stream = new THREE.Mesh(streamGeometry, streamMaterial);
    stream.position.y = 0.3;
    espressoGroup.add(stream);

    const ringGeometry = new THREE.TorusGeometry(0.28, 0.035, 16, 40);
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color("#6f4234"),
      transparent: true,
      opacity: 0
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI * 0.5;
    ring.position.y = -0.9;
    espressoGroup.add(ring);

    const dropletGeometry = new THREE.SphereGeometry(0.045, 8, 8);
    const dropletMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color("#4f271e"),
      transparent: true,
      opacity: 0
    });

    const droplets = [];
    for (let i = 0; i < 34; i += 1) {
      const droplet = new THREE.Mesh(dropletGeometry, dropletMaterial);
      droplet.userData.phase = Math.random();
      droplet.userData.speed = 0.6 + Math.random() * 0.8;
      droplet.position.set(0, 1.2, 0);
      droplets.push(droplet);
      espressoGroup.add(droplet);
    }

    espressoGroup.visible = false;
    scene.add(espressoGroup);
    return {
      espressoGroup,
      streamMaterial,
      ringMaterial,
      dropletMaterial,
      droplets
    };
  }

  function createLabelTexture(text) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    context.fillStyle = "rgba(5, 5, 5, 0.68)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(200, 155, 60, 0.65)";
    context.lineWidth = 4;
    context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
    context.fillStyle = "rgba(0, 255, 255, 0.96)";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "700 54px Rajdhani";
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 4);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  function clampTextureSize(texture, maxSize) {
    const image = texture.image;
    if (!image || !image.width || !image.height) {
      return texture;
    }

    if (image.width <= maxSize && image.height <= maxSize) {
      return texture;
    }

    const scale = Math.min(maxSize / image.width, maxSize / image.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(image.width * scale));
    canvas.height = Math.max(1, Math.floor(image.height * scale));
    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      texture.image = canvas;
      texture.needsUpdate = true;
    }
    return texture;
  }

  function loadTextureWithFallback(loader, primaryPath, fallbackPath, maxTextureSize) {
    const normalizedPrimary = normalizePath(primaryPath);
    const normalizedFallback = normalizePath(fallbackPath);
    const candidates = [normalizedPrimary];

    if (projectConfig.performance.useWebP) {
      candidates.unshift(asWebp(normalizedPrimary));
    }

    if (normalizedFallback && normalizedFallback !== normalizedPrimary) {
      if (projectConfig.performance.useWebP) {
        candidates.push(asWebp(normalizedFallback));
      }
      candidates.push(normalizedFallback);
    }

    const uniqueCandidates = [...new Set(candidates)];

    return new Promise((resolve) => {
      let pointer = 0;
      const loadNext = function () {
        if (pointer >= uniqueCandidates.length) {
          resolve(null);
          return;
        }

        const target = uniqueCandidates[pointer];
        pointer += 1;

        loader.load(
          target,
          function (texture) {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = 4;
            clampTextureSize(texture, maxTextureSize);
            resolve(texture);
          },
          undefined,
          loadNext
        );
      };

      loadNext();
    });
  }

  function buildCarouselScene(scene, maxTextureSize) {
    const carouselGroup = new THREE.Group();
    const radius = projectConfig.carouselCards.radius;
    const cardConfig = projectConfig.carouselCards.cards;
    const cardGeometry = new THREE.PlaneGeometry(1.85, 2.45);
    const borderGeometry = new THREE.PlaneGeometry(2.03, 2.63);
    const labelGeometry = new THREE.PlaneGeometry(1.62, 0.36);
    const loader = new THREE.TextureLoader();

    const cards = [];
    const fadeMaterials = [];
    const fallbackImage = projectConfig.assets.artImages.hero;

    cardConfig.forEach((card, index) => {
      const angle = (index / cardConfig.length) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.position.set(Math.cos(angle) * radius, 0.1, Math.sin(angle) * radius);
      holder.lookAt(0, 0, 0);

      const borderMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(projectConfig.theme.accent),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
      });
      const border = new THREE.Mesh(borderGeometry, borderMaterial);
      border.position.z = -0.02;
      holder.add(border);

      const cardMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color("#1a120e"),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
      });
      const imageCard = new THREE.Mesh(cardGeometry, cardMaterial);
      holder.add(imageCard);

      const labelTexture = createLabelTexture(card.title);
      const labelMaterial = new THREE.MeshBasicMaterial({
        map: labelTexture || null,
        transparent: true,
        opacity: 0
      });
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.set(0, -1.23, 0.02);
      holder.add(label);

      fadeMaterials.push({ material: borderMaterial, baseOpacity: 0.27 });
      fadeMaterials.push({ material: cardMaterial, baseOpacity: 0.95 });
      fadeMaterials.push({ material: labelMaterial, baseOpacity: 0.9 });

      loadTextureWithFallback(loader, card.image, fallbackImage, maxTextureSize).then((texture) => {
        if (!texture) {
          return;
        }
        cardMaterial.map = texture;
        cardMaterial.needsUpdate = true;
      });

      cards.push(holder);
      carouselGroup.add(holder);
    });

    carouselGroup.visible = false;
    scene.add(carouselGroup);

    return {
      carouselGroup,
      cards,
      fadeMaterials
    };
  }

  function initThreeWorld() {
    const renderer = new THREE.WebGLRenderer({
      canvas: threeCanvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearAlpha(0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(new THREE.Color(projectConfig.theme.background), 8, 25);

    const camera = new THREE.PerspectiveCamera(
      projectConfig.introSequence.camera.fov,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.fromArray(projectConfig.introSequence.camera.position);

    const ambientLight = new THREE.AmbientLight(
      new THREE.Color(projectConfig.introSequence.lighting.ambient.color),
      projectConfig.introSequence.lighting.ambient.intensity
    );
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      new THREE.Color(projectConfig.introSequence.lighting.directional.color),
      projectConfig.introSequence.lighting.directional.intensity
    );
    directionalLight.position.fromArray(projectConfig.introSequence.lighting.directional.position);
    scene.add(directionalLight);

    const fillLight = new THREE.PointLight(new THREE.Color("#7a4a35"), 0.75, 26);
    fillLight.position.set(-4, 2, 4);
    scene.add(fillLight);

    const safeTextureSize = Math.min(
      renderer.capabilities.maxTextureSize,
      projectConfig.performance.maxTextureSize
    );

    const beansState = buildBeansScene(scene);
    const espressoState = buildEspressoScene(scene);
    const carouselState = buildCarouselScene(scene, safeTextureSize);

    return {
      renderer,
      scene,
      camera,
      ...beansState,
      ...espressoState,
      ...carouselState
    };
  }

  function setupSceneDescriptionTriggers() {
    if (!runtime.hasEnhanced) {
      return;
    }

    document.querySelectorAll(".scroll-step").forEach((step) => {
      const sceneId = step.getAttribute("data-scene");
      if (!sceneId) {
        return;
      }

      ScrollTrigger.create({
        trigger: step,
        start: "top center",
        end: "bottom center",
        onEnter: function () {
          setSceneDescription(sceneId);
        },
        onEnterBack: function () {
          setSceneDescription(sceneId);
        }
      });
    });
  }

  function buildScrollTimeline(camera) {
    const scale = (projectConfig.interaction.gsapTimeline.duration || 4) / 4;
    const timeline = gsap.timeline({
      defaults: {
        ease: projectConfig.interaction.gsapTimeline.ease
      },
      scrollTrigger: {
        trigger: scrollTrackEl,
        start: "top top",
        end: "bottom bottom",
        scrub: projectConfig.interaction.gsapTimeline.scrub ? 1 : false
      }
    });

    timeline.to(
      frameState,
      {
        index: frameEnd,
        duration: 1.08 * scale,
        onUpdate: function () {
          drawFrame(frameState.index);
        }
      },
      0
    );

    timeline.to(
      frameCanvas,
      {
        opacity: 0,
        duration: 0.42 * scale,
        ease: "power1.out"
      },
      0.72 * scale
    );

    timeline.to(
      sceneState,
      {
        beansWeight: 1,
        duration: 1.16 * scale
      },
      0.82 * scale
    );

    timeline.to(
      camera.position,
      {
        x: 0,
        y: projectConfig.scenes[1].camera.position[1],
        z: projectConfig.scenes[1].camera.position[2],
        duration: 1.16 * scale
      },
      0.82 * scale
    );

    timeline.to(
      sceneState,
      {
        beansWeight: 0.23,
        duration: 0.9 * scale
      },
      1.95 * scale
    );

    timeline.to(
      sceneState,
      {
        espressoWeight: 1,
        duration: 1.12 * scale
      },
      1.95 * scale
    );

    timeline.to(
      camera.position,
      {
        x: 0,
        y: projectConfig.scenes[2].camera.position[1],
        z: projectConfig.scenes[2].camera.position[2],
        duration: 1.12 * scale
      },
      1.95 * scale
    );

    timeline.to(
      sceneState,
      {
        espressoWeight: 0.25,
        duration: 0.94 * scale
      },
      3.02 * scale
    );

    timeline.to(
      sceneState,
      {
        carouselWeight: 1,
        duration: 1.2 * scale
      },
      3.02 * scale
    );

    timeline.to(
      sceneState,
      {
        carouselSpin: Math.PI * 2,
        duration: 1.32 * scale,
        ease: "none"
      },
      3.02 * scale
    );

    timeline.to(
      camera.position,
      {
        x: 0,
        y: 1.4,
        z: 7.2,
        duration: 1.2 * scale
      },
      3.02 * scale
    );

    setupSceneDescriptionTriggers();
  }

  function trySetSessionFlag(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      return;
    }
  }

  function tryReadSessionFlag(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function tryClearSessionFlag(key) {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      return;
    }
  }

  function playFrameTween(toFrame, duration, onComplete) {
    if (runtime.hasGsap) {
      gsap.to(frameState, {
        index: toFrame,
        duration: duration,
        ease: "power2.inOut",
        onUpdate: function () {
          drawFrame(frameState.index);
        },
        onComplete: onComplete
      });
      return;
    }

    const from = frameState.index;
    const delta = toFrame - from;
    const startTime = performance.now();
    const total = Math.max(0.01, duration) * 1000;

    const tick = function (now) {
      const progress = clamp((now - startTime) / total, 0, 1);
      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      frameState.index = from + delta * eased;
      drawFrame(frameState.index);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else if (typeof onComplete === "function") {
        onComplete();
      }
    };

    requestAnimationFrame(tick);
  }

  function playIntro(startScrollTimeline, introReadyPromise) {
    const introKey = "immersive_coffee_intro_played";
    const replayRequested =
      new URLSearchParams(window.location.search).get("replayIntro") === "1";
    let skipIntro = !projectConfig.introSequence.autoPlay;

    if (replayRequested) {
      tryClearSessionFlag(introKey);
    }

    if (
      projectConfig.introSequence.playOnce &&
      !replayRequested &&
      tryReadSessionFlag(introKey) === "1"
    ) {
      skipIntro = true;
    }

    if (skipIntro) {
      document.body.classList.remove("is-intro");
      startScrollTimeline();
      return;
    }

    document.body.classList.add("is-intro");
    frameCanvas.style.opacity = "1";
    setSceneDescription("hero");

    introReadyPromise
      .catch(() => null)
      .finally(() => {
        playFrameTween(projectConfig.introSequence.stopFrame, projectConfig.introSequence.duration, function () {
          if (projectConfig.introSequence.playOnce) {
            trySetSessionFlag(introKey, "1");
          }
          document.body.classList.remove("is-intro");
          startScrollTimeline();
        });
      });
  }

  function runRenderLoop(world) {
    const clock = new THREE.Clock();
    const rotationSpeed = projectConfig.carouselCards.rotationSpeed;

    const tick = function () {
      const elapsed = clock.getElapsedTime();
      const beanWeight = sceneState.beansWeight;
      const espressoWeight = sceneState.espressoWeight;
      const carouselWeight = sceneState.carouselWeight;

      world.beanGroup.visible = beanWeight > 0.01;
      world.beanMaterial.opacity = 0.92 * beanWeight;
      world.beanGroup.rotation.y += 0.0012 + beanWeight * 0.0028;

      world.beans.forEach((bean, index) => {
        const phase = bean.userData.phase;
        const speed = bean.userData.speed;
        bean.position.y = bean.userData.baseY + Math.sin(elapsed * speed + phase) * 0.24;
        bean.rotation.x += 0.0028 + index * 0.00001;
        bean.rotation.y += 0.0032;
      });

      world.espressoGroup.visible = espressoWeight > 0.01;
      world.streamMaterial.opacity = 0.9 * espressoWeight;
      world.ringMaterial.opacity = 0.58 * espressoWeight;
      world.dropletMaterial.opacity = 0.88 * espressoWeight;

      world.droplets.forEach((droplet) => {
        const speed = droplet.userData.speed;
        const offset = (elapsed * speed + droplet.userData.phase) % 1;
        droplet.position.y = 1.6 - offset * 2.35;
        droplet.position.x = Math.sin((elapsed + droplet.userData.phase) * 5.4) * 0.17;
        droplet.position.z = Math.cos((elapsed + droplet.userData.phase) * 6.2) * 0.17;
      });

      world.carouselGroup.visible = carouselWeight > 0.01;
      world.carouselGroup.rotation.y =
        sceneState.carouselSpin + elapsed * rotationSpeed * carouselWeight;

      world.cards.forEach((card, index) => {
        card.position.y = 0.08 + Math.sin(elapsed * 1.2 + index * 0.8) * 0.1 * carouselWeight;
      });

      world.fadeMaterials.forEach((entry) => {
        entry.material.opacity = entry.baseOpacity * carouselWeight;
      });

      world.camera.lookAt(0, 0.45, 0);
      world.renderer.render(world.scene, world.camera);
      window.requestAnimationFrame(tick);
    };

    tick();
  }

  function bindResize(world) {
    let resizeTimer = 0;

    window.addEventListener(
      "resize",
      function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () {
          resizeFrameCanvas();
          world.camera.aspect = window.innerWidth / window.innerHeight;
          world.camera.updateProjectionMatrix();
          world.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          world.renderer.setSize(window.innerWidth, window.innerHeight);
          ScrollTrigger.refresh();
        }, 120);
      },
      { passive: true }
    );
  }

  function bindGlobalUiEvents() {
    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > 24) {
          document.body.classList.add("scrolled");
        } else {
          document.body.classList.remove("scrolled");
        }
      },
      { passive: true }
    );
  }

  function init3dMenuCards() {
    const cards = document.querySelectorAll(".menu-card");
    if (!cards.length) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;

    cards.forEach((card, index) => {
      const inner = card.querySelector(".menu-card-inner");
      const beam = card.querySelector(".menu-card-beam");
      if (!inner) {
        return;
      }

      card.style.setProperty("--float-delay", `${(index * 0.22).toFixed(2)}s`);
      if (reducedMotion) {
        card.style.animation = "none";
      }

      const reset = function () {
        inner.style.setProperty("--rx", "0deg");
        inner.style.setProperty("--ry", "0deg");
        inner.style.setProperty("--lift", "0px");
        if (beam) {
          beam.style.setProperty("--beam-x", "50%");
          beam.style.opacity = "0.35";
        }
      };

      reset();

      if (coarsePointer) {
        inner.style.setProperty("--lift", "-2px");
        if (beam) {
          beam.style.opacity = "0.45";
        }
        return;
      }

      card.addEventListener(
        "pointermove",
        function (event) {
          const rect = card.getBoundingClientRect();
          const px = clamp((event.clientX - rect.left) / rect.width, 0, 1);
          const py = clamp((event.clientY - rect.top) / rect.height, 0, 1);
          const ry = (px - 0.5) * 18;
          const rx = (0.5 - py) * 13;

          inner.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
          inner.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
          inner.style.setProperty("--lift", "-6px");

          if (beam) {
            beam.style.setProperty("--beam-x", `${(px * 100).toFixed(1)}%`);
            beam.style.opacity = "0.78";
          }
        },
        { passive: true }
      );

      card.addEventListener("pointerleave", reset, { passive: true });

      card.addEventListener(
        "pointerdown",
        function () {
          inner.style.setProperty("--lift", "-2px");
        },
        { passive: true }
      );

      card.addEventListener(
        "pointerup",
        function () {
          inner.style.setProperty("--lift", "-6px");
        },
        { passive: true }
      );
    });
  }

  function getScrollProgress() {
    const totalScroll = Math.max(scrollTrackEl.offsetHeight - window.innerHeight, 1);
    const scrolled = window.scrollY - scrollTrackEl.offsetTop;
    return clamp(scrolled / totalScroll, 0, 1);
  }

  function setDescriptionByProgress(progress) {
    if (progress < 0.25) {
      setSceneDescription("hero");
      return;
    }
    if (progress < 0.5) {
      setSceneDescription("coffeeBeans");
      return;
    }
    if (progress < 0.75) {
      setSceneDescription("espressoExtraction");
      return;
    }
    setSceneDescription("carousel");
  }

  function startFrameOnlyScrollMode() {
    frameCanvas.style.opacity = "1";
    threeCanvas.style.opacity = "0";

    const sync = function () {
      const progress = getScrollProgress();
      const targetFrame = frameStart + (frameEnd - frameStart) * progress;
      drawFrame(targetFrame);
      setDescriptionByProgress(progress);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
  }

  function waitForOptionalLibraries(timeoutMs) {
    return new Promise((resolve) => {
      const startTime = performance.now();

      const poll = function () {
        detectRuntimeCapabilities();
        if (runtime.hasEnhanced || performance.now() - startTime >= timeoutMs) {
          if (runtime.hasEnhanced && runtime.hasGsap && runtime.hasScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
          }
          resolve();
          return;
        }
        requestAnimationFrame(poll);
      };

      poll();
    });
  }

  function start() {
    waitForOptionalLibraries(1200).finally(() => {
      resizeFrameCanvas(false);

      const sequenceReady = detectFramePattern()
        .catch(() => null)
        .then(() => preloadSeedFrames())
        .catch(() => null)
        .finally(() => {
          drawFrame(frameState.index);
        });

      const introReady = sequenceReady
        .then(() => preloadIntroFrames())
        .catch(() => null);

      sequenceReady.finally(() => {
        lazyLoadFrames();
      });

      bindGlobalUiEvents();
      init3dMenuCards();

      if (!runtime.hasEnhanced) {
        playIntro(startFrameOnlyScrollMode, introReady);
        return;
      }

      const world = initThreeWorld();
      runRenderLoop(world);
      bindResize(world);

      let timelineCreated = false;
      const beginScrollTimeline = function () {
        if (timelineCreated) {
          return;
        }
        timelineCreated = true;
        buildScrollTimeline(world.camera);
        ScrollTrigger.refresh();
      };

      playIntro(beginScrollTimeline, introReady);
    });
  }

  start();
})();
