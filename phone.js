import { config, utils } from './index.js';
import { createRoundedRectangle } from './main.js';
import * as THREE from 'three';

// 휴대폰과 모든 구성 요소 생성
export function createPhone() {
  // 휴대폰 그룹 생성
  config.phoneObject = new THREE.Group();
  utils.scene.add(config.phoneObject);

  // 휴대폰 본체 생성
  createPhoneBody();
  
  // 휴대폰 화면 생성
  createPhoneScreen();
  
  // 휴대폰 버튼 생성
  createPhoneButtons();
}

// 휴대폰 본체 생성
function createPhoneBody() {
  const phoneGeometry = createRoundedRectangle(
    config.phoneW, 
    config.phoneH, 
    config.phoneDepth, 
    40
  );
  
  const phoneMaterial = new THREE.MeshPhongMaterial({
    color: 0x1a1a1a, // 어두운 회색
    specular: 0x111111,
    shininess: 100
  });
  
  const phoneMesh = new THREE.Mesh(phoneGeometry, phoneMaterial);
  config.phoneObject.add(phoneMesh);
}

// 휴대폰 화면 생성
function createPhoneScreen() {
  const screenWidth = config.phoneW * 0.9;
  const screenHeight = config.phoneH * 0.85;
  
  const screenGeometry = createRoundedRectangle(screenWidth, screenHeight, 20, 20);
  const screenMaterial = new THREE.MeshPhongMaterial({
    color: 0x000000,
    emissive: 0x000000,
    specular: 0x222222,
    shininess: 50
  });
  
  config.screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
  config.screenMesh.position.z = config.phoneDepth / 2 + 0.5;
  config.phoneObject.add(config.screenMesh);

  // 화면 조명 추가 (전원이 켜질 때 활성화됨)
  config.screenLight = new THREE.PointLight(0x0088ff, 0, 500);
  config.screenLight.position.z = config.phoneDepth / 2 + 50;
  config.phoneObject.add(config.screenLight);
}

// 휴대폰 버튼 생성

function createPhoneButtons() {
  // 버튼 재질
  const buttonMaterial = new THREE.MeshPhongMaterial({
    color: 0x333333,
    specular: 0x666666,
    shininess: 30
  });
  // 전원 버튼 (오른쪽)
  createPowerButton(buttonMaterial);

  // 볼륨 버튼 (왼쪽)
  createVolumeButtons(buttonMaterial);
}

// 전원 버튼 생성

function createPowerButton(material) {
  const powerGeometry = new THREE.BoxGeometry(5, 40, 8);
  config.powerButtonMesh = new THREE.Mesh(powerGeometry, material);
  config.powerButtonMesh.position.set(config.phoneW/2 + 2.5, 0, 0);
  config.powerButtonMesh.userData.type = 'power';
  config.phoneObject.add(config.powerButtonMesh);
}

// 볼륨 버튼 생성

function createVolumeButtons(material) {

  // 볼륨 업 버튼

  const volUpGeometry = new THREE.BoxGeometry(5, 30, 8);
  config.volUpMesh = new THREE.Mesh(volUpGeometry, material);
  config.volUpMesh.position.set(-config.phoneW/2 - 2.5, 50, 0);
  config.volUpMesh.userData.type = 'volUp';
  config.phoneObject.add(config.volUpMesh);

  // 볼륨 다운 버튼

  const volDownGeometry = new THREE.BoxGeometry(5, 30, 8);
  config.volDownMesh = new THREE.Mesh(volDownGeometry, material);
  config.volDownMesh.position.set(-config.phoneW/2 - 2.5, 0, 0);
  config.volDownMesh.userData.type = 'volDown';
  config.phoneObject.add(config.volDownMesh);
}