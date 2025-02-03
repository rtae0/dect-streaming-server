import os
import shutil

# 📌 USB 드라이브 경로 설정
USB_PATHS = ["/media/pi/", "/mnt/usb"]
DATA_FOLDER = "/home/pi/act/public/data/"  # 🔥 data 폴더 위치 (Next.js에서 접근 가능)

def find_usb():
    """연결된 USB 드라이브 경로 반환"""
    for path in USB_PATHS:
        if os.path.exists(path):
            usb_devices = [os.path.join(path, d) for d in os.listdir(path)]
            for usb in usb_devices:
                if os.path.ismount(usb):
                    return usb
    return None

def copy_files(src, dest):
    """USB에서 data 폴더로 파일 복사"""
    if not os.path.exists(dest):
        os.makedirs(dest)

    copied_files = []
    for root, _, files in os.walk(src):
        for file in files:
            src_path = os.path.join(root, file)
            dest_path = os.path.join(dest, file)
            shutil.copy2(src_path, dest_path)
            copied_files.append(file)

    return copied_files

if __name__ == "__main__":
    usb_path = find_usb()

    if usb_path:
        print(f"✅ USB 드라이브 감지됨: {usb_path}")
        copied_files = copy_files(usb_path, DATA_FOLDER)
        print(f"✅ {len(copied_files)}개 파일 복사 완료")
    else:
        print("❌ USB 드라이브를 찾을 수 없습니다.")