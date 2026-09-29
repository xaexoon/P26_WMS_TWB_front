#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ROS Map Coordinate Picker
=========================
ROS 맵 파일(.yaml + .pgm)을 불러와서 마우스로 클릭하면
해당 지점의 실제 좌표(map frame, meter)를 알려주는 프로그램.

사용법:
    python ros_map_picker.py                # 실행 후 [열기] 버튼
    python ros_map_picker.py my_map.yaml    # 바로 열기

필요 패키지:
    pip install pyyaml pillow

조작법:
    좌클릭            : 웨이포인트 추가
    좌클릭 + 드래그   : 방향(yaw)까지 지정해서 추가
    우/휠클릭 드래그  : 화면 이동(pan)
    마우스 휠         : 커서 기준 확대/축소
    F                 : 화면에 맞추기
    Ctrl+Z            : 마지막 점 삭제
    Ctrl+O / Ctrl+S   : 열기 / CSV 저장
"""

from __future__ import annotations

import csv
import math
import os
import sys
import tkinter as tk
from tkinter import filedialog, messagebox, ttk

try:
    import yaml
except ImportError:
    yaml = None

try:
    from PIL import Image, ImageTk
except ImportError:
    Image = None
    ImageTk = None


# ---------------------------------------------------------------- 맵 데이터
class MapData:
    """ROS map_server 포맷(.yaml + 이미지)을 읽고 좌표 변환을 담당."""

    def __init__(self, yaml_path: str):
        with open(yaml_path, "r", encoding="utf-8") as f:
            cfg = yaml.safe_load(f)
        if not isinstance(cfg, dict):
            raise ValueError("YAML 형식이 올바르지 않습니다.")

        self.yaml_path = os.path.abspath(yaml_path)
        base_dir = os.path.dirname(self.yaml_path)

        image_name = cfg.get("image")
        if not image_name:
            raise ValueError("YAML에 'image' 항목이 없습니다.")
        image_path = (
            image_name if os.path.isabs(image_name)
            else os.path.normpath(os.path.join(base_dir, image_name))
        )
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"이미지 파일이 없습니다:\n{image_path}")

        self.image_path = image_path
        self.resolution = float(cfg.get("resolution", 0.05))   # m / pixel
        origin = cfg.get("origin", [0.0, 0.0, 0.0]) or [0.0, 0.0, 0.0]
        self.origin_x = float(origin[0])
        self.origin_y = float(origin[1])
        self.origin_yaw = float(origin[2]) if len(origin) > 2 else 0.0
        self.negate = int(cfg.get("negate", 0))
        self.occupied_thresh = float(cfg.get("occupied_thresh", 0.65))
        self.free_thresh = float(cfg.get("free_thresh", 0.196))
        self.mode = str(cfg.get("mode", "trinary"))

        self.image = Image.open(image_path).convert("L")
        self.width, self.height = self.image.size
        self._pix = self.image.load()

        self._cos = math.cos(self.origin_yaw)
        self._sin = math.sin(self.origin_yaw)

    # ---- 좌표 변환 -------------------------------------------------------
    # 이미지 좌표: 좌상단이 (0,0), y는 아래로 증가
    # 맵 좌표    : origin 기준, y는 위로 증가 (ROS 규약)
    def pixel_to_world(self, px: float, py: float) -> tuple[float, float]:
        mx = px * self.resolution
        my = (self.height - py) * self.resolution
        wx = self.origin_x + self._cos * mx - self._sin * my
        wy = self.origin_y + self._sin * mx + self._cos * my
        return wx, wy

    def world_to_pixel(self, wx: float, wy: float) -> tuple[float, float]:
        dx = wx - self.origin_x
        dy = wy - self.origin_y
        mx = self._cos * dx + self._sin * dy
        my = -self._sin * dx + self._cos * dy
        px = mx / self.resolution
        py = self.height - my / self.resolution
        return px, py

    # ---- 점유 상태 -------------------------------------------------------
    def occupancy(self, px: float, py: float):
        """반환: (gray, 점유확률, 상태문자열) / 범위 밖이면 None"""
        ix, iy = int(px), int(py)
        if not (0 <= ix < self.width and 0 <= iy < self.height):
            return None
        gray = self._pix[ix, iy]
        p = (gray / 255.0) if self.negate else ((255 - gray) / 255.0)
        if p > self.occupied_thresh:
            state = "occupied (장애물)"
        elif p < self.free_thresh:
            state = "free (주행가능)"
        else:
            state = "unknown (미확인)"
        return gray, p, state

    # ---- 정보 -----------------------------------------------------------
    def extent(self) -> tuple[float, float, float, float]:
        """맵 네 모서리의 월드 좌표 bounding box (min_x, min_y, max_x, max_y)"""
        corners = [
            self.pixel_to_world(0, 0),
            self.pixel_to_world(self.width, 0),
            self.pixel_to_world(0, self.height),
            self.pixel_to_world(self.width, self.height),
        ]
        xs = [c[0] for c in corners]
        ys = [c[1] for c in corners]
        return min(xs), min(ys), max(xs), max(ys)


# ---------------------------------------------------------------- 메인 앱
class MapPickerApp(tk.Tk):
    MARKER_R = 5

    def __init__(self, initial_yaml: str | None = None):
        super().__init__()
        self.title("ROS Map Coordinate Picker")
        self.geometry("1280x820")
        self.minsize(900, 600)

        self.map: MapData | None = None
        self.points: list[dict] = []      # {'x','y','yaw','px','py','state'}
        self.scale = 1.0
        self.off_x = 0.0                  # 캔버스상 이미지 원점 위치
        self.off_y = 0.0
        self._tkimg = None
        self._pan_start = None
        self._drag_start_px = None
        self._temp_arrow = None

        self._build_ui()
        self._bind_events()

        if initial_yaml:
            self.after(100, lambda: self.load_map(initial_yaml))

    # ---------------------------------------------------------- UI 구성
    def _build_ui(self):
        # 툴바
        bar = ttk.Frame(self, padding=(8, 6))
        bar.pack(side="top", fill="x")

        ttk.Button(bar, text="맵 열기 (.yaml)", command=self.open_dialog).pack(side="left")
        ttk.Separator(bar, orient="vertical").pack(side="left", fill="y", padx=8)
        ttk.Button(bar, text="화면 맞춤 (F)", command=self.fit_view).pack(side="left", padx=2)
        ttk.Button(bar, text="확대 +", command=lambda: self.zoom_center(1.25)).pack(side="left", padx=2)
        ttk.Button(bar, text="축소 −", command=lambda: self.zoom_center(0.8)).pack(side="left", padx=2)
        ttk.Separator(bar, orient="vertical").pack(side="left", fill="y", padx=8)

        self.var_copy = tk.BooleanVar(value=True)
        ttk.Checkbutton(bar, text="클릭 시 좌표 자동 복사",
                        variable=self.var_copy).pack(side="left", padx=4)
        self.var_grid = tk.BooleanVar(value=False)
        ttk.Checkbutton(bar, text="1m 격자", variable=self.var_grid,
                        command=self.redraw).pack(side="left", padx=4)

        self.lbl_file = ttk.Label(bar, text="열린 맵 없음", foreground="#666")
        self.lbl_file.pack(side="right")

        # 본문
        body = ttk.Frame(self)
        body.pack(side="top", fill="both", expand=True)

        self.canvas = tk.Canvas(body, bg="#2b2b2b", highlightthickness=0, cursor="crosshair")
        self.canvas.pack(side="left", fill="both", expand=True)

        side = ttk.Frame(body, padding=(8, 8), width=340)
        side.pack(side="right", fill="y")
        side.pack_propagate(False)

        # 맵 정보
        info = ttk.LabelFrame(side, text="맵 정보", padding=6)
        info.pack(fill="x")
        self.txt_info = tk.Text(info, height=7, width=38, relief="flat",
                                bg=self.cget("bg"), font=("TkDefaultFont", 9))
        self.txt_info.pack(fill="x")
        self.txt_info.configure(state="disabled")

        # 좌표 목록
        lst = ttk.LabelFrame(side, text="클릭한 좌표", padding=6)
        lst.pack(fill="both", expand=True, pady=(8, 0))

        cols = ("no", "x", "y", "yaw")
        self.tree = ttk.Treeview(lst, columns=cols, show="headings", height=16)
        for c, t, w in (("no", "#", 34), ("x", "x [m]", 82),
                        ("y", "y [m]", 82), ("yaw", "yaw [°]", 70)):
            self.tree.heading(c, text=t)
            self.tree.column(c, width=w, anchor="center")
        vsb = ttk.Scrollbar(lst, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=vsb.set)
        self.tree.pack(side="left", fill="both", expand=True)
        vsb.pack(side="right", fill="y")
        self.tree.bind("<<TreeviewSelect>>", lambda e: self.redraw())

        btns = ttk.Frame(side)
        btns.pack(fill="x", pady=(6, 0))
        ttk.Button(btns, text="마지막 삭제", command=self.undo_point).pack(side="left", expand=True, fill="x", padx=1)
        ttk.Button(btns, text="선택 삭제", command=self.delete_selected).pack(side="left", expand=True, fill="x", padx=1)
        ttk.Button(btns, text="전체 삭제", command=self.clear_points).pack(side="left", expand=True, fill="x", padx=1)

        btns2 = ttk.Frame(side)
        btns2.pack(fill="x", pady=(4, 0))
        ttk.Button(btns2, text="전체 복사", command=self.copy_all).pack(side="left", expand=True, fill="x", padx=1)
        ttk.Button(btns2, text="CSV 저장", command=self.save_csv).pack(side="left", expand=True, fill="x", padx=1)
        ttk.Button(btns2, text="YAML 저장", command=self.save_yaml).pack(side="left", expand=True, fill="x", padx=1)

        self.lbl_dist = ttk.Label(side, text="두 점 거리: -", foreground="#0a7")
        self.lbl_dist.pack(fill="x", pady=(6, 0))

        # 상태바
        self.status = ttk.Label(
            self, text="맵 파일(.yaml)을 열어주세요.  |  좌클릭: 점 추가 · 드래그: 방향 지정 · 우클릭드래그: 이동 · 휠: 확대",
            relief="sunken", anchor="w", padding=(8, 4))
        self.status.pack(side="bottom", fill="x")

    def _bind_events(self):
        c = self.canvas
        c.bind("<Configure>", lambda e: self.redraw())
        c.bind("<Motion>", self.on_motion)
        c.bind("<Leave>", lambda e: self._set_status(""))
        c.bind("<Button-1>", self.on_press)
        c.bind("<B1-Motion>", self.on_drag)
        c.bind("<ButtonRelease-1>", self.on_release)
        for b in ("<Button-2>", "<Button-3>"):
            c.bind(b, self.on_pan_start)
        for b in ("<B2-Motion>", "<B3-Motion>"):
            c.bind(b, self.on_pan_move)
        c.bind("<MouseWheel>", self.on_wheel)          # Windows / macOS
        c.bind("<Button-4>", lambda e: self.on_wheel(e, 1))   # Linux
        c.bind("<Button-5>", lambda e: self.on_wheel(e, -1))

        self.bind("<Control-o>", lambda e: self.open_dialog())
        self.bind("<Control-s>", lambda e: self.save_csv())
        self.bind("<Control-z>", lambda e: self.undo_point())
        self.bind("<f>", lambda e: self.fit_view())
        self.bind("<F>", lambda e: self.fit_view())
        self.bind("<plus>", lambda e: self.zoom_center(1.25))
        self.bind("<minus>", lambda e: self.zoom_center(0.8))

    # ---------------------------------------------------------- 맵 로드
    def open_dialog(self):
        path = filedialog.askopenfilename(
            title="ROS 맵 YAML 선택",
            filetypes=[("ROS map yaml", "*.yaml *.yml"), ("모든 파일", "*.*")])
        if path:
            self.load_map(path)

    def load_map(self, path: str):
        try:
            self.map = MapData(path)
        except Exception as e:                                   # noqa: BLE001
            messagebox.showerror("맵 로드 실패", str(e))
            return
        self.clear_points()
        self.lbl_file.configure(text=os.path.basename(path))
        self._update_info()
        self.fit_view()

    def _update_info(self):
        m = self.map
        if not m:
            return
        min_x, min_y, max_x, max_y = m.extent()
        text = (
            f"이미지  : {os.path.basename(m.image_path)}\n"
            f"크기    : {m.width} x {m.height} px\n"
            f"해상도  : {m.resolution:g} m/px\n"
            f"origin  : ({m.origin_x:g}, {m.origin_y:g}, {m.origin_yaw:g} rad)\n"
            f"실제크기: {m.width * m.resolution:.2f} x {m.height * m.resolution:.2f} m\n"
            f"x 범위  : {min_x:.2f} ~ {max_x:.2f} m\n"
            f"y 범위  : {min_y:.2f} ~ {max_y:.2f} m"
        )
        self.txt_info.configure(state="normal")
        self.txt_info.delete("1.0", "end")
        self.txt_info.insert("1.0", text)
        self.txt_info.configure(state="disabled")

    # ---------------------------------------------------------- 뷰 제어
    def fit_view(self):
        if not self.map:
            return
        self.update_idletasks()
        cw = max(self.canvas.winfo_width(), 1)
        ch = max(self.canvas.winfo_height(), 1)
        self.scale = min(cw / self.map.width, ch / self.map.height) * 0.96
        self.off_x = (cw - self.map.width * self.scale) / 2
        self.off_y = (ch - self.map.height * self.scale) / 2
        self.redraw()

    def zoom_center(self, factor: float):
        cw = self.canvas.winfo_width() / 2
        ch = self.canvas.winfo_height() / 2
        self._zoom_at(cw, ch, factor)

    def _zoom_at(self, cx: float, cy: float, factor: float):
        if not self.map:
            return
        new_scale = max(0.02, min(80.0, self.scale * factor))
        if abs(new_scale - self.scale) < 1e-12:
            return
        ix = (cx - self.off_x) / self.scale
        iy = (cy - self.off_y) / self.scale
        self.scale = new_scale
        self.off_x = cx - ix * self.scale
        self.off_y = cy - iy * self.scale
        self.redraw()

    def on_wheel(self, event, direction=None):
        if direction is None:
            direction = 1 if event.delta > 0 else -1
        self._zoom_at(event.x, event.y, 1.2 if direction > 0 else 1 / 1.2)

    def on_pan_start(self, event):
        self._pan_start = (event.x, event.y, self.off_x, self.off_y)
        self.canvas.configure(cursor="fleur")

    def on_pan_move(self, event):
        if not self._pan_start:
            return
        sx, sy, ox, oy = self._pan_start
        self.off_x = ox + (event.x - sx)
        self.off_y = oy + (event.y - sy)
        self.redraw()
        self.canvas.configure(cursor="crosshair")

    # ---------------------------------------------------------- 좌표 변환
    def canvas_to_pixel(self, cx: float, cy: float) -> tuple[float, float]:
        return (cx - self.off_x) / self.scale, (cy - self.off_y) / self.scale

    def pixel_to_canvas(self, px: float, py: float) -> tuple[float, float]:
        return px * self.scale + self.off_x, py * self.scale + self.off_y

    # ---------------------------------------------------------- 마우스
    def on_motion(self, event):
        if not self.map:
            return
        px, py = self.canvas_to_pixel(event.x, event.y)
        wx, wy = self.map.pixel_to_world(px, py)
        occ = self.map.occupancy(px, py)
        occ_txt = f"{occ[2]} (gray={occ[0]})" if occ else "맵 범위 밖"
        self._set_status(
            f"맵 좌표: x={wx:+.3f} m,  y={wy:+.3f} m     │     "
            f"픽셀: ({px:.1f}, {py:.1f})     │     {occ_txt}     │     "
            f"배율 {self.scale * 100:.0f}%")

    def on_press(self, event):
        if not self.map:
            return
        self._drag_start_px = self.canvas_to_pixel(event.x, event.y)
        self._press_canvas = (event.x, event.y)

    def on_drag(self, event):
        if not self.map or self._drag_start_px is None:
            return
        sx, sy = self.pixel_to_canvas(*self._drag_start_px)
        if self._temp_arrow:
            self.canvas.delete(self._temp_arrow)
        self._temp_arrow = self.canvas.create_line(
            sx, sy, event.x, event.y, fill="#ff4d4d", width=2,
            arrow="last", arrowshape=(12, 14, 5))

    def on_release(self, event):
        if not self.map or self._drag_start_px is None:
            return
        if self._temp_arrow:
            self.canvas.delete(self._temp_arrow)
            self._temp_arrow = None

        px, py = self._drag_start_px
        self._drag_start_px = None

        dx = event.x - self._press_canvas[0]
        dy = event.y - self._press_canvas[1]
        if math.hypot(dx, dy) > 6:                # 드래그 → 방향 지정
            ex, ey = self.canvas_to_pixel(event.x, event.y)
            x0, y0 = self.map.pixel_to_world(px, py)
            x1, y1 = self.map.pixel_to_world(ex, ey)
            yaw = math.atan2(y1 - y0, x1 - x0)
        else:
            yaw = 0.0

        self.add_point(px, py, yaw)

    # ---------------------------------------------------------- 포인트
    def add_point(self, px: float, py: float, yaw: float = 0.0):
        wx, wy = self.map.pixel_to_world(px, py)
        occ = self.map.occupancy(px, py)
        pt = {"x": wx, "y": wy, "yaw": yaw, "px": px, "py": py,
              "state": occ[2] if occ else "out of map"}
        self.points.append(pt)

        self.tree.insert("", "end", values=(
            len(self.points), f"{wx:.3f}", f"{wy:.3f}", f"{math.degrees(yaw):.1f}"))
        self.tree.yview_moveto(1.0)

        if self.var_copy.get():
            self.clipboard_clear()
            self.clipboard_append(f"{wx:.3f}, {wy:.3f}")

        self._update_distance()
        self.redraw()

    def undo_point(self):
        if not self.points:
            return
        self.points.pop()
        kids = self.tree.get_children()
        if kids:
            self.tree.delete(kids[-1])
        self._update_distance()
        self.redraw()

    def delete_selected(self):
        sel = self.tree.selection()
        if not sel:
            return
        idxs = sorted((self.tree.index(i) for i in sel), reverse=True)
        for i in idxs:
            del self.points[i]
        self._refresh_tree()
        self._update_distance()
        self.redraw()

    def clear_points(self):
        self.points.clear()
        self._refresh_tree()
        self.lbl_dist.configure(text="두 점 거리: -")
        self.redraw()

    def _refresh_tree(self):
        self.tree.delete(*self.tree.get_children())
        for i, p in enumerate(self.points, 1):
            self.tree.insert("", "end", values=(
                i, f"{p['x']:.3f}", f"{p['y']:.3f}", f"{math.degrees(p['yaw']):.1f}"))

    def _update_distance(self):
        if len(self.points) >= 2:
            a, b = self.points[-2], self.points[-1]
            d = math.hypot(b["x"] - a["x"], b["y"] - a["y"])
            self.lbl_dist.configure(text=f"최근 두 점 거리: {d:.3f} m")
        else:
            self.lbl_dist.configure(text="두 점 거리: -")

    # ---------------------------------------------------------- 내보내기
    def copy_all(self):
        if not self.points:
            return
        lines = [f"{p['x']:.3f}, {p['y']:.3f}, {p['yaw']:.4f}" for p in self.points]
        self.clipboard_clear()
        self.clipboard_append("\n".join(lines))
        self._flash(f"{len(lines)}개 좌표를 클립보드에 복사했습니다.")

    def save_csv(self):
        if not self.points:
            messagebox.showinfo("알림", "저장할 좌표가 없습니다.")
            return
        path = filedialog.asksaveasfilename(
            defaultextension=".csv", filetypes=[("CSV", "*.csv")],
            initialfile="waypoints.csv")
        if not path:
            return
        with open(path, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["index", "x_m", "y_m", "yaw_rad", "yaw_deg",
                        "pixel_x", "pixel_y", "state"])
            for i, p in enumerate(self.points, 1):
                w.writerow([i, f"{p['x']:.4f}", f"{p['y']:.4f}", f"{p['yaw']:.5f}",
                            f"{math.degrees(p['yaw']):.2f}",
                            f"{p['px']:.2f}", f"{p['py']:.2f}", p["state"]])
        self._flash(f"저장 완료: {path}")

    def save_yaml(self):
        """Nav2 웨이포인트 형식(pose 리스트)으로 저장."""
        if not self.points:
            messagebox.showinfo("알림", "저장할 좌표가 없습니다.")
            return
        path = filedialog.asksaveasfilename(
            defaultextension=".yaml", filetypes=[("YAML", "*.yaml")],
            initialfile="waypoints.yaml")
        if not path:
            return
        poses = []
        for p in self.points:
            poses.append({
                "header": {"frame_id": "map"},
                "pose": {
                    "position": {"x": round(p["x"], 4), "y": round(p["y"], 4), "z": 0.0},
                    "orientation": {
                        "x": 0.0, "y": 0.0,
                        "z": round(math.sin(p["yaw"] / 2), 6),
                        "w": round(math.cos(p["yaw"] / 2), 6)},
                },
            })
        with open(path, "w", encoding="utf-8") as f:
            yaml.safe_dump({"poses": poses}, f, default_flow_style=False, sort_keys=False)
        self._flash(f"저장 완료: {path}")

    # ---------------------------------------------------------- 렌더링
    def redraw(self):
        c = self.canvas
        c.delete("all")
        if not self.map:
            return

        cw, ch = c.winfo_width(), c.winfo_height()
        if cw <= 1 or ch <= 1:
            return

        # 보이는 영역만 잘라서 그리기 (큰 맵에서도 빠름)
        x0, y0 = self.canvas_to_pixel(0, 0)
        x1, y1 = self.canvas_to_pixel(cw, ch)
        ix0 = max(0, int(math.floor(x0)))
        iy0 = max(0, int(math.floor(y0)))
        ix1 = min(self.map.width, int(math.ceil(x1)) + 1)
        iy1 = min(self.map.height, int(math.ceil(y1)) + 1)

        if ix1 > ix0 and iy1 > iy0:
            crop = self.map.image.crop((ix0, iy0, ix1, iy1))
            nw = max(1, int(round((ix1 - ix0) * self.scale)))
            nh = max(1, int(round((iy1 - iy0) * self.scale)))
            resample = Image.NEAREST if self.scale >= 1 else Image.BOX
            self._tkimg = ImageTk.PhotoImage(crop.resize((nw, nh), resample))
            cx, cy = self.pixel_to_canvas(ix0, iy0)
            c.create_image(cx, cy, anchor="nw", image=self._tkimg)

        self._draw_grid(cw, ch)
        self._draw_origin()
        self._draw_points()

    def _draw_grid(self, cw, ch):
        if not self.var_grid.get():
            return
        step_px = 1.0 / self.map.resolution * self.scale   # 1 m
        if step_px < 12:
            return
        min_x, min_y, max_x, max_y = self.map.extent()
        for gx in range(int(math.floor(min_x)), int(math.ceil(max_x)) + 1):
            px, _ = self.map.world_to_pixel(gx, 0)
            sx, _ = self.pixel_to_canvas(px, 0)
            self.canvas.create_line(sx, 0, sx, ch, fill="#00aaff", width=1, dash=(2, 4))
            if abs(gx) % 5 == 0:
                self.canvas.create_text(sx + 3, 12, text=f"{gx}", fill="#00aaff", anchor="w")
        for gy in range(int(math.floor(min_y)), int(math.ceil(max_y)) + 1):
            _, py = self.map.world_to_pixel(0, gy)
            _, sy = self.pixel_to_canvas(0, py)
            self.canvas.create_line(0, sy, cw, sy, fill="#00aaff", width=1, dash=(2, 4))
            if abs(gy) % 5 == 0:
                self.canvas.create_text(3, sy - 8, text=f"{gy}", fill="#00aaff", anchor="w")

    def _draw_origin(self):
        """map frame 원점 (0,0) 과 x/y 축 표시"""
        px, py = self.map.world_to_pixel(0.0, 0.0)
        ox, oy = self.pixel_to_canvas(px, py)
        L = 40
        ax = self.map.origin_yaw
        self.canvas.create_line(ox, oy, ox + L * math.cos(ax), oy - L * math.sin(ax),
                                fill="#ff3b30", width=2, arrow="last")
        self.canvas.create_line(ox, oy, ox - L * math.sin(ax), oy - L * math.cos(ax),
                                fill="#34c759", width=2, arrow="last")
        self.canvas.create_text(ox + 6, oy + 12, text="(0, 0)", fill="#ffcc00", anchor="w")

    def _draw_points(self):
        sel_idx = {self.tree.index(i) for i in self.tree.selection()}
        for i, p in enumerate(self.points):
            cx, cy = self.pixel_to_canvas(p["px"], p["py"])
            r = self.MARKER_R + (2 if i in sel_idx else 0)
            color = "#ffcc00" if i in sel_idx else "#ff4d4d"
            if i > 0:
                prev = self.points[i - 1]
                pcx, pcy = self.pixel_to_canvas(prev["px"], prev["py"])
                self.canvas.create_line(pcx, pcy, cx, cy, fill="#ffffff",
                                        width=1, dash=(4, 3))
            if abs(p["yaw"]) > 1e-9:
                L = 26
                self.canvas.create_line(
                    cx, cy,
                    cx + L * math.cos(p["yaw"] - self.map.origin_yaw),
                    cy - L * math.sin(p["yaw"] - self.map.origin_yaw),
                    fill=color, width=2, arrow="last", arrowshape=(10, 12, 4))
            self.canvas.create_oval(cx - r, cy - r, cx + r, cy + r,
                                    fill=color, outline="#000000")
            self.canvas.create_text(cx + r + 4, cy - r - 4,
                                    text=f"{i + 1}", fill="#ffffff", anchor="w",
                                    font=("TkDefaultFont", 9, "bold"))

    # ---------------------------------------------------------- 기타
    def _set_status(self, text: str):
        self.status.configure(text=text or "준비됨")

    def _flash(self, text: str):
        self._set_status(text)
        self.after(4000, lambda: self._set_status(""))


# ---------------------------------------------------------------- 진입점
def main():
    missing = []
    if yaml is None:
        missing.append("pyyaml")
    if Image is None:
        missing.append("pillow")
    if missing:
        print("필요한 패키지가 없습니다. 아래 명령으로 설치하세요:")
        print(f"    pip install {' '.join(missing)}")
        sys.exit(1)

    initial = sys.argv[1] if len(sys.argv) > 1 else None
    app = MapPickerApp(initial)
    app.mainloop()


if __name__ == "__main__":
    main()