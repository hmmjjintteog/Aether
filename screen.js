// screen.js - 화면 인터페이스 및 UI 관련 기능
import { config, utils } from './index.js';
import * as THREE from 'three';

// 휴대폰 전원 켜기
export function powerOn() {
  config.isPhonePowered = true;
  
  // 부팅 애니메이션을 표시하고 오버레이를 보이게 함
  config.overlay.innerHTML = 'ETHENOS';
  config.overlay.style.display = 'flex';
  config.overlay.classList.add('active');
  
  // 빛을 발하도록 화면 재질 변경
  if (config.screenMesh && config.screenMesh.material) {
    config.screenMesh.material.emissive.setHex(0x001122);
  }
  
  if (config.screenLight) {
    config.screenLight.intensity = 1;
  }
  
  // 부팅 시퀀스 시작
  startBootSequence();
}

// 부팅 시퀀스 시작
function startBootSequence() {
  // 고정된 부팅 시간 4초 설정
  const bootTime = 4000; // 밀리초 단위로 4초
  const updateInterval = 50; // 50ms마다 진행상황 업데이트
  const steps = bootTime / updateInterval;
  const progressIncrement = 100 / steps;
  
  let progress = 0;
  const bootInterval = setInterval(() => {
    progress += progressIncrement;
    const displayProgress = Math.min(Math.round(progress), 100);
    
    if (config.overlay) {
      config.overlay.innerHTML = `ETHENOS<br><div class="progress"><div class="bar" style="width:${displayProgress}%"></div></div>`;
    }
    
    if (progress >= 100) {
      clearInterval(bootInterval);
      showHomeScreen();
    }
  }, updateInterval);
  
  // 애니메이션 상태와 관계없이 정확히 4초 후에 홈 화면이 표시되도록 보장
  setTimeout(() => {
    clearInterval(bootInterval);
    showHomeScreen();
  }, bootTime);
}

// 홈 화면 표시 함수
export function showHomeScreen() {
  try {
    if (!config.overlay) {
      console.error("오버레이 요소를 찾을 수 없음");
      return;
    }
    
    // 이미지 배경 또는 기본 앱 그리드 표시
    if (config.homeScreenImage) {
      config.overlay.innerHTML = `
        <div class="home-screen" style="background-image: url('./img/background.jpg'); background-size: cover; background-position: center;">
          <div class="time">${getCurrentTime()}</div>
          <div class="date">${getCurrentDate()}</div>
        </div>
      `;
    } else {
      config.overlay.innerHTML = `
        <div class="home-screen">
          <div class="time">${getCurrentTime()}</div>
          <div class="date">${getCurrentDate()}</div>
          <div class="app-grid">
            <div class="app">📱</div>
            <div class="app">📧</div>
            <div class="app">🌐</div>
            <div class="app">📷</div>
            <div class="app">🎵</div>
            <div class="app">🗓️</div>
            <div class="app">⚙️</div>
            <div class="app">🎮</div>
          </div>
        </div>
      `;
    }
    
    // 오버레이가 계속 보이도록 보장
    config.overlay.style.display = 'flex';
    config.overlay.classList.add('active');
    
    // 전원이 켜진 모습을 위해 화면 재질 업데이트
    if (config.screenMesh && config.screenMesh.material) {
      config.screenMesh.material.emissive.setHex(0x003366);
    }
    
    if (config.screenLight) {
      config.screenLight.intensity = 2;
    }
    
    console.log("홈 화면이 성공적으로 표시됨");
  } catch (err) {
    console.error("홈 화면 표시 오류:", err);
    
    if (config.overlay) {
      // 문제가 발생한 경우 대체 디스플레이
      config.overlay.innerHTML = `
        <div class="home-screen">
          <div class="time">${getCurrentTime()}</div>
          <div class="date">${getCurrentDate()}</div>
          <div>시스템 오류</div>
        </div>
      `;
    }
  }
}

// 휴대폰 전원 끄기
export function powerOff() {
  config.isPhonePowered = false;
  
  if (config.overlay) {
    config.overlay.classList.remove('active');
    config.overlay.style.display = 'none';
    config.overlay.innerHTML = '';
  }
  
  if (config.screenMesh && config.screenMesh.material) {
    config.screenMesh.material.emissive.setHex(0x000000);
  }
  
  if (config.screenLight) {
    config.screenLight.intensity = 0;
  }
}

// 전원 토글
export function togglePower() {
  if (config.isPhonePowered) {
    powerOff();
  } else {
    powerOn();
  }
}

// 볼륨 표시기 표시
export function showVolumeIndicator() {
  if (config.isPhonePowered && config.overlay) {
    const volumeIndicator = document.createElement('div');
    volumeIndicator.className = 'volume-indicator';
    volumeIndicator.innerHTML = `볼륨: ${config.currentVolume}`;
    config.overlay.appendChild(volumeIndicator);
    setTimeout(() => volumeIndicator.remove(), 1000);
  }
}

// 브라우저 줌 레벨 설정 (Firefox 기준 170%)
function setInitialZoom() {
  // 기본 줌 설정 (Firefox 기준 170%)
  const targetZoom = 1.7; // 170%
  
  // meta viewport 태그를 활용하여 초기 줌 설정
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    // 기존 viewport 태그가 있으면 내용 수정
    viewport.setAttribute('content', `width=device-width, initial-scale=${targetZoom}, user-scalable=yes`);
  } else {
    // viewport 태그가 없으면 새로 생성
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = `width=device-width, initial-scale=${targetZoom}, user-scalable=yes`;
    document.head.appendChild(meta);
  }
  
  // Firefox 170% 줌에 맞게 CSS 변수 설정
  document.documentElement.style.setProperty('--initial-zoom', targetZoom);
  
  console.log(`브라우저 초기 줌 레벨이 ${targetZoom * 100}%로 설정됨`);
}

// 오버레이 스타일 및 위치 설정
export function setupOverlay() {
  if (!config.overlay) {
    console.error("오버레이 요소를 찾을 수 없음");
    return;
  }
  
  // 초기 줌 레벨 설정 (Firefox 기준 170%)
  // 페이지 로드 시 바로 줌 레벨 설정
  setInitialZoom();
  
  // 휴대폰 화면과 일치하도록 오버레이 스타일링
  const screenWidth = config.phoneW * 0.9;
  const screenHeight = config.phoneH * 0.85;
  
  const overlay = config.overlay;
  overlay.style.position = 'absolute';
  overlay.style.width = `${screenWidth}px`;
  overlay.style.height = `${screenHeight}px`;
  overlay.style.borderRadius = '15px';
  overlay.style.backgroundColor = '#000';
  overlay.style.color = '#0af';
  overlay.style.fontFamily = '"Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif';
  overlay.style.textAlign = 'center';
  overlay.style.fontSize = '16px';
  overlay.style.padding = '10px';
  overlay.style.zIndex = '2';
  overlay.style.display = 'none'; // 처음에는 숨김
  overlay.style.flexDirection = 'column';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.boxSizing = 'border-box'; // 패딩이 크기에 포함되도록 설정
  
  // CSS 변환 대신 3D 변환 사용 준비
  overlay.style.transformStyle = 'preserve-3d';
  overlay.style.backfaceVisibility = 'hidden';
  
  console.log("오버레이 설정 완료:", {
    width: overlay.style.width,
    height: overlay.style.height
  });
  
  // 창 크기 조정 시 오버레이 위치 업데이트
  window.addEventListener('resize', updateOverlayPosition);
  
  // 브라우저 줌 레벨 변경 감지를 위한 이벤트 추가
  window.visualViewport.addEventListener('resize', updateOverlayPosition);
  window.visualViewport.addEventListener('scroll', updateOverlayPosition);
}

