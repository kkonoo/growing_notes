# 앱 아이콘(icons/app-*.png) 그리기: 크림색 둥근 사각형 위에 새싹(떡잎 두 장) + 흙.
# maskable = 연한 세이지 배경을 꽉 채우고 새싹을 가운데 작게 (안드로이드·아이폰이 모양대로 잘라 씀)
# 실행: python tools/make-icons.py   (Pillow 필요: pip install pillow)
import math
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / 'icons'
S = 4  # 크게 그린 뒤 줄여서 테두리를 매끄럽게


def leaf(d, base, length, width, angle, color):
    """base에서 angle(도, 0 = 오른쪽, 90 = 위) 방향으로 뻗은 잎. 양 끝이 뾰족한 렌즈 모양"""
    a = math.radians(angle)
    ux, uy = math.cos(a), -math.sin(a)   # 잎 방향
    nx, ny = -uy, ux                     # 잎 폭 방향
    pts = []
    for side in (1, -1):
        for i in range(41):
            t = i / 40 if side == 1 else 1 - i / 40
            half = width / 2 * math.sin(math.pi * t) ** 0.85
            pts.append((base[0] + ux * length * t + nx * half * side, base[1] + uy * length * t + ny * half * side))
    d.polygon(pts, fill=color)


def sprout(d, cx, cy, k):
    """cx, cy = 줄기 아래 끝, k = 크기 (512 기준 1.0) × S"""
    d.ellipse((cx - 125 * k, cy - 30 * k, cx + 125 * k, cy + 42 * k), fill='#A7825F')   # 흙
    top = (cx, cy - 165 * k)
    d.rounded_rectangle((cx - 10 * k, top[1], cx + 10 * k, cy + 4 * k), radius=10 * k, fill='#4E7D52')  # 줄기
    leaf(d, top, 150 * k, 86 * k, 150, '#6FA572')  # 왼쪽 떡잎
    leaf(d, top, 150 * k, 86 * k, 30, '#5B8A5F')   # 오른쪽 떡잎


def icon(maskable):
    n = 512 * S
    img = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if maskable:
        d.rectangle((0, 0, n, n), fill='#EAF1E6')
        sprout(d, n / 2, n * 0.68, 0.78 * S)
    else:
        d.rounded_rectangle((32 * S, 32 * S, n - 32 * S, n - 32 * S), radius=110 * S, fill='#FFF8F0')
        sprout(d, n / 2, n * 0.74, 1.0 * S)
    return img


for maskable in (False, True):
    big = icon(maskable)
    for size in (192, 512):
        name = f"app-{'maskable-' if maskable else ''}{size}.png"
        big.resize((size, size), Image.LANCZOS).save(OUT / name, optimize=True)
        print('saved', name)
