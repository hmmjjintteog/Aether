import { init3D, onWindowResize, animate } from './main.js';
import { setupOverlay, updateOverlayPosition } from './screen.js';
import { setupInteractions } from './button.js';

// 글로벌 변수 - 다른 모듈에서 접근 가능

export const config = {

  // 휴대폰 크기

  phoneW: 220,
  phoneH: 400,
  phoneDepth: 15,

  // 휴대폰 상태

  isPhonePowered: false,
  currentVolume: 5, // 0-10 범위

  // 3D 객체 참조

  phoneObject: null,
  screenMesh: null,
  screenLight: null,
  powerButtonMesh: null,
  volUpMesh: null,
  volDownMesh: null,

  // 홈 화면 이미지 - 이미지가 없으므로 null로 설정

  homeScreenImage: null, // 'img/background.jpg'에서 변경

  // DOM 요소 (초기화 시 설정)

  canvas: null,
  overlay: null,

  // 드래그 상태 관리

  isDragging: false,
  previousMousePosition: { x: 0, y: 0 },
  rotationSpeed: { x: 0, y: 0 },
  rotationSmoothness: 0.95,
  dragSensitivity: 0.0003,
  isButtonInteraction: false
};

// 전역 객체

export const utils = {
  raycaster: null,
  mouse: null,
  camera: null,
  scene: null,
  renderer: null
};

// 초기화

function init() {
  config.canvas = document.getElementById('phoneCanvas');
  config.overlay = document.getElementById('screen-overlay');
  setupOverlay();
  init3D();
  setupInteractions();

  console.log("초기화 완료: ", {
    canvas: config.canvas,
    overlay: config.overlay,
    scene: utils.scene,
    camera: utils.camera
  });
}

window.addEventListener('DOMContentLoaded', init);