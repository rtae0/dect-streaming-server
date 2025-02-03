import os
import subprocess

# 📂 변환할 동영상이 있는 폴더
DATA_DIR = "./public/data"

# 🎥 지원하는 비디오 포맷 (확장자)
SUPPORTED_FORMATS = [".avi", ".mov", ".mkv", ".flv", ".wmv", ".webm"]

def convert_to_mp4(input_file):
    """FFmpeg를 사용하여 MP4로 변환"""
    output_file = os.path.splitext(input_file)[0] + ".mp4"
    
    # FFmpeg 변환 명령어
    command = [
        "ffmpeg",
        "-i", input_file,      # 입력 파일
        "-c:v", "libx264",     # H.264 인코딩
        "-preset", "fast",     # 빠른 변환
        "-crf", "23",          # 품질 조절 (낮을수록 고화질)
        "-c:a", "aac",         # 오디오 코덱
        "-b:a", "192k",        # 오디오 비트레이트
        "-movflags", "+faststart",  # 웹 최적화
        output_file
    ]

    print(f"🔄 변환 중: {input_file} → {output_file}")
    subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # 변환 완료 후 원본 삭제
    if os.path.exists(output_file):
        os.remove(input_file)
        print(f"✅ 변환 완료: {output_file}")

def process_videos():
    """폴더 내의 모든 동영상을 검사하고 변환"""
    for file in os.listdir(DATA_DIR):
        file_path = os.path.join(DATA_DIR, file)
        if os.path.isfile(file_path) and any(file.endswith(ext) for ext in SUPPORTED_FORMATS):
            convert_to_mp4(file_path)

if __name__ == "__main__":
    process_videos()