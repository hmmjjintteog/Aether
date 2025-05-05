// Three.js 임포트 (HTML에서 로드됨)
// THREE 전역 변수 사용

// 씬 설정
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

// DOM 요소
const canvas = document.getElementById('phoneCanvas');
const overlay = document.getElementById('screen-overlay');


// 휴대폰 크기 (적당한 크기)
const phoneW = 220;
const phoneH = 400;
const phoneDepth = 15;

// 휴대폰 상태
let isPhonePowered = false;
let currentVolume = 5; // 0-10 범위
let phoneObject;
let screenMesh;
let screenLight;
let powerButtonMesh;
let volUpMesh;
let volDownMesh;

// 홈 화면 이미지 경로
const homeScreenImage = 'img/background.jpg'; // 홈 화면 이미지 경로

// 3D 씬 초기화
function init3D() {
  // 렌더러 설정
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  const canvasContainer = document.getElementById('phoneCanvas');
  canvasContainer.appendChild(renderer.domElement);

  // 카메라 위치 설정
  camera.position.set(0, 0, 650);
  camera.lookAt(0, 0, 0);

  // 주변광 추가
  const ambientLight = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambientLight);

  // 방향성 조명 추가
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // 더 나은 조명을 위해 반대편에서 추가 조명 추가
  const fillLight = new THREE.DirectionalLight(0xccccff, 0.5);
  fillLight.position.set(-1, 0.5, -1);
  scene.add(fillLight);

  // 휴대폰 생성
  createPhone();

  // 마우스 상호작용을 위한 이벤트 리스너 추가
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd);
  
  // 애니메이션 루프 시작
  animate();
}

// 휴대폰과 모든 구성 요소 생성
function createPhone() {
  // 휴대폰 그룹 생성
  phoneObject = new THREE.Group();
  scene.add(phoneObject);

  // 휴대폰 기본 - 둥근 직사각형
  const phoneGeometry = createRoundedRectangle(phoneW, phoneH, phoneDepth, 40);
  const phoneMaterial = new THREE.MeshPhongMaterial({
    color: 0x1a1a1a, // 어두운 회색
    specular: 0x111111,
    shininess: 100
  });
  const phoneMesh = new THREE.Mesh(phoneGeometry, phoneMaterial);
  phoneObject.add(phoneMesh);

  // 화면
  const screenWidth = phoneW * 0.9;
  const screenHeight = phoneH * 0.85;
  const screenGeometry = createRoundedRectangle(screenWidth, screenHeight, 20, 20);
  const screenMaterial = new THREE.MeshPhongMaterial({
    color: 0x000000,
    emissive: 0x000000,
    specular: 0x222222,
    shininess: 50
  });
  screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
  screenMesh.position.z = phoneDepth / 2 + 0.5;
  phoneObject.add(screenMesh);

  // 화면 조명 추가 (전원이 켜질 때 활성화됨)
  screenLight = new THREE.PointLight(0x0088ff, 0, 500);
  screenLight.position.z = phoneDepth / 2 + 50;
  phoneObject.add(screenLight);

  // 버튼 추가
  createButtons();
}

// 휴대폰 버튼 생성
function createButtons() {
  // 전원 버튼 (오른쪽)
  const powerGeometry = new THREE.BoxGeometry(5, 40, 8);
  const buttonMaterial = new THREE.MeshPhongMaterial({
    color: 0x333333,
    specular: 0x666666,
    shininess: 30
  });
  powerButtonMesh = new THREE.Mesh(powerGeometry, buttonMaterial);
  powerButtonMesh.position.set(phoneW/2 + 2.5, 0, 0);
  powerButtonMesh.userData.type = 'power';
  phoneObject.add(powerButtonMesh);

  // 볼륨 업 버튼 (왼쪽)
  const volUpGeometry = new THREE.BoxGeometry(5, 30, 8);
  volUpMesh = new THREE.Mesh(volUpGeometry, buttonMaterial);
  volUpMesh.position.set(-phoneW/2 - 2.5, 50, 0);
  volUpMesh.userData.type = 'volUp';
  phoneObject.add(volUpMesh);

  // 볼륨 다운 버튼 (왼쪽)
  const volDownGeometry = new THREE.BoxGeometry(5, 30, 8);
  volDownMesh = new THREE.Mesh(volDownGeometry, buttonMaterial);
  volDownMesh.position.set(-phoneW/2 - 2.5, 0, 0);
  volDownMesh.userData.type = 'volDown';
  phoneObject.add(volDownMesh);
}

// 둥근 직사각형 지오메트리 생성
function createRoundedRectangle(width, height, depth, radius) {
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

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  return geometry;
}

// 창 크기 조정 처리
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// 드래그 가능한 휴대폰을 위한 변수들
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationSpeed = { x: 0, y: 0 };
let rotationSmoothness = 0.95; // 값이 클수록 더 부드러운 회전
let dragSensitivity = 0.0003; // 값이 작을수록 회전에 덜 민감함
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let isButtonInteraction = false;

// 마우스 이동 처리 - 드래그 가능한 휴대폰
function onMouseMove(event) {
  if (!isDragging) return;
  
  const deltaX = event.clientX - previousMousePosition.x;
  const deltaY = event.clientY - previousMousePosition.y;
  
  rotationSpeed.y += deltaX * dragSensitivity;
  rotationSpeed.x += deltaY * dragSensitivity;
  
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  };
}

// 애니메이션 루프
function animate() {
  requestAnimationFrame(animate);
  
  // 감쇠와 함께 회전 모멘텀 적용
  if (phoneObject) {
    // 드래그하지 않을 때 회전을 감속시키기 위한 감쇠 적용
    rotationSpeed.x *= rotationSmoothness;
    rotationSpeed.y *= rotationSmoothness;
    
    // 회전 적용
    phoneObject.rotation.x += rotationSpeed.x;
    phoneObject.rotation.y += rotationSpeed.y;
    
    // 자동 회전 없음 - 드래그 시에만 이동
  }
  
  // 휴대폰 화면의 위치와 일치하도록 오버레이 위치 업데이트
  if (isPhonePowered) {
    updateOverlayPosition();
  }
  
  renderer.render(scene, camera);
}

// 휴대폰 전원 켜기
function powerOn() {
  isPhonePowered = true;
  
  // 부팅 애니메이션을 표시하고 오버레이를 보이게 함
  overlay.innerHTML = 'ETHENOS';
  overlay.style.display = 'flex'; // 표시되는지 확인
  overlay.classList.add('active');
  
  // 빛을 발하도록 화면 재질 변경
  screenMesh.material.emissive.setHex(0x001122);
  screenLight.intensity = 1;
  
  // 고정된 부팅 시간 4초 설정
  const bootTime = 4000; // 밀리초 단위로 4초
  const updateInterval = 50; // 50ms마다 진행상황 업데이트
  const steps = bootTime / updateInterval;
  const progressIncrement = 100 / steps;
  
  let progress = 0;
  const bootInterval = setInterval(() => {
    progress += progressIncrement;
    const displayProgress = Math.min(Math.round(progress), 100);
    overlay.innerHTML = `ETHENOS<br><div class="progress"><div class="bar" style="width:${displayProgress}%"></div></div>`;
    
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
function showHomeScreen() {
  // 외부 이미지와 함께 홈 화면 생성
  try {
    // 이미지 배경을 사용할지 기본 앱 그리드를 사용할지 확인
    if (homeScreenImage) {
      overlay.innerHTML = `
        <div class="home-screen" style="background-image: url('${homeScreenImage}'); background-size: cover; background-position: center;">
          <div class="time">${getCurrentTime()}</div>
          <div class="date">${getCurrentDate()}</div>
        </div>
      `;
    } else {
      // 원래 앱 그리드 디자인으로 대체
      overlay.innerHTML = `
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
    overlay.style.display = 'flex';
    overlay.classList.add('active');
    
    // 전원이 켜진 모습을 위해 화면 재질 업데이트
    screenMesh.material.emissive.setHex(0x003366);
    screenLight.intensity = 2;
    
    console.log("홈 화면이 성공적으로 표시됨");
  } catch (err) {
    console.error("홈 화면 표시 오류:", err);
    
    // 문제가 발생한 경우 대체 디스플레이
    overlay.innerHTML = `
      <div class="home-screen">
        <div class="time">${getCurrentTime()}</div>
        <div class="date">${getCurrentDate()}</div>
        <div>시스템 오류</div>
      </div>
    `;
  }
}

// 휴대폰 전원 끄기
function powerOff() {
  isPhonePowered = false;
  overlay.classList.remove('active');
  overlay.style.display = 'none';
  overlay.innerHTML = '';
  screenMesh.material.emissive.setHex(0x000000);
  screenLight.intensity = 0;
}

// 전원 토글
function togglePower() {
  if (isPhonePowered) {
    powerOff();
  } else {
    powerOn();
  }
}

// 볼륨 표시기 표시
function showVolumeIndicator() {
  if (isPhonePowered) {
    const volumeIndicator = document.createElement('div');
    volumeIndicator.className = 'volume-indicator';
    volumeIndicator.innerHTML = `볼륨: ${currentVolume}`;
    overlay.appendChild(volumeIndicator);
    setTimeout(() => volumeIndicator.remove(), 1000);
  }
}

// 시계 표시를 위한 현재 시간 가져오기
function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 표시를 위한 현재 날짜 가져오기
function getCurrentDate() {
  const now = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  return now.toLocaleDateString('ko-KR', options);
}

// 버튼이 클릭되었는지 확인
function checkButtonClick(event) {
  // 마우스 위치를 정규화된 좌표로 변환
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // 레이캐스터 업데이트
  raycaster.setFromCamera(mouse, camera);
  
  // 버튼과의 교차점 확인
  const intersects = raycaster.intersectObjects([powerButtonMesh, volUpMesh, volDownMesh]);
  
  if (intersects.length > 0) {
    isButtonInteraction = true;
    const button = intersects[0].object;
    
    // 버튼 클릭 처리
    if (button.userData.type === 'power') {
      togglePower();
    } else if (button.userData.type === 'volUp') {
      if (currentVolume < 10) currentVolume++;
      showVolumeIndicator();
    } else if (button.userData.type === 'volDown') {
      if (currentVolume > 0) currentVolume--;
      showVolumeIndicator();
    }
    
    // 시각적 피드백
    const originalColor = button.material.color.getHex();
    button.material.color.setHex(0x555555);
    setTimeout(() => {
      button.material.color.setHex(originalColor);
    }, 100);
    
    return true;
  }
  
  return false;
}

// 마우스/터치 이벤트 핸들러
function onMouseDown(event) {
  if (checkButtonClick(event)) {
    event.preventDefault();
    return;
  }
  
  isDragging = true;
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  };
  event.preventDefault();
}

function onMouseUp() {
  isDragging = false;
  isButtonInteraction = false;
}

function onTouchStart(event) {
  // 버튼 체크를 위해 터치를 마우스 같은 이벤트로 변환
  const touch = event.touches[0];
  const mouseEvent = {
    clientX: touch.clientX,
    clientY: touch.clientY
  };
  
  if (checkButtonClick(mouseEvent)) {
    event.preventDefault();
    return;
  }
  
  if (event.touches.length === 1) {
    isDragging = true;
    previousMousePosition = {
      x: touch.clientX,
      y: touch.clientY
    };
  }
  event.preventDefault();
}

function onTouchMove(event) {
  if (isButtonInteraction) {
    event.preventDefault();
    return;
  }
  
  if (isDragging && event.touches.length === 1) {
    const deltaX = event.touches[0].clientX - previousMousePosition.x;
    const deltaY = event.touches[0].clientY - previousMousePosition.y;
    
    rotationSpeed.y += deltaX * dragSensitivity;
    rotationSpeed.x += deltaY * dragSensitivity;
    
    previousMousePosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }
  event.preventDefault();
}

function onTouchEnd() {
  isDragging = false;
  isButtonInteraction = false;
}

// 휴대폰의 3D 공간 위치와 일치하도록 오버레이 위치 업데이트 함수
function updateOverlayPosition() {
  if (!phoneObject || !screenMesh) return;
  
  // 3D 공간에서 휴대폰 화면 위치 가져오기
  const screenPosition = new THREE.Vector3();
  screenMesh.getWorldPosition(screenPosition);
  
  // 3D 위치를 화면 좌표로 투영
  screenPosition.project(camera);
  
  // CSS 좌표로 변환
  const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-(screenPosition.y) * 0.5 + 0.5) * window.innerHeight;
  
  // 휴대폰 회전에 따른 화면 방향 조정 계산
  const rotationY = phoneObject.rotation.y;
  const rotationX = phoneObject.rotation.x;
  
  // 휴대폰이 주로 카메라를 향할 때만 오버레이 업데이트
  // 이는 휴대폰이 회전되어 멀어질 때 UI가 표시되는 것을 방지함
  const phoneVisible = Math.abs(rotationY) < 1.0 && Math.abs(rotationX) < 1.0;
  
  if (phoneVisible) {
    // 휴대폰 방향에 따라 위치 조정
    const scaleFactor = 1 - Math.abs(rotationY) * 0.3;
    
    // 원근법에 맞게 조정된 화면 폭/높이 계산
    const adjustedWidth = phoneW * 0.85 * scaleFactor;
    const adjustedHeight = phoneH * 0.75 * scaleFactor;
    
    // 오버레이 크기 및 위치 업데이트
    overlay.style.width = `${adjustedWidth}px`;
    overlay.style.height = `${adjustedHeight}px`;
    overlay.style.top = `${y}px`;
    overlay.style.left = `${x}px`;
    overlay.style.transform = `translate(-50%, -50%) rotateY(${rotationY}rad) rotateX(${-rotationX}rad)`;
    
    // 회전 각도에 따라 투명도 조정하여 회전 시 페이드 효과 적용
    const visibilityFactor = 1 - (Math.abs(rotationY) + Math.abs(rotationX)) / 2;
    overlay.style.opacity = Math.max(0, visibilityFactor);
  } else {
    // 휴대폰이 너무 많이 회전되었을 때 오버레이 숨기기
    overlay.style.opacity = 0;
  }
}

// 모든 것 초기화
function init() {
  // CSS 오버레이 설정
  setupOverlay();
  
  // 3D 씬 초기화
  init3D();
  
  // 버튼 상호작용을 위한 레이캐스터 초기화
  raycaster = new THREE.Raycaster();
}

// 오버레이 스타일 및 위치 설정
function setupOverlay() {
  // 휴대폰 화면과 일치하도록 오버레이 크기 조정
  const screenWidth = phoneW * 0.9;
  const screenHeight = phoneH * 0.85;
  
  overlay.style.position = 'absolute';
  overlay.style.top = '50%';
  overlay.style.left = '50%';
  overlay.style.transform = 'translate(-50%, -50%)';
  overlay.style.width = `${screenWidth}px`;
  overlay.style.height = `${screenHeight}px`;
  overlay.style.borderRadius = '15px';
  overlay.style.backgroundColor = '#000';
  overlay.style.color = '#0af';
  overlay.style.fontFamily = '"Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif';
  overlay.style.textAlign = 'center';
  overlay.style.fontSize = '5px';
  overlay.style.padding = '10px';
  overlay.style.zIndex = '2';
  overlay.style.display = 'none'; // 처음에는 숨김
  overlay.style.flexDirection = 'column';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  
  // 창 크기 조정 및 애니메이션 중 오버레이 위치 업데이트
  window.addEventListener('resize', updateOverlayPosition);
}

// 문서가 로드되면 초기화 실행
window.addEventListener('DOMContentLoaded', init);