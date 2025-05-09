import { config, utils } from '../main.js';
import { createPhone } from './phone.js';
import { updateOverlayPosition } from './screen.js';
import * as THREE from 'three';



// 3D 씬 초기화

export function init3D() {

  // 씬 생성

  utils.scene = new THREE.Scene();  

  // 카메라 생성

  utils.camera = new THREE.PerspectiveCamera(
    45, window.innerWidth / window.innerHeight, 0.1, 1000
  );

  // 렌더러 생성

  utils.renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true 
  });

  // 렌더러 설정

  utils.renderer.setSize(window.innerWidth, window.innerHeight);
  utils.renderer.setPixelRatio(window.devicePixelRatio); // 고해상도 디스플레이 지원
  utils.renderer.setClearColor(0x000000, 0);

  // DOM에 렌더러 추가

  const canvasContainer = document.getElementById('phoneCanvas');
  canvasContainer.appendChild(utils.renderer.domElement);
  
  // 카메라 위치 설정

  utils.camera.position.set(0, 0, 650);
  utils.camera.lookAt(0, 0, 0);

  // 주변광 추가

  const ambientLight = new THREE.AmbientLight(0x404040, 2);
  utils.scene.add(ambientLight);

  // 방향성 조명 추가

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1);
  utils.scene.add(directionalLight);

  // 반대편에서 추가 조명 추가

  const fillLight = new THREE.DirectionalLight(0xccccff, 0.5);
  fillLight.position.set(-1, 0.5, -1);
  utils.scene.add(fillLight);

  // 휴대폰 생성

  createPhone();

  // 레이캐스터 초기화

  utils.raycaster = new THREE.Raycaster();
  utils.mouse = new THREE.Vector2();

  // 창 크기 조정 이벤트 리스너

  window.addEventListener('resize', onWindowResize);

  // 애니메이션 루프 시작

  animate();  

  // 초기 오버레이 위치 설정

  setTimeout(updateOverlayPosition, 100);

}

// 창 크기 조정 처리

export function onWindowResize() {
  if (utils.camera && utils.renderer) {
    utils.camera.aspect = window.innerWidth / window.innerHeight;
    utils.camera.updateProjectionMatrix();
    utils.renderer.setSize(window.innerWidth, window.innerHeight);
    utils.renderer.setPixelRatio(window.devicePixelRatio);

    // 오버레이 위치도 즉시 업데이트
    updateOverlayPosition();
  }
}

// 시간 기반 애니메이션 시스템

let lastTime = 0;
const fps = 60;
const frameTime = 1000 / fps;

// 애니메이션 루프

export function animate(currentTime = 0) {
  requestAnimationFrame(animate);

  // 시간 기반 애니메이션을 위한 델타 시간 계산

  const deltaTime = currentTime - lastTime;  

  // 목표 프레임 레이트에 맞춰 애니메이션 실행

  if (deltaTime > frameTime) {
    lastTime = currentTime - (deltaTime % frameTime);

    if (config.phoneObject) {
      // 드래그하지 않을 때 회전을 감속시키기 위한 감쇠 적용
      config.rotationSpeed.x *= config.rotationSmoothness;
      config.rotationSpeed.y *= config.rotationSmoothness;

      // 회전 적용

      config.phoneObject.rotation.x += config.rotationSpeed.x;
      config.phoneObject.rotation.y += config.rotationSpeed.y;

      // 일정 범위 내로 회전 제한 (선택적)
      config.phoneObject.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, config.phoneObject.rotation.x));
    }    

    // 휴대폰 화면의 위치와 일치하도록 오버레이 위치 업데이트

    if (config.isPhonePowered) {
      updateOverlayPosition();
    }
    utils.renderer.render(utils.scene, utils.camera);
  }
}

// 둥근 직사각형 지오메트리 생성 - 여러 모듈에서 사용

export function createRoundedRectangle(width, height, depth, radius) {
  const shape = new THREE.Shape();

  const x = -width / 2;
  const y = -height / 2;

  shape.moveTo(x, y + radius);
  shape.lineTo(x, y + height - radius);
  shape.quadraticCurveTo(x, y + height, x + radius, y + height);
  shape.lineTo(x + width - radius, y + height);
  shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  shape.lineTo(x + width, y + radius);
  shape.quadraticCurveTo(x + width, y, x + width - radius, y);
  shape.lineTo(x + radius, y);
  shape.quadraticCurveTo(x, y, x, y + radius);

  const extrudeSettings = {
    depth: depth,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 1,
    bevelThickness: 1
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}