// 휴대폰의 3D 공간 위치와 일치하도록 오버레이 위치 업데이트
export function updateOverlayPosition() {
  if (!config.phoneObject || !config.screenMesh || !config.overlay) {
    return;
  }
  
  // 보이지 않을 경우 계산 건너뛰기
  if (!config.isPhonePowered) {
    config.overlay.style.display = 'none';
    return;
  }
  
  // 3D 공간에서 휴대폰 화면의 모서리 위치 계산
  const screenGeometry = config.screenMesh.geometry;
  const screenMaterial = config.screenMesh.material;
  
  // 휴대폰 화면의 위치와 회전
  const phoneMatrix = new THREE.Matrix4();
  config.screenMesh.updateMatrixWorld();
  phoneMatrix.copy(config.screenMesh.matrixWorld);
  
  // 화면 중앙점 계산
  const centerPoint = new THREE.Vector3(0, 0, config.phoneDepth / 2 + 1);
  centerPoint.applyMatrix4(phoneMatrix);
  
  // 3D 위치를 화면 좌표로 변환
  const screenCenter = centerPoint.clone().project(utils.camera);
  
  // 휴대폰 회전 값을 가져옴
  const quaternion = new THREE.Quaternion();
  config.phoneObject.getWorldQuaternion(quaternion);
  const euler = new THREE.Euler().setFromQuaternion(quaternion);
  
  // 휴대폰이 정면에서 얼마나 회전되었는지 계산
  const facingCamera = Math.abs(Math.cos(euler.y));
  
  // CSS 픽셀 좌표로 변환
  const x = (screenCenter.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-screenCenter.y * 0.5 + 0.5) * window.innerHeight;
  
  // 브라우저 줌 레벨 감지 및 보정
  let zoomFactor = 1;
  if (window.visualViewport) {
    zoomFactor = window.visualViewport.scale;
  }
  
  // CSS 변수로 설정된 초기 줌 레벨을 고려한 조정
  const initialZoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--initial-zoom')) || 1.7;
  
  // 휴대폰 방향에 따른 가시성 및 크기 조정
  let visibility = facingCamera;
  
  // 스케일링 계수 (휴대폰이 회전될 때 화면 크기 조정)
  // zoomFactor를 초기 줌 레벨(1.7)로 나눠 정규화
  const normalizedZoom = zoomFactor / initialZoom;
  const screenWidth = (config.phoneW * 0.9 * facingCamera) / normalizedZoom;
  const screenHeight = (config.phoneH * 0.85 * facingCamera) / normalizedZoom;
  
  // 화면이 카메라를 향하지 않으면 가시성 줄이기
  if (facingCamera < 0.2) {
    visibility = 0;
  }
  
  // CSS 3D 변환 적용
  // 1. 회전: 휴대폰의 방향과 일치
  // 2. 크기: 거리와 회전에 따라 조정
  // 3. 위치: 3D 공간의 투영된 위치
  
  if (visibility > 0) {
    config.overlay.style.display = 'flex';
    config.overlay.style.opacity = visibility;
    config.overlay.style.width = `${screenWidth}px`;
    config.overlay.style.height = `${screenHeight}px`;
    config.overlay.style.left = `${x}px`;
    config.overlay.style.top = `${y}px`;
    
    // 3D 변환 적용 (회전과 위치를 결합)
    config.overlay.style.transform = `
      translate(-50%, -50%)
      rotateX(${-euler.x}rad)
      rotateY(${euler.y}rad)
      rotateZ(${euler.z}rad)
    `;
  } else {
    // 화면이 카메라를 향하지 않으면 숨김
    config.overlay.style.opacity = 0;
  }
}

// 시계 표시를 위한 현재 시간 가져오기
export function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 표시를 위한 현재 날짜 가져오기
export function getCurrentDate() {
  const now = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  return now.toLocaleDateString('ko-KR', options);
}