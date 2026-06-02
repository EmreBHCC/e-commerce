import cv2
import numpy as np
import os
import mediapipe as mp
import time
import math
from scipy.spatial.transform import Rotation as Rscipy
from collections import deque
import pyautogui
import threading
import keyboard
import argparse
import json as _json
import re as _re

import tkinter as tk

# ── CLI ARGÜMANLARI ──────────────────────────────────────────────
_parser = argparse.ArgumentParser(add_help=False)
_parser.add_argument('--session',    default='denek',  help='Oturum / denek adı')
_parser.add_argument('--output-dir', dest='output_dir', default=None, help='Heatmap çıkış dizini')
_args, _ = _parser.parse_known_args()

_SESSION_NAME = _args.session
_BASE_DIR_ET  = os.path.dirname(os.path.abspath(__file__))
_OUTPUT_DIR   = _args.output_dir or os.path.join(_BASE_DIR_ET, 'data', 'heatmaps')
_STOP_FILE    = os.path.join(_BASE_DIR_ET, 'data', 'eyetracker_stop')
os.makedirs(_OUTPUT_DIR, exist_ok=True)
print(f'[EyeTracker] Oturum: {_SESSION_NAME}  |  Çıkış: {_OUTPUT_DIR}')

class GazeCursor:
    def __init__(self):
        self.root = tk.Tk()
        self.root.overrideredirect(True)
        self.root.attributes("-topmost", True)
        self.root.attributes("-transparentcolor", "white")
        self.root.config(bg="white")
        
        self.canvas = tk.Canvas(self.root, width=60, height=60, bg="white", highlightthickness=0)
        self.canvas.pack()
        self.outer = self.canvas.create_oval(5, 5, 55, 55, outline="cyan", width=3)
        self.inner = self.canvas.create_oval(25, 25, 35, 35, fill="red") 
        
        self.root.update()

    def update_position(self, x, y):
        x = max(0, min(x, MONITOR_WIDTH - 60))
        y = max(0, min(y, MONITOR_HEIGHT - 60))
        self.root.geometry(f"+{int(x)}+{int(y)}")
        self.root.update()



# HEATMAP SINIFI - Gaze noktalarını biriktirir ve heatmap üretir
class GazeHeatmap:
    def __init__(self, width, height, decay=0.998, blur_size=61, max_points=5000):
        """
        width, height   : Ekran çözünürlüğü (MONITOR_WIDTH, MONITOR_HEIGHT)
        decay           : Her karede akümülatör ne kadar söner (1.0 = hiç sönmez)
        blur_size       : Gaussian kernel boyutu (tek sayı, büyüklük ısı yayılımını etkiler)
        max_points      : Saklanacak max ham nokta sayısı (kayıt için)
        """
        self.width  = width
        self.height = height
        self.decay  = decay
        self.blur_size = blur_size if blur_size % 2 == 1 else blur_size + 1
        self.accumulator = np.zeros((height, width), dtype=np.float32)
        self.raw_points = deque(maxlen=max_points)
        self.colormap = cv2.COLORMAP_JET
        self.alpha = 0.55
        self.visible = False
        self.show_preview = False

    def add_point(self, sx, sy):
        """Bir gaze noktası ekle (ekran koordinatları)."""
        sx = int(np.clip(sx, 0, self.width  - 1))
        sy = int(np.clip(sy, 0, self.height - 1))
        self.accumulator[sy, sx] += 1.0
        self.raw_points.append((sx, sy))

    def apply_decay(self):
        """Her kare çağrılırsa eski noktalar yavaşça solar."""
        if self.decay < 1.0:
            self.accumulator *= self.decay

    def _build_colored(self):
        """Akümülatörden renklendirilmiş heatmap üretir (BGR uint8)."""
        blurred = cv2.GaussianBlur(self.accumulator, (self.blur_size, self.blur_size), 0)
        max_val = blurred.max()
        if max_val < 1e-6:
            return np.zeros((self.height, self.width, 3), dtype=np.uint8)
        normalized = np.clip(blurred / max_val, 0.0, 1.0)
        gray8 = (normalized * 255).astype(np.uint8)
        colored = cv2.applyColorMap(gray8, self.colormap)
        return colored

    def overlay_on_frame(self, frame):
        """
        BGR kamera karesi üzerine heatmap overlay'i yaz.
        frame boyutu (h, w) MONITOR boyutuyla aynı değilse yeniden ölçekler.
        """
        if not self.visible:
            return frame

        colored = self._build_colored()

        fh, fw = frame.shape[:2]
        if (fw, fh) != (self.width, self.height):
            colored = cv2.resize(colored, (fw, fh))

        heat_mask = cv2.cvtColor(colored, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(heat_mask, 5, 255, cv2.THRESH_BINARY)
        mask3 = cv2.merge([mask, mask, mask]).astype(bool)

        blended = frame.copy()
        blended[mask3] = cv2.addWeighted(frame, 1 - self.alpha, colored, self.alpha, 0)[mask3]
        return blended


    def show_preview_window(self, win_w=400, win_h=300):
        """Küçük ayrı önizleme penceresi."""
        colored = self._build_colored()
        preview = cv2.resize(colored, (win_w, win_h))

        cv2.putText(preview, f"Gaze Heatmap  pts={len(self.raw_points)}",
                    (8, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1, cv2.LINE_AA)
        cv2.imshow("Gaze Heatmap Preview", preview)

    def save_png(self, path="gaze_heatmap.png", background=None):
        """
        Heatmap'i PNG olarak kaydeder.
        background : None → siyah zemin, BGR ndarray → o görüntünün üstüne overlay
        """
        colored = self._build_colored()
        if background is not None:
            bg = cv2.resize(background, (self.width, self.height))
            heat_mask = cv2.cvtColor(colored, cv2.COLOR_BGR2GRAY)
            _, mask = cv2.threshold(heat_mask, 5, 255, cv2.THRESH_BINARY)
            mask3 = cv2.merge([mask, mask, mask]).astype(bool)
            out = bg.copy()
            out[mask3] = cv2.addWeighted(bg, 1 - self.alpha, colored, self.alpha, 0)[mask3]
        else:
            out = colored
        cv2.imwrite(path, out)
        print(f"[Heatmap] Kaydedildi → {path}  ({len(self.raw_points)} nokta)")

    def save_raw_csv(self, path="gaze_points.csv"):
        """Ham gaze noktalarını CSV'ye yazar."""
        with open(path, 'w') as f:
            f.write("x,y\n")
            for (x, y) in self.raw_points:
                f.write(f"{x},{y}\n")
        print(f"[Heatmap] CSV kaydedildi → {path}  ({len(self.raw_points)} nokta)")

    def reset(self):
        """Tüm veriyi sıfırla."""
        self.accumulator[:] = 0.0
        self.raw_points.clear()
        print("[Heatmap] Sıfırlandı.")


MONITOR_WIDTH, MONITOR_HEIGHT = pyautogui.size()
CENTER_X = MONITOR_WIDTH // 2
CENTER_Y = MONITOR_HEIGHT // 2
mouse_control_enabled = False
filter_length = 25
gaze_length = 350

# Orbit camera state for the debug view
orbit_yaw   = -151.0
orbit_pitch = 00.0
orbit_radius = 1500.0
orbit_fov_deg = 50.0

# Debug-view world freeze
debug_world_frozen = False
orbit_pivot_frozen = None

# Stored gaze markers on the monitor plane
gaze_markers = []

#3D monitor plane state (world space)
monitor_corners = None
monitor_center_w = None
monitor_normal_w = None
units_per_cm = None

# Shared mouse target position
mouse_target = [CENTER_X, CENTER_Y]
mouse_lock = threading.Lock()

# Calibration offsets for screen mapping
calibration_offset_yaw = 0
calibration_offset_pitch = 0

calib_step = 0

combined_gaze_directions = deque(maxlen=filter_length)

R_ref_nose = [None]
R_ref_forehead = [None]
calibration_nose_scale = None

# === Heatmap nesnesi ===
gaze_heatmap = GazeHeatmap(
    width=MONITOR_WIDTH,
    height=MONITOR_HEIGHT,
    decay=0.9995,
    blur_size=81,
    max_points=10000
)

# Initialize MediaPipe FaceMesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

cap = cv2.VideoCapture(0)
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

nose_indices = [4, 45, 275, 220, 440, 1, 5, 51, 281, 44, 274, 241, 
                461, 125, 354, 218, 438, 195, 167, 393, 165, 391,
                3, 248]

screen_position_file = "screen_position.txt"

def write_screen_position(x, y):
    with open(screen_position_file, 'w') as f:
        f.write(f"{x},{y}\n")

def _rot_x(a):
    ca, sa = math.cos(a), math.sin(a)
    return np.array([[1, 0, 0],[0, ca, -sa],[0, sa, ca]], dtype=float)

def _rot_y(a):
    ca, sa = math.cos(a), math.sin(a)
    return np.array([[ca, 0, sa],[0, 1, 0],[-sa, 0, ca]], dtype=float)

def _normalize(v):
    v = np.asarray(v, dtype=float)
    n = np.linalg.norm(v)
    return v / n if n > 1e-9 else v

def _focal_px(width, fov_deg):
    return 0.5 * width / math.tan(math.radians(fov_deg) * 0.5)


def create_monitor_plane(head_center, R_final, face_landmarks, w, h,
                         forward_hint=None, gaze_origin=None, gaze_dir=None):
    try:
        lm_chin = face_landmarks[152]
        lm_fore = face_landmarks[10]
        chin_w = np.array([lm_chin.x * w, lm_chin.y * h, lm_chin.z * w], dtype=float)
        fore_w = np.array([lm_fore.x * w, lm_fore.y * h, lm_fore.z * w], dtype=float)
        face_h_units = np.linalg.norm(fore_w - chin_w)
        upc = face_h_units / 15.0
    except Exception:
        upc = 5.0

    dist_cm = 50.0
    mon_w_cm, mon_h_cm = 60.0, 40.0
    half_w = (mon_w_cm * 0.5) * upc
    half_h = (mon_h_cm * 0.5) * upc

    head_forward = -R_final[:, 2]
    if forward_hint is not None:
        head_forward = forward_hint / np.linalg.norm(forward_hint)

    if gaze_origin is not None and gaze_dir is not None:
        gaze_dir = gaze_dir / np.linalg.norm(gaze_dir)
        plane_point = head_center + head_forward * (50.0 * upc)
        plane_normal = head_forward
        denom = np.dot(plane_normal, gaze_dir)
        if abs(denom) > 1e-6:
            t = np.dot(plane_normal, plane_point - gaze_origin) / denom
            center_w = gaze_origin + t * gaze_dir
        else:
            center_w = head_center + head_forward * (50.0 * upc)
    else:
        center_w = head_center + head_forward * (50.0 * upc)

    world_up = np.array([0, -1, 0], dtype=float)
    head_right = np.cross(world_up, head_forward)
    head_right /= np.linalg.norm(head_right)
    head_up = np.cross(head_forward, head_right)
    head_up /= np.linalg.norm(head_up)

    p0 = center_w - head_right * half_w - head_up * half_h
    p1 = center_w + head_right * half_w - head_up * half_h
    p2 = center_w + head_right * half_w + head_up * half_h
    p3 = center_w - head_right * half_w + head_up * half_h

    normal_w = head_forward / (np.linalg.norm(head_forward) + 1e-9)
    return [p0, p1, p2, p3], center_w, normal_w, upc


def update_orbit_from_keys():
    global orbit_yaw, orbit_pitch, orbit_radius
    yaw_step   = math.radians(1.5)
    pitch_step = math.radians(1.5)
    zoom_step  = 12.0
    changed = False

    if keyboard.is_pressed('j'):  orbit_yaw -= yaw_step;   changed = True
    if keyboard.is_pressed('l'):  orbit_yaw += yaw_step;   changed = True
    if keyboard.is_pressed('i'):  orbit_pitch += pitch_step; changed = True
    if keyboard.is_pressed('k'):  orbit_pitch -= pitch_step; changed = True
    if keyboard.is_pressed('['):  orbit_radius += zoom_step; changed = True
    if keyboard.is_pressed(']'):  orbit_radius = max(80.0, orbit_radius - zoom_step); changed = True
    if keyboard.is_pressed('r'):
        orbit_yaw = 0.0; orbit_pitch = 0.0; orbit_radius = 600.0; changed = True

    orbit_pitch  = max(math.radians(-89), min(math.radians(89), orbit_pitch))
    orbit_radius = max(80.0, orbit_radius)

    if changed:
        print(f"[Orbit Debug] yaw={math.degrees(orbit_yaw):.2f}°, "
              f"pitch={math.degrees(orbit_pitch):.2f}°, "
              f"radius={orbit_radius:.2f}, fov={orbit_fov_deg:.1f}°")


def compute_scale(points_3d):
    n = len(points_3d)
    total = 0; count = 0
    for i in range(n):
        for j in range(i + 1, n):
            dist = np.linalg.norm(points_3d[i] - points_3d[j])
            total += dist; count += 1
    return total / count if count > 0 else 1.0

def draw_gaze(frame, eye_center, iris_center, eye_radius, color, gaze_length):
    gaze_direction = iris_center - eye_center
    gaze_direction /= np.linalg.norm(gaze_direction)
    gaze_endpoint = eye_center + gaze_direction * gaze_length
    cv2.line(frame, tuple(int(v) for v in eye_center[:2]), tuple(int(v) for v in gaze_endpoint[:2]), color, 2)
    iris_offset = eye_center + gaze_direction * (1.2 * eye_radius)
    cv2.line(frame, (int(eye_center[0]), int(eye_center[1])), (int(iris_offset[0]), int(iris_offset[1])), color, 1)
    up_dir = np.array([0, -1, 0])
    right_dir = np.cross(gaze_direction, up_dir)
    if np.linalg.norm(right_dir) < 1e-6:
        right_dir = np.array([1, 0, 0])
    up_dir = np.cross(right_dir, gaze_direction)
    up_dir /= np.linalg.norm(up_dir)
    right_dir /= np.linalg.norm(right_dir)
    cv2.line(frame, (int(iris_offset[0]), int(iris_offset[1])), (int(gaze_endpoint[0]), int(gaze_endpoint[1])), color, 1)

def draw_wireframe_cube(frame, center, R, size=80):
    right = R[:, 0]; up = -R[:, 1]; forward = -R[:, 2]
    hw, hh, hd = size, size, size
    def corner(xs, ys, zs):
        return center + xs*hw*right + ys*hh*up + zs*hd*forward
    corners = [corner(x, y, z) for x in [-1,1] for y in [1,-1] for z in [-1,1]]
    projected = [(int(pt[0]), int(pt[1])) for pt in corners]
    edges = [(0,1),(1,3),(3,2),(2,0),(4,5),(5,7),(7,6),(6,4),(0,4),(1,5),(2,6),(3,7)]
    for i, j in edges:
        cv2.line(frame, projected[i], projected[j], (255, 128, 0), 2)

def compute_and_draw_coordinate_box(frame, face_landmarks, indices, ref_matrix_container, color=(0,255,0), size=80):
    points_3d = np.array([
        [face_landmarks[i].x * w, face_landmarks[i].y * h, face_landmarks[i].z * w]
        for i in indices
    ])
    center = np.mean(points_3d, axis=0)
    for i in indices:
        x2, y2 = int(face_landmarks[i].x * w), int(face_landmarks[i].y * h)
        cv2.circle(frame, (x2, y2), 3, color, -1)
    centered = points_3d - center
    cov = np.cov(centered.T)
    eigvals, eigvecs = np.linalg.eigh(cov)
    eigvecs = eigvecs[:, np.argsort(-eigvals)]
    if np.linalg.det(eigvecs) < 0:
        eigvecs[:, 2] *= -1
    r = Rscipy.from_matrix(eigvecs)
    roll, pitch, yaw = r.as_euler('zyx', degrees=False)
    R_final = Rscipy.from_euler('zyx', [roll, pitch, yaw]).as_matrix()
    if ref_matrix_container[0] is None:
        ref_matrix_container[0] = R_final.copy()
    else:
        R_ref = ref_matrix_container[0]
        for i in range(3):
            if np.dot(R_final[:, i], R_ref[:, i]) < 0:
                R_final[:, i] *= -1
    draw_wireframe_cube(frame, center, R_final, size)
    axis_length = size * 1.2
    axis_dirs = [R_final[:, 0], -R_final[:, 1], -R_final[:, 2]]
    axis_colors = [(0,255,0),(0,0,255),(255,0,0)]
    for i in range(3):
        end_pt = center + axis_dirs[i] * axis_length
        cv2.line(frame, (int(center[0]), int(center[1])), (int(end_pt[0]), int(end_pt[1])), axis_colors[i], 2)
    return center, R_final, points_3d

def convert_gaze_to_screen_coordinates(combined_gaze_direction, calibration_offset_yaw, calibration_offset_pitch):
    reference_forward = np.array([0, 0, -1])
    avg_direction = combined_gaze_direction / np.linalg.norm(combined_gaze_direction)
    xz_proj = np.array([avg_direction[0], 0, avg_direction[2]])
    xz_proj /= np.linalg.norm(xz_proj)
    yaw_rad = math.acos(np.clip(np.dot(reference_forward, xz_proj), -1.0, 1.0))
    if avg_direction[0] < 0:
        yaw_rad = -yaw_rad
    yz_proj = np.array([0, avg_direction[1], avg_direction[2]])
    yz_proj /= np.linalg.norm(yz_proj)
    pitch_rad = math.acos(np.clip(np.dot(reference_forward, yz_proj), -1.0, 1.0))
    if avg_direction[1] > 0:
        pitch_rad = -pitch_rad
    yaw_deg = np.degrees(yaw_rad)
    pitch_deg = np.degrees(pitch_rad)
    if yaw_deg < 0:
        yaw_deg = -(yaw_deg)
    elif yaw_deg > 0:
        yaw_deg = -yaw_deg
    raw_yaw_deg = yaw_deg
    raw_pitch_deg = pitch_deg
    yawDegrees = 5 * 3
    pitchDegrees = 2.0 * 2.5
    yaw_deg += calibration_offset_yaw
    pitch_deg += calibration_offset_pitch
    screen_x = int(((yaw_deg + yawDegrees) / (2 * yawDegrees)) * MONITOR_WIDTH)
    screen_y = int(((pitchDegrees - pitch_deg) / (2 * pitchDegrees)) * MONITOR_HEIGHT)
    screen_x = max(10, min(screen_x, MONITOR_WIDTH - 10))
    screen_y = max(10, min(screen_y, MONITOR_HEIGHT - 10))
    return screen_x, screen_y, raw_yaw_deg, raw_pitch_deg

def render_debug_view_orbit(
    h, w,
    head_center3d=None,
    sphere_world_l=None, scaled_radius_l=None,
    sphere_world_r=None, scaled_radius_r=None,
    iris3d_l=None, iris3d_r=None,
    left_locked=False, right_locked=False,
    landmarks3d=None,
    combined_dir=None,
    gaze_len=430,
    monitor_corners=None,
    monitor_center=None,
    monitor_normal=None,
    gaze_markers=None,
):
    if head_center3d is None:
        return

    debug = np.zeros((h, w, 3), dtype=np.uint8)
    head_w = np.asarray(head_center3d, dtype=float)

    global debug_world_frozen, orbit_pivot_frozen
    if debug_world_frozen and orbit_pivot_frozen is not None:
        pivot_w = np.asarray(orbit_pivot_frozen, dtype=float)
    else:
        if monitor_center is not None:
            pivot_w = (head_w + np.asarray(monitor_center, dtype=float)) * 0.5
        else:
            pivot_w = head_w

    f_px = _focal_px(w, orbit_fov_deg)
    cam_offset = _rot_y(orbit_yaw) @ (_rot_x(orbit_pitch) @ np.array([0.0, 0.0, orbit_radius]))
    cam_pos = pivot_w + cam_offset
    up_world = np.array([0.0, -1.0, 0.0])
    fwd = _normalize(pivot_w - cam_pos)
    right = _normalize(np.cross(fwd, up_world))
    up = _normalize(np.cross(right, fwd))
    V = np.stack([right, up, fwd], axis=0)

    def project_point(P):
        Pw = np.asarray(P, dtype=float)
        Pc = V @ (Pw - cam_pos)
        if Pc[2] <= 1e-3:
            return None
        x2 = f_px * (Pc[0] / Pc[2]) + w * 0.5
        y2 = -f_px * (Pc[1] / Pc[2]) + h * 0.5
        if not (np.isfinite(x2) and np.isfinite(y2)):
            return None
        return (int(x2), int(y2)), Pc[2]

    def draw_cross_3d(P, size=12, color=(255, 0, 255), thickness=2):
        res = project_point(P)
        if res is None: return
        (x2, y2), _ = res
        cv2.line(debug, (x2-size, y2), (x2+size, y2), color, thickness)
        cv2.line(debug, (x2, y2-size), (x2, y2+size), color, thickness)

    def draw_arrow_3d(P0, P1, color=(0,200,255), thickness=3):
        a = project_point(P0); b = project_point(P1)
        if a is None or b is None: return
        p0_, p1_ = a[0], b[0]
        cv2.line(debug, p0_, p1_, color, thickness)
        v = np.array([p1_[0]-p0_[0], p1_[1]-p0_[1]], dtype=float)
        n = np.linalg.norm(v)
        if n > 1e-3:
            v /= n; l = np.array([-v[1], v[0]]); ah = 10
            a1 = (int(p1_[0]-v[0]*ah+l[0]*ah*0.6), int(p1_[1]-v[1]*ah+l[1]*ah*0.6))
            a2 = (int(p1_[0]-v[0]*ah-l[0]*ah*0.6), int(p1_[1]-v[1]*ah-l[1]*ah*0.6))
            cv2.line(debug, p1_, a1, color, thickness)
            cv2.line(debug, p1_, a2, color, thickness)

    if landmarks3d is not None:
        for P in landmarks3d:
            res = project_point(P)
            if res is not None:
                cv2.circle(debug, res[0], 0, (200,200,200), -1)

    draw_cross_3d(head_w, size=12, color=(255,0,255), thickness=2)
    hc2d = project_point(head_w)
    if hc2d is not None:
        cv2.putText(debug, "Head Center", (hc2d[0][0]+12, hc2d[0][1]-12),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,0,255), 1, cv2.LINE_AA)

    draw_cross_3d(pivot_w, size=8, color=(180,120,255), thickness=2)
    if monitor_center is not None:
        mc2d = project_point(monitor_center)
        pv2d = project_point(pivot_w)
        if mc2d is not None and pv2d is not None and hc2d is not None:
            cv2.line(debug, pv2d[0], hc2d[0], (160,100,255), 1)
            cv2.line(debug, pv2d[0], mc2d[0], (160,100,255), 1)

    left_dir = None; right_dir = None

    if left_locked and sphere_world_l is not None:
        res = project_point(sphere_world_l)
        if res is not None:
            (cx, cy), z = res
            r_px = max(2, int((scaled_radius_l if scaled_radius_l else 6) * f_px / max(z, 1e-3)))
            cv2.circle(debug, (cx, cy), r_px, (255,255,25), 1)
            if iris3d_l is not None:
                left_dir = np.asarray(iris3d_l) - np.asarray(sphere_world_l)
                p1_ = project_point(np.asarray(sphere_world_l) + _normalize(left_dir) * gaze_len)
                if p1_ is not None:
                    cv2.line(debug, (cx,cy), p1_[0], (155,155,25), 1)
    elif iris3d_l is not None:
        res = project_point(iris3d_l)
        if res is not None:
            cv2.circle(debug, res[0], 2, (255,255,25), 1)

    if right_locked and sphere_world_r is not None:
        res = project_point(sphere_world_r)
        if res is not None:
            (cx, cy), z = res
            r_px = max(2, int((scaled_radius_r if scaled_radius_r else 6) * f_px / max(z, 1e-3)))
            cv2.circle(debug, (cx, cy), r_px, (25,255,255), 1)
            if iris3d_r is not None:
                right_dir = np.asarray(iris3d_r) - np.asarray(sphere_world_r)
                p1_ = project_point(np.asarray(sphere_world_r) + _normalize(right_dir) * gaze_len)
                if p1_ is not None:
                    cv2.line(debug, (cx,cy), p1_[0], (25,155,155), 1)
    elif iris3d_r is not None:
        res = project_point(iris3d_r)
        if res is not None:
            cv2.circle(debug, res[0], 2, (25,255,255), 1)

    if left_locked and right_locked and sphere_world_l is not None and sphere_world_r is not None:
        origin_mid = (np.asarray(sphere_world_l) + np.asarray(sphere_world_r)) / 2.0
        if combined_dir is None and (left_dir is not None or right_dir is not None):
            parts = []
            if left_dir is not None:  parts.append(_normalize(left_dir))
            if right_dir is not None: parts.append(_normalize(right_dir))
            if parts:
                combined_dir = _normalize(np.mean(parts, axis=0))
        if combined_dir is not None:
            p0_ = project_point(origin_mid)
            p1_ = project_point(origin_mid + _normalize(combined_dir) * (gaze_len * 1.2))
            if p0_ is not None and p1_ is not None:
                cv2.line(debug, p0_[0], p1_[0], (155,200,10), 2)

    if monitor_corners is not None:
        def draw_poly(points, color, thickness):
            projs = [project_point(p) for p in points]
            if any(p is None for p in projs): return
            p2_ = [p[0] for p in projs]
            for a_, b_ in zip(p2_, p2_[1:] + [p2_[0]]):
                cv2.line(debug, a_, b_, color, thickness)
        draw_poly(monitor_corners, (0,200,255), 2)
        draw_poly([monitor_corners[0], monitor_corners[2]], (0,150,210), 1)
        draw_poly([monitor_corners[1], monitor_corners[3]], (0,150,210), 1)
        if monitor_center is not None:
            draw_cross_3d(monitor_center, size=8, color=(0,200,255), thickness=2)
            if monitor_normal is not None:
                tip = np.asarray(monitor_center) + np.asarray(monitor_normal) * (20.0 * (units_per_cm or 1.0))
                draw_arrow_3d(monitor_center, tip, color=(0,220,255), thickness=2)

    if gaze_markers and monitor_corners is not None:
        p0_, p1_, p2_, p3_ = [np.asarray(p, dtype=float) for p in monitor_corners]
        u_ = p1_ - p0_; v_ = p3_ - p0_
        width_world = float(np.linalg.norm(u_))
        if width_world > 1e-9:
            u_hat = u_ / width_world
            r_world = 0.01 * width_world
            for (a_, b_) in gaze_markers:
                Pm = p0_ + a_*u_ + b_*v_
                projP = project_point(Pm)
                projR = project_point(Pm + u_hat * r_world)
                if projP is not None and projR is not None:
                    center_px = projP[0]
                    r_px = int(max(1, np.linalg.norm(np.array(projR[0]) - np.array(center_px))))
                    cv2.circle(debug, center_px, r_px, (0,255,0), 1, lineType=cv2.LINE_AA)

    if (monitor_corners is not None and monitor_center is not None and monitor_normal is not None
        and combined_dir is not None
        and sphere_world_l is not None and sphere_world_r is not None):
        O = (np.asarray(sphere_world_l, dtype=float) + np.asarray(sphere_world_r, dtype=float)) * 0.5
        D = _normalize(np.asarray(combined_dir, dtype=float))
        C = np.asarray(monitor_center, dtype=float)
        N = _normalize(np.asarray(monitor_normal, dtype=float))
        denom = float(np.dot(N, D))
        if abs(denom) > 1e-6:
            t = float(np.dot(N, (C - O)) / denom)
            if t > 0.0:
                P = O + t * D
                p0_, p1_, p2_, p3_ = [np.asarray(p, dtype=float) for p in monitor_corners]
                u_ = p1_ - p0_; v_ = p3_ - p0_; wv = P - p0_
                u_len2 = float(np.dot(u_, u_)); v_len2 = float(np.dot(v_, v_))
                if u_len2 > 1e-9 and v_len2 > 1e-9:
                    a_ = float(np.dot(wv, u_) / u_len2)
                    b_ = float(np.dot(wv, v_) / v_len2)
                    if 0.0 <= a_ <= 1.0 and 0.0 <= b_ <= 1.0:
                        projP = project_point(P)
                        if projP is not None:
                            center_px = projP[0]
                            width_world = math.sqrt(u_len2)
                            r_world = 0.05 * width_world
                            u_hat = u_ / max(width_world, 1e-9)
                            projR = project_point(P + u_hat * r_world)
                            if projR is not None:
                                r_px = int(max(1, np.linalg.norm(np.array(projR[0]) - np.array(center_px))))
                                cv2.circle(debug, center_px, r_px, (0,255,255), 2, lineType=cv2.LINE_AA)

    # --- Yardım metni (H tuşları eklendi) ---
    help_text = [
        "C = calibrate screen center",
        "J/L/I/K = orbit yaw/pitch",
        "[ / ] = zoom out / in",
        "R = reset view",
        "X = add marker",
        "- - - - HEATMAP - - - -",
        "H = toggle heatmap overlay",
        "P = toggle preview window",
        "B = save heatmap PNG",
        "N = save CSV + reset",
        "- - - -",
        "F7 = toggle mouse control",
        "q = quit",
    ]
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.45; thick = 1; line_height = 16
    y0 = h - (len(help_text) * line_height) - 10; x0 = 10
    for i, text in enumerate(help_text):
        color = (0, 220, 120) if "HEATMAP" in text else (200, 200, 200)
        cv2.putText(debug, text, (x0, y0 + i*line_height), font, font_scale, color, thick, cv2.LINE_AA)

    cv2.imshow("Head/Eye Debug", debug)


def mouse_mover():
    while True:
        if mouse_control_enabled:
            with mouse_lock:
                x, y = mouse_target
            pyautogui.moveTo(x, y)
        time.sleep(0.01)

threading.Thread(target=mouse_mover, daemon=True).start()

left_sphere_locked = False
left_sphere_local_offset = None
left_calibration_nose_scale = None

right_sphere_locked = False
right_sphere_local_offset = None
right_calibration_nose_scale = None

gaze_visualizer = GazeCursor()


_heatmap_frame_skip = 3
_heatmap_frame_count = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    combined_dir = None

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(frame_rgb)

    if results.multi_face_landmarks:
        face_landmarks = results.multi_face_landmarks[0].landmark

        left_iris_idx = 468; right_iris_idx = 473
        left_iris  = face_landmarks[left_iris_idx]
        right_iris = face_landmarks[right_iris_idx]

        head_center, R_final, nose_points_3d = compute_and_draw_coordinate_box(
            frame, face_landmarks, nose_indices, R_ref_nose, color=(0,255,0), size=80)

        base_radius = 20

        x_iris_l = int(left_iris.x * w)
        y_iris_l = int(left_iris.y * h)
        if not left_sphere_locked:
            cv2.circle(frame, (x_iris_l, y_iris_l), 10, (255,25,25), 2)
        else:
            current_nose_scale = compute_scale(nose_points_3d)
            scale_ratio = current_nose_scale / left_calibration_nose_scale if left_calibration_nose_scale else 1.0
            scaled_offset = left_sphere_local_offset * scale_ratio
            sphere_world_l = head_center + R_final @ scaled_offset
            x_sphere_l, y_sphere_l = int(sphere_world_l[0]), int(sphere_world_l[1])
            scaled_radius_l = int(base_radius * scale_ratio)
            cv2.circle(frame, (x_sphere_l, y_sphere_l), scaled_radius_l, (255,255,25), 2)

        x_iris_r = int(right_iris.x * w)
        y_iris_r = int(right_iris.y * h)
        if not right_sphere_locked:
            cv2.circle(frame, (x_iris_r, y_iris_r), 10, (25,255,25), 2)
        else:
            current_nose_scale = compute_scale(nose_points_3d)
            scale_ratio_r = current_nose_scale / right_calibration_nose_scale if right_calibration_nose_scale else 1.0
            scaled_offset_r = right_sphere_local_offset * scale_ratio_r
            sphere_world_r = head_center + R_final @ scaled_offset_r
            x_sphere_r, y_sphere_r = int(sphere_world_r[0]), int(sphere_world_r[1])
            scaled_radius_r = int(base_radius * scale_ratio_r)
            cv2.circle(frame, (x_sphere_r, y_sphere_r), scaled_radius_r, (25,255,255), 2)

        iris_3d_left  = np.array([left_iris.x  * w, left_iris.y  * h, left_iris.z  * w])
        iris_3d_right = np.array([right_iris.x * w, right_iris.y * h, right_iris.z * w])

        if left_sphere_locked and right_sphere_locked:
            draw_gaze(frame, sphere_world_l, iris_3d_left,  scaled_radius_l, (55,255,0), 130)
            draw_gaze(frame, sphere_world_r, iris_3d_right, scaled_radius_r, (55,255,0), 130)

            left_gaze_dir  = iris_3d_left  - sphere_world_l
            left_gaze_dir  /= np.linalg.norm(left_gaze_dir)
            right_gaze_dir = iris_3d_right - sphere_world_r
            right_gaze_dir /= np.linalg.norm(right_gaze_dir)
            raw_combined_direction = (left_gaze_dir + right_gaze_dir) / 2
            raw_combined_direction /= np.linalg.norm(raw_combined_direction)

            combined_gaze_directions.append(raw_combined_direction)
            avg_combined_direction = np.mean(combined_gaze_directions, axis=0)
            avg_combined_direction /= np.linalg.norm(avg_combined_direction)
            combined_dir = avg_combined_direction

            screen_x, screen_y, raw_yaw, raw_pitch = convert_gaze_to_screen_coordinates(
                avg_combined_direction, calibration_offset_yaw, calibration_offset_pitch)

            _heatmap_frame_count += 1
            if _heatmap_frame_count % _heatmap_frame_skip == 0:
                gaze_heatmap.add_point(screen_x, screen_y)
            gaze_heatmap.apply_decay()

            if gaze_heatmap.show_preview:
                gaze_heatmap.show_preview_window()

            if mouse_control_enabled:
                with mouse_lock:
                    mouse_target[0] = screen_x
                    mouse_target[1] = screen_y

            try:
                gaze_visualizer.update_position(screen_x, screen_y)
            except Exception as e:
                print(f"Cursor Hatası: {e}")

            write_screen_position(screen_x, screen_y)

            combined_origin = (sphere_world_l + sphere_world_r) / 2
            combined_target = combined_origin + avg_combined_direction * gaze_length
            cv2.line(frame,
                     (int(combined_origin[0]), int(combined_origin[1])),
                     (int(combined_target[0]),  int(combined_target[1])),
                     (255,255,10), 3)

            texts = [f"Screen: ({screen_x}, {screen_y})"]
            font2 = cv2.FONT_HERSHEY_SIMPLEX; fs2 = 0.7; th2 = 2
            for i, text in enumerate(texts):
                (tw, _), _ = cv2.getTextSize(text, font2, fs2, th2)
                cv2.putText(frame, text, ((w-tw)//2, 30), font2, fs2, (0,255,0), th2)

            hm_status = f"Heatmap: {'ON' if gaze_heatmap.visible else 'OFF'}  pts={len(gaze_heatmap.raw_points)}"
            cv2.putText(frame, hm_status, (10, h-15),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                        (0, 220, 120) if gaze_heatmap.visible else (100,100,100), 1, cv2.LINE_AA)

        for idx, lm in enumerate(face_landmarks):
            x2, y2 = int(lm.x * w), int(lm.y * h)
            cv2.circle(frame, (x2, y2), 0, (255,255,255), -1)

        update_orbit_from_keys()

        landmarks3d = None
        if results.multi_face_landmarks:
            lm = results.multi_face_landmarks[0].landmark
            landmarks3d = np.array([[p.x*w, p.y*h, p.z*w] for p in lm], dtype=float)

        render_debug_view_orbit(
            h, w,
            head_center3d=head_center if 'head_center' in locals() else None,
            sphere_world_l=sphere_world_l if left_sphere_locked and 'sphere_world_l' in locals() else None,
            scaled_radius_l=scaled_radius_l if left_sphere_locked and 'scaled_radius_l' in locals() else None,
            sphere_world_r=sphere_world_r if right_sphere_locked and 'sphere_world_r' in locals() else None,
            scaled_radius_r=scaled_radius_r if right_sphere_locked and 'scaled_radius_r' in locals() else None,
            iris3d_l=iris_3d_left  if 'iris_3d_left'  in locals() else None,
            iris3d_r=iris_3d_right if 'iris_3d_right' in locals() else None,
            left_locked=left_sphere_locked,
            right_locked=right_sphere_locked,
            landmarks3d=landmarks3d,
            combined_dir=avg_combined_direction if 'avg_combined_direction' in locals() else None,
            gaze_len=5230,
            monitor_corners=monitor_corners,
            monitor_center=monitor_center_w,
            monitor_normal=monitor_normal_w,
            gaze_markers=gaze_markers
        )

    frame = gaze_heatmap.overlay_on_frame(frame)

    cv2.imshow("Integrated Eye Tracking", frame)

    if keyboard.is_pressed('f7'):
        mouse_control_enabled = not mouse_control_enabled
        print(f"[Mouse Control] {'Enabled' if mouse_control_enabled else 'Disabled'}")
        time.sleep(0.3)

    key = cv2.waitKey(1) & 0xFF

    # Sunucudan durdurma sinyali geldi mi?
    if os.path.exists(_STOP_FILE):
        print('[EyeTracker] Durdurma sinyali alındı, çıkılıyor...')
        break

    if key == ord('q'):
        break


    # HEATMAP KLAVYE KONTROLLERI
    elif key == ord('h'):
        # Overlay aç/kapat (kamera görüntüsü üzerinde)
        gaze_heatmap.visible = not gaze_heatmap.visible
        print(f"[Heatmap] Overlay {'açık' if gaze_heatmap.visible else 'kapalı'}")

    elif key == ord('p'):
        # Küçük önizleme penceresi aç/kapat
        gaze_heatmap.show_preview = not gaze_heatmap.show_preview
        if not gaze_heatmap.show_preview:
            cv2.destroyWindow("Gaze Heatmap Preview")
        print(f"[Heatmap] Önizleme {'açık' if gaze_heatmap.show_preview else 'kapalı'}")

    elif key == ord('b'):
        ts = time.strftime("%Y%m%d_%H%M%S")
        gaze_heatmap.save_png(
            path=f"heatmap_{ts}.png",
            background=None
        )

    elif key == ord('n'):

        ts = time.strftime("%Y%m%d_%H%M%S")
        gaze_heatmap.save_raw_csv(path=f"gaze_points_{ts}.csv")
        gaze_heatmap.reset()

    elif key == ord('c') and not (left_sphere_locked and right_sphere_locked):
        current_nose_scale = compute_scale(nose_points_3d)
        left_sphere_local_offset = R_final.T @ (iris_3d_left - head_center)
        camera_dir_world = np.array([0, 0, 1])
        camera_dir_local = R_final.T @ camera_dir_world
        left_sphere_local_offset += base_radius * camera_dir_local
        left_calibration_nose_scale = current_nose_scale
        left_sphere_locked = True

        right_sphere_local_offset = R_final.T @ (iris_3d_right - head_center)
        right_sphere_local_offset += base_radius * camera_dir_local
        right_calibration_nose_scale = current_nose_scale
        right_sphere_locked = True

        sphere_world_l_calib = head_center + R_final @ left_sphere_local_offset
        sphere_world_r_calib = head_center + R_final @ right_sphere_local_offset
        left_dir  = iris_3d_left  - sphere_world_l_calib
        right_dir = iris_3d_right - sphere_world_r_calib
        if np.linalg.norm(left_dir)  > 1e-9: left_dir  /= np.linalg.norm(left_dir)
        if np.linalg.norm(right_dir) > 1e-9: right_dir /= np.linalg.norm(right_dir)
        forward_hint = (left_dir + right_dir) * 0.5
        if np.linalg.norm(forward_hint) > 1e-9:
            forward_hint /= np.linalg.norm(forward_hint)
        else:
            forward_hint = None

        gaze_origin = (sphere_world_l_calib + sphere_world_r_calib) / 2
        gaze_dir = forward_hint

        monitor_corners, monitor_center_w, monitor_normal_w, units_per_cm = create_monitor_plane(
            head_center, R_final, face_landmarks, w, h,
            forward_hint=forward_hint, gaze_origin=gaze_origin, gaze_dir=gaze_dir)

        debug_world_frozen = True
        orbit_pivot_frozen = monitor_center_w.copy()
        print("[Debug View] World pivot frozen at monitor center.")
        print(f"[Monitor] units_per_cm={units_per_cm:.3f}, center={monitor_center_w}")
        print("[Both Spheres Locked] Eye sphere calibration complete.")

    elif key == ord('s') and left_sphere_locked and right_sphere_locked:
        left_gaze_dir  = iris_3d_left  - sphere_world_l
        left_gaze_dir  /= np.linalg.norm(left_gaze_dir)
        right_gaze_dir = iris_3d_right - sphere_world_r
        right_gaze_dir /= np.linalg.norm(right_gaze_dir)
        current_combined_direction = (left_gaze_dir + right_gaze_dir) / 2
        current_combined_direction /= np.linalg.norm(current_combined_direction)
        _, _, raw_yaw, raw_pitch = convert_gaze_to_screen_coordinates(current_combined_direction, 0, 0)
        calibration_offset_yaw   = 0 - raw_yaw
        calibration_offset_pitch = 0 - raw_pitch
        print(f"[Screen Calibrated] Offset Yaw: {calibration_offset_yaw:.2f}, Pitch: {calibration_offset_pitch:.2f}")

    elif key == ord('x'):
        if (monitor_corners is not None and monitor_center_w is not None and monitor_normal_w is not None
            and left_sphere_locked and right_sphere_locked):
            current_nose_scale = compute_scale(nose_points_3d)
            scale_ratio_l = current_nose_scale / left_calibration_nose_scale if left_calibration_nose_scale else 1.0
            scale_ratio_r = current_nose_scale / right_calibration_nose_scale if right_calibration_nose_scale else 1.0
            sphere_world_l_now = head_center + R_final @ (left_sphere_local_offset  * scale_ratio_l)
            sphere_world_r_now = head_center + R_final @ (right_sphere_local_offset * scale_ratio_r)
            if 'avg_combined_direction' in locals() and avg_combined_direction is not None:
                D = _normalize(np.asarray(avg_combined_direction, dtype=float))
            else:
                lg = iris_3d_left  - sphere_world_l_now
                rg = iris_3d_right - sphere_world_r_now
                if np.linalg.norm(lg) < 1e-9 or np.linalg.norm(rg) < 1e-9:
                    print("[Marker] Gaze direction invalid."); D = None
                else:
                    lg /= np.linalg.norm(lg); rg /= np.linalg.norm(rg)
                    D = _normalize(lg + rg)
            if D is not None:
                O = (sphere_world_l_now + sphere_world_r_now) * 0.5
                C = np.asarray(monitor_center_w, dtype=float)
                N = _normalize(np.asarray(monitor_normal_w, dtype=float))
                denom = float(np.dot(N, D))
                if abs(denom) < 1e-6:
                    print("[Marker] Gaze ray parallel to monitor.")
                else:
                    t = float(np.dot(N, (C-O)) / denom)
                    if t <= 0.0:
                        print("[Marker] Intersection behind eye.")
                    else:
                        P = O + t * D
                        p0_, p1_, p2_, p3_ = [np.asarray(p, dtype=float) for p in monitor_corners]
                        u_ = p1_ - p0_; v_ = p3_ - p0_
                        u_len2 = float(np.dot(u_, u_)); v_len2 = float(np.dot(v_, v_))
                        if u_len2 > 1e-9 and v_len2 > 1e-9:
                            wv = P - p0_
                            a_ = float(np.dot(wv, u_) / u_len2)
                            b_ = float(np.dot(wv, v_) / v_len2)
                            if 0.0 <= a_ <= 1.0 and 0.0 <= b_ <= 1.0:
                                gaze_markers.append((a_, b_))
                                print(f"[Marker] Added at a={a_:.3f}, b={b_:.3f}")
                            else:
                                print("[Marker] Gaze not on monitor.")
        else:
            print("[Marker] Monitor/gaze not ready.")

cap.release()
cv2.destroyAllWindows()

# ── OTOMATİK KAYDET ───────────────────────────────────────────
_ts   = time.strftime('%Y%m%d_%H%M%S')
_slug = _re.sub(r'[^\w]', '_', _SESSION_NAME)[:20].strip('_') or 'denek'
_png  = os.path.join(_OUTPUT_DIR, f'{_slug}_{_ts}.png')
_csv  = os.path.join(_OUTPUT_DIR, f'{_slug}_{_ts}.csv')
_meta = os.path.join(_OUTPUT_DIR, f'{_slug}_{_ts}.json')

if len(gaze_heatmap.raw_points) > 10:
    gaze_heatmap.save_png(_png)
    gaze_heatmap.save_raw_csv(_csv)
    with open(_meta, 'w', encoding='utf-8') as _f:
        _json.dump({
            'session':   _SESSION_NAME,
            'timestamp': _ts,
            'points':    len(gaze_heatmap.raw_points),
            'png':       os.path.basename(_png),
            'csv':       os.path.basename(_csv),
        }, _f, ensure_ascii=False, indent=2)
    print(f'[EyeTracker] Heatmap kaydedildi → {_png}')
else:
    print('[EyeTracker] Yeterli gaze noktası yok, kayıt atlandı.')

try:
    os.remove(_STOP_FILE)
except FileNotFoundError:
    pass