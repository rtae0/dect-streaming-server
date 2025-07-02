# 📺 DECT Streaming Server

> **DECT Streaming Server**는 개인용 비디오 스트리밍 및 관리 시스템입니다.  
> **Next.js**, **SQLite**, **yt-dlp**를 기반으로 동영상을 다운로드, 관리, 스트리밍할 수 있습니다.

---

## ✨ 주요 기능
✅ **비디오 다운로드**: YouTube, Twitter 등의 URL을 입력하여 동영상 다운로드  
✅ **자동 썸네일 생성**: Python을 이용한 썸네일 자동 생성 (`ffmpeg` 활용)  
✅ **태그 및 필터링 지원**: 카테고리별 태그 정렬 및 검색 기능  
✅ **즐겨찾기 및 조회수 기록**: 즐겨찾기 등록 및 하루 1회 조회수 증가 제한  
✅ **USB 파일 복사 및 변환**: USB에서 파일 가져오기, MP4 변환 기능  
✅ **데이터 동기화**: 다운로드 폴더와 DB를 자동으로 동기화  

---

## 🏗️ 기술 스택
| 기술        | 설명 |
|------------|------|
| **Next.js 14** | React 기반 프레임워크 |
| **SQLite** | 경량 데이터베이스 |
| **FFmpeg** | 영상 및 썸네일 처리 |
| **Python** | 썸네일 생성용 스크립트 |

# 프로젝트 설치 가이드 (라즈베리파이)

## 필수 요구사항
- 라즈베리파이 OS (Raspberry Pi OS)
- Node.js
- Python 3.x (기본 설치됨)
- Git

## 설치 과정

### 1. 시스템 업데이트 및 기본 패키지 설치
```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Git 설치 (설치되지 않은 경우)
sudo apt install git -y

# 기본 개발 도구 설치
sudo apt install build-essential -y
```

### 2. Node.js 설치
```bash
# Node.js 설치 (권장: LTS 버전)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# 또는 snap 사용
# sudo snap install node --classic

# 설치 확인
node --version
npm --version
```

### 3. 프로젝트 클론 및 기본 설정
```bash
# 프로젝트 클론
git clone [your-repository-url]
cd dect-streaming-server

# Node.js 의존성 설치
npm install

# 권한 문제 발생시
sudo npm install

# 보안 취약점 해결 (선택사항)
npm audit fix
```

### 4. 데이터베이스 관련 패키지 설치
```bash
# SQLite 관련 패키지
npm install sqlite3 sqlite

# 컴파일 에러 발생시 추가 패키지 설치
sudo apt install libsqlite3-dev -y

# 또는 더 안정적인 대안
npm install better-sqlite3
```

### 5. Python 이미지 처리 라이브러리 설치
```bash
# Python 패키지 관리자 업데이트
sudo apt install python3-pip -y

# OpenCV 의존성 설치
sudo apt install libopencv-dev python3-opencv -y
sudo apt install libatlas-base-dev libjasper-dev libqtgui4 libqt4-test -y

# Python 라이브러리 설치
pip3 install opencv-python-headless
pip3 install Pillow numpy

# 또는 한번에 설치
pip3 install opencv-python-headless Pillow numpy
```

### 6. USB 자동 마운트 설정 (선택사항)
```bash
# USB 자동 마운트를 위한 설정
sudo apt install usbmount -y

# 또는 수동 마운트 디렉토리 생성
sudo mkdir -p /media/pi/
sudo mkdir -p /mnt/usb/
```

### 7. 미디어 파일 저장소 설정 (중요)
```bash
# 외부 SSD 또는 저장장치 마운트 (예시)
sudo mkdir -p /mnt/ssd
sudo mount /dev/sda1 /mnt/ssd

# 미디어 파일용 디렉토리 생성
sudo mkdir -p /mnt/ssd/data

# 프로젝트에서 외부 저장소 접근을 위한 심볼릭 링크 생성 (필수)
cd /path/to/dect-streaming-server/public
rm -rf data  # 기존 data 폴더가 있다면 삭제
ln -s /mnt/ssd/data data

# 권한 설정
sudo chown -R pi:pi /mnt/ssd/data
sudo chmod -R 755 /mnt/ssd/data
```

> **⚠️ 중요**: 이 단계는 필수입니다. 심볼릭 링크가 없으면 웹 애플리케이션에서 비디오 파일에 접근할 수 없습니다.

### 8. 프로젝트 실행
```bash
# 개발 서버 실행
npm run dev

# 또는 프로덕션 모드
npm run build
npm start

# 기본적으로 http://localhost:3000 에서 실행됩니다
# 라즈베리파이 IP로 외부 접속: http://[라즈베리파이IP]:3000
```

### 8. 서비스 등록 (자동 시작 설정)
```bash
# systemd 서비스 파일 생성
sudo nano /etc/systemd/system/dect-streaming.service

# 다음 내용 추가:
# [Unit]
# Description=DECT Streaming Server
# After=network.target
# 
# [Service]
# Type=simple
# User=pi
# WorkingDirectory=/home/pi/dect-streaming-server
# ExecStart=/usr/bin/npm start
# Restart=always
# 
# [Install]
# WantedBy=multi-user.target

# 서비스 활성화
sudo systemctl enable dect-streaming.service
sudo systemctl start dect-streaming.service
```

## 주요 기능
- Next.js + TypeScript 기반 웹 애플리케이션
- SQLite 데이터베이스 연동
- 동영상 썸네일 자동 생성 (OpenCV, PIL 사용)
- USB 드라이브 파일 자동 복사 기능
- 라즈베리파이 최적화

## 문제 해결

### Node.js 컴파일 에러
```bash
# 메모리 부족시 스왑 파일 생성
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# CONF_SWAPSIZE=1024 로 변경
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### Python 모듈 에러
```bash
# 권한 문제 해결
sudo pip3 install opencv-python-headless Pillow numpy

# 또는 사용자 설치
pip3 install --user opencv-python-headless Pillow numpy
```

### USB 마운트 확인
```bash
# 연결된 USB 확인
lsblk
df -h

# 수동 마운트
sudo mount /dev/sda1 /media/pi/usb
```

### 설치 확인
```bash
# Node.js 모듈 확인
npm list

# Python 모듈 확인
python3 -c "import cv2, PIL; print('모든 모듈 설치 완료')"

# 서비스 상태 확인
sudo systemctl status dect-streaming.service
```

## 성능 최적화 팁
- 라즈베리파이 4 이상 권장 (최소 4GB RAM)
- 고속 SD카드 사용 (Class 10 이상)
- 필요시 외부 SSD 사용
- GPU 메모리 할당: `sudo raspi-config` → Advanced Options → Memory Split → 128
