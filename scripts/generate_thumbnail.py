import os
import subprocess
import cv2
import numpy as np
from PIL import Image
import sys

# 🎯 FFprobe로 영상 길이 가져오기
def get_video_duration(video_path):
    cmd = [
        "ffprobe", "-v", "error", "-select_streams", "v:0", 
        "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1",
        video_path
    ]
    
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    if result.returncode != 0 or not result.stdout.strip():
        print(f"❌ FFprobe 오류: {result.stderr.strip()}")
        raise RuntimeError("FFprobe 실행 실패! FFmpeg가 설치되어 있는지 확인하세요.")

    try:
        return float(result.stdout.strip())
    except ValueError:
        print(f"❌ 변환 실패: '{result.stdout.strip()}'")
        raise ValueError("영상 길이를 숫자로 변환할 수 없습니다.")

# 🎯 FFmpeg로 프레임을 메모리에서 직접 가져오기
def extract_frames(video_path, frame_count=16, scale_factor=0.25):
    duration = get_video_duration(video_path)
    
    # 🔥 인트로 10%와 아웃트로 5% 제거
    start_time = duration * 0.10  # 🔥 시작 시간 (전체 길이의 10% 지점)
    end_time = duration * 0.95    # 🔥 끝 시간 (전체 길이의 95% 지점)
    timestamps = [start_time + (i / frame_count) * (end_time - start_time) for i in range(frame_count)]
    
    extracted_frames = []
    
    for timestamp in timestamps:
        cmd = [
            "ffmpeg", "-y", "-ss", str(timestamp), "-i", video_path, 
            "-frames:v", "1", "-vf", f"scale=iw*{scale_factor}:ih*{scale_factor}",  # ✅ 영상 크기 기반 스케일 조정
            "-f", "image2pipe", "-vcodec", "png", "pipe:1"
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)

        # OpenCV로 메모리에서 이미지 변환
        np_arr = np.frombuffer(result.stdout, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            raise RuntimeError("FFmpeg가 올바른 이미지를 반환하지 않았습니다.")

        extracted_frames.append(img)

    return extracted_frames

# 🎯 16장의 이미지를 하나의 PNG로 병합
def create_mosaic(frames, output_file, cols=4, rows=4):
    h, w, _ = frames[0].shape
    grid_image = np.zeros((h * rows, w * cols, 3), dtype=np.uint8)

    for i, img in enumerate(frames):
        row = i // cols
        col = i % cols
        grid_image[row * h:(row + 1) * h, col * w:(col + 1) * w] = img

    # OpenCV에서 Pillow 이미지 변환 후 저장
    mosaic = Image.fromarray(cv2.cvtColor(grid_image, cv2.COLOR_BGR2RGB))
    mosaic.save(output_file, optimize=True, quality=85)  # ✅ 최적화 저장

# 🎯 전체 프로세스 실행 (파일 저장 없이 메모리에서 처리)
def generate_video_thumbnail(video_path, output_file):
    frames = extract_frames(video_path, scale_factor=1/4)  # ✅ `/16` 최적화 적용
    create_mosaic(frames, output_file)
    print(f"✅ 썸네일 저장 완료: {output_file}")

# 실행 예제 (CLI 인자 받기)
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("❌ 사용법: python3 generate_thumbnail.py <비디오 경로> <출력 파일명>")
        sys.exit(1)

    video_path = sys.argv[1]  # 입력된 비디오 파일
    output_thumbnail = sys.argv[2]  # 같은 이름의 PNG 파일
    generate_video_thumbnail(video_path, output_thumbnail)