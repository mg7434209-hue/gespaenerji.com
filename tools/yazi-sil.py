"""Kullanim: python3 tools/yazi-sil.py GIRIS.png CIKIS.png '[[x,y],...]'
(gereksinim: opencv-python-headless, numpy)

Ornek (motor-golf-panelli.png, 9 Eki 2026):
  '[[466,158],[640,152],[640,170],[466,177]]'

Panel cercevesindeki tedarikci yazisini (M.S. TECHNIK + telefon) siler.
Elle olculen dortgen icindeki KOYU pikseller maskelenir ve OpenCV Telea
inpaint ile cevredeki gumus cerceveden doldurulur."""
import sys, json, numpy as np, cv2
def clean(src, dst, poly, thr=150):
    a = cv2.imread(src)
    m = np.zeros(a.shape[:2], np.uint8)
    cv2.fillPoly(m, [np.array(poly, np.int32)], 255)
    gray = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY)
    mask = ((gray < thr) & (m > 0)).astype(np.uint8) * 255
    mask = cv2.dilate(mask, np.ones((3, 3), np.uint8), iterations=1) & m
    out = cv2.inpaint(a, mask, 4, cv2.INPAINT_TELEA)
    cv2.imwrite(dst, out)
if __name__ == '__main__':
    clean(sys.argv[1], sys.argv[2], json.loads(sys.argv[3]))
