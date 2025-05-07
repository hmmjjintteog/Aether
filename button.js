// button.js - 버튼 상호작용 관련 기능
import { config, utils } from './index.js';
import { togglePower, showVolumeIndicator } from './screen.js';

// 상호작용 설정

export function setupInteractions() {
  // 마우스/터치 이벤트 리스너 추가
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd);
}

// 버튼이 클릭되었는지 확인

export function checkButtonClick(event) {

  // 마우스 위치를 정규화된 좌표로 변환

  utils.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  utils.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // 레이캐스터 업데이트

  utils.raycaster.setFromCamera(utils.mouse, utils.camera);

  // 버튼과의 교차점 확인

  const intersects = utils.raycaster.intersectObjects([
    config.powerButtonMesh, 
    config.volUpMesh, 
    config.volDownMesh
  ]);
  
  if (intersects.length > 0) {
    config.isButtonInteraction = true;
    const button = intersects[0].object;

    // 버튼 클릭 처리

    if (button.userData.type === 'power') {
      togglePower();
    } else if (button.userData.type === 'volUp') {
      if (config.currentVolume < 10) config.currentVolume++;
      showVolumeIndicator();
    } else if (button.userData.type === 'volDown') {
      if (config.currentVolume > 0) config.currentVolume--;
      showVolumeIndicator();
    }
    // 시각적 피드백 제공
    buttonFeedback(button);
    return true;
  }
  return false;
}

// 버튼 클릭 시각적 피드백

function buttonFeedback(button) {
  const originalColor = button.material.color.getHex();
  button.material.color.setHex(0x555555);
  setTimeout(() => {
    button.material.color.setHex(originalColor);
  }, 100);
}

// 마우스 이동 처리 - 드래그 가능한 휴대폰

export function onMouseMove(event) {
  if (!config.isDragging) return;

  const deltaX = event.clientX - config.previousMousePosition.x;
  const deltaY = event.clientY - config.previousMousePosition.y;

  config.rotationSpeed.y += deltaX * config.dragSensitivity;
  config.rotationSpeed.x += deltaY * config.dragSensitivity;

  config.previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  };
}

// 마우스 다운 이벤트 처리

export function onMouseDown(event) {
  if (checkButtonClick(event)) {
    event.preventDefault();
    return;
  }

  config.isDragging = true;

  config.previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  };
  event.preventDefault();
}

// 마우스 업 이벤트 처리

export function onMouseUp() {
  config.isDragging = false;
  config.isButtonInteraction = false;
}

// 터치 시작 이벤트 처리

export function onTouchStart(event) {
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

    config.isDragging = true;
    config.previousMousePosition = {
      x: touch.clientX,
      y: touch.clientY
    };
  }
  event.preventDefault();
}

// 터치 이동 이벤트 처리

export function onTouchMove(event) {
  if (config.isButtonInteraction) {
    event.preventDefault();
    return;
  }

  if (config.isDragging && event.touches.length === 1) {
    const deltaX = event.touches[0].clientX - config.previousMousePosition.x;
    const deltaY = event.touches[0].clientY - config.previousMousePosition.y;

    config.rotationSpeed.y += deltaX * config.dragSensitivity;
    config.rotationSpeed.x += deltaY * config.dragSensitivity;

    config.previousMousePosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }
  event.preventDefault();
}

// 터치 종료 이벤트 처리

export function onTouchEnd() {
  config.isDragging = false;
  config.isButtonInteraction = false;
}