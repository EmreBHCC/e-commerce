#!/usr/bin/env python3
"""ShopX Backend – Flask + Socket.IO"""

import json
import os
import re
import subprocess
import sys
import webbrowser
from datetime import datetime
from threading import Lock, Thread, Timer

from flask import Flask, jsonify, request, send_from_directory
from flask_socketio import SocketIO, emit, join_room

# ── CONFIG ────────────────────────────────────────────────
BASE_DIR        = os.path.dirname(os.path.abspath(__file__))
DATA_DIR        = os.path.join(BASE_DIR, 'data')
LOGS_FILE       = os.path.join(DATA_DIR, 'logs.json')
SESS_FILE       = os.path.join(DATA_DIR, 'sessions.json')
HEATMAPS_DIR    = os.path.join(DATA_DIR, 'heatmaps')
EYETRACKER_FILE = os.path.join(BASE_DIR, 'eye-tracker.py')
EYETRACKER_STOP      = os.path.join(DATA_DIR, 'eyetracker_stop')
EYETRACKER_CALIBRATE = os.path.join(DATA_DIR, 'eyetracker_calibrate')
MAX_LOGS        = 1000

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(HEATMAPS_DIR, exist_ok=True)

app       = Flask(__name__, static_folder=BASE_DIR, static_url_path='')
app.config['SECRET_KEY'] = 'shopx-secret-2026'
socketio  = SocketIO(app, cors_allowed_origins='*', async_mode='threading')
_lock     = Lock()

# ── JSON HELPERS ──────────────────────────────────────────
def read_json(path, default=None):
    if default is None:
        default = []
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default

def write_json(path, data):
    with _lock:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

# ── STATIC DOSYALAR ───────────────────────────────────────
@app.route('/')
def serve_index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/admin')
@app.route('/admin.html')
def serve_admin():
    return send_from_directory(BASE_DIR, 'admin.html')

# ── REST: LOGLAR ──────────────────────────────────────────
@app.route('/api/logs', methods=['GET'])
def api_get_logs():
    limit = int(request.args.get('limit', 500))
    return jsonify(read_json(LOGS_FILE)[:limit])

@app.route('/api/logs/clear', methods=['POST'])
def api_clear_logs():
    write_json(LOGS_FILE, [])
    socketio.emit('logs_cleared', to='admin')
    return jsonify({'ok': True})

# ── REST: OTURUMLAR ───────────────────────────────────────
@app.route('/api/sessions', methods=['GET'])
def api_get_sessions():
    return jsonify(read_json(SESS_FILE))

@app.route('/api/sessions', methods=['POST'])
def api_create_session():
    sess = request.json
    if not sess or 'id' not in sess:
        return jsonify({'error': 'Geçersiz oturum'}), 400
    sessions = read_json(SESS_FILE)
    sessions.insert(0, sess)
    write_json(SESS_FILE, sessions)
    socketio.emit('sessions_updated', to='admin')
    return jsonify({'ok': True}), 201

@app.route('/api/sessions/<session_id>', methods=['PUT'])
def api_update_session(session_id):
    sess = request.json
    if not sess:
        return jsonify({'error': 'Boş gövde'}), 400
    sessions = read_json(SESS_FILE)
    idx = next((i for i, s in enumerate(sessions) if s.get('id') == session_id), -1)
    if idx >= 0:
        sessions[idx] = sess
    else:
        sessions.insert(0, sess)
    write_json(SESS_FILE, sessions)
    return jsonify({'ok': True})

@app.route('/api/sessions/<session_id>', methods=['DELETE'])
def api_delete_session(session_id):
    sessions = [s for s in read_json(SESS_FILE) if s.get('id') != session_id]
    write_json(SESS_FILE, sessions)
    socketio.emit('sessions_updated', to='admin')
    return jsonify({'ok': True})

@app.route('/api/sessions/all', methods=['DELETE'])
def api_clear_sessions():
    write_json(SESS_FILE, [])
    socketio.emit('sessions_updated', to='admin')
    return jsonify({'ok': True})

@app.route('/api/export', methods=['GET'])
def api_export_all():
    return jsonify({
        'exportedAt': datetime.now().isoformat(),
        'sessions':   read_json(SESS_FILE),
        'logs':       read_json(LOGS_FILE),
    })

# ── AKTİF OTURUM TAKİBİ ──────────────────────────────────
_active_session   = {'active': False, 'name': None}
_eye_tracker_proc = None

# ── GÖZ TAKİBİ YÖNETİMİ ──────────────────────────────────
def _slug(name):
    return re.sub(r'[^\w]', '_', name)[:20].strip('_') or 'denek'

def start_eye_tracker(session_name):
    global _eye_tracker_proc
    # Eski süreci temizle
    if _eye_tracker_proc and _eye_tracker_proc.poll() is None:
        _eye_tracker_proc.terminate()
        try: _eye_tracker_proc.wait(timeout=3)
        except Exception: _eye_tracker_proc.kill()
    # Eski sinyalleri temizle
    try: os.remove(EYETRACKER_STOP)
    except FileNotFoundError: pass
    try: os.remove(EYETRACKER_CALIBRATE)
    except FileNotFoundError: pass

    if os.name == 'nt':
        # I/O redirect YOK — DirectShow stdout'a bağlı Windows handles kullanıyor.
        # Log dosyası eye-tracker.py içinden Python seviyesinde yazılıyor.
        kwargs = {'creationflags': subprocess.CREATE_NEW_CONSOLE}
    else:
        kwargs = {}
    try:
        _eye_tracker_proc = subprocess.Popen(
            [sys.executable, EYETRACKER_FILE,
             '--session', session_name,
             '--output-dir', os.path.join(DATA_DIR, _slug(session_name)),
             '--headless'],
            **kwargs
        )
        print(f'[EyeTracker] Başlatıldı PID={_eye_tracker_proc.pid}')
        _gaze_broadcaster_active = True
        Thread(target=_broadcast_gaze, daemon=True).start()
        Thread(target=_watch_eye_tracker, args=(session_name,), daemon=True).start()
    except Exception as e:
        print(f'[EyeTracker] Başlatma hatası: {e}')

def stop_eye_tracker():
    global _gaze_broadcaster_active
    _gaze_broadcaster_active = False
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(EYETRACKER_STOP, 'w') as f:
            f.write('stop')
        print('[EyeTracker] Durdurma sinyali yazıldı')
    except Exception as e:
        print(f'[EyeTracker] Sinyal hatası: {e}')

_gaze_broadcaster_active = False

def _broadcast_gaze():
    """screen_position.txt'yi okuyup shop sayfasına gaze pozisyonunu yayınla."""
    global _gaze_broadcaster_active
    import time as _t
    SCREEN_POS_FILE = os.path.join(BASE_DIR, 'screen_position.txt')
    last_line = ''
    while _gaze_broadcaster_active:
        try:
            with open(SCREEN_POS_FILE, 'r') as f:
                line = f.read().strip()
            if line and line != last_line:
                parts = line.split(',')
                if len(parts) == 2:
                    x, y = int(parts[0]), int(parts[1])
                    socketio.emit('gaze_position', {'x': x, 'y': y}, to='shop')
                    last_line = line
        except Exception:
            pass
        _t.sleep(0.05)  # ~20 fps

def _watch_eye_tracker(session_name):
    global _eye_tracker_proc, _gaze_broadcaster_active
    proc = _eye_tracker_proc
    if not proc:
        return
    proc.wait()
    _gaze_broadcaster_active = False
    print('[EyeTracker] Süreç tamamlandı, heatmap taranıyor...')
    import time as _t; _t.sleep(0.8)  # dosya yazımı için bekle

    slug     = _slug(session_name)
    sess_dir = os.path.join(DATA_DIR, slug)
    prefix   = slug + '_'
    if os.path.isdir(sess_dir):
        # URL yolu: "d3/d3_20260609_003710.png" formatında gönder
        files = [f"{slug}/{f}" for f in os.listdir(sess_dir)
                 if f.startswith(prefix) and f.endswith('.png')]
    else:
        files = []
    if files:
        socketio.emit('heatmap_saved', {'session': session_name, 'files': files}, to='admin')
        print(f'[EyeTracker] Heatmap gönderildi: {files}')
    else:
        print('[EyeTracker] Heatmap bulunamadı.')

# ── SOCKET.IO ─────────────────────────────────────────────
@socketio.on('connect')
def on_connect():
    print(f'[WS] bağlandı: {request.sid}')

@socketio.on('disconnect')
def on_disconnect():
    print(f'[WS] ayrıldı: {request.sid}')
    emit('shop_disconnected', to='admin')

@socketio.on('identify')
def on_identify(data):
    """Bağlanan istemci rolünü bildirir: 'shop' veya 'admin'"""
    role = data.get('role', 'unknown')
    join_room(role)
    if role == 'shop':
        emit('shop_connected', {'sid': request.sid}, to='admin')
        # Yeni bağlanan shop'a mevcut oturum durumunu bildir
        emit('session_status', _active_session)
        print(f'[WS] shop kimliği doğrulandı: {request.sid}')
    elif role == 'admin':
        # Bağlanan admin'e son 300 logu gönder
        logs = read_json(LOGS_FILE)[:300]
        emit('logs_history', logs)
        print(f'[WS] admin kimliği doğrulandı: {request.sid}')

@socketio.on('session_started')
def on_session_started(data):
    """Admin → Sunucu: Oturum başlatıldı"""
    global _active_session
    _active_session = {'active': True, 'name': data.get('name', '')}
    emit('command', {'cmd': 'SESSION_STARTED', 'name': _active_session['name']}, to='shop')
    start_eye_tracker(_active_session['name'])
    print(f'[WS] Oturum başlatıldı: {_active_session["name"]}')

@socketio.on('calibration_complete')
def on_calibration_complete(data):
    """Shop → Sunucu: 9-nokta kalibrasyonu tamamlandı, eye-tracker'a sinyal gönder"""
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(EYETRACKER_CALIBRATE, 'w') as f:
            f.write('calibrate')
        print('[EyeTracker] Kalibrasyon sinyali yazıldı')
    except Exception as e:
        print(f'[EyeTracker] Kalibrasyon sinyal hatası: {e}')

@socketio.on('session_stopped')
def on_session_stopped(data):
    """Admin → Sunucu: Oturum durduruldu — siteyi sıfırla"""
    global _active_session
    name = _active_session.get('name', 'denek')
    _active_session = {'active': False, 'name': None}
    emit('command', {'cmd': 'SESSION_STOPPED'}, to='shop')
    stop_eye_tracker()
    print(f'[WS] Oturum durduruldu: {name}')

@socketio.on('log')
def on_log(entry):
    """Shop → Sunucu: yeni log girdisi"""
    logs = read_json(LOGS_FILE)
    logs.insert(0, entry)
    if len(logs) > MAX_LOGS:
        logs = logs[:MAX_LOGS]
    write_json(LOGS_FILE, logs)
    # Tüm admin istemcilerine ilet
    emit('log', entry, to='admin')

@socketio.on('heartbeat')
def on_heartbeat():
    """Shop → Sunucu → Admin: canlılık sinyali"""
    emit('heartbeat', to='admin')

@socketio.on('command')
def on_command(data):
    """Admin → Sunucu → Shop: uzak komut"""
    emit('command', data, to='shop')

@socketio.on('ack')
def on_ack(data):
    """Shop → Sunucu → Admin: komut onayı"""
    emit('ack', data, to='admin')

# ── HEATMAP SERVİSİ ───────────────────────────────────────
@app.route('/api/heatmap/<path:filename>')
def api_serve_heatmap(filename):
    # filename: "slug/file.png" veya "file.png" (eski format)
    clean = filename.replace('\\', '/')
    parts = clean.split('/')
    if any(p == '..' for p in parts) or len(parts) > 2:
        return jsonify({'error': 'Geçersiz dosya adı'}), 400
    if len(parts) == 2:
        subdir, fname = parts
        return send_from_directory(os.path.join(DATA_DIR, subdir), fname)
    return send_from_directory(HEATMAPS_DIR, parts[0])

@app.route('/api/heatmaps')
def api_list_heatmaps():
    metas = []
    # Hem eski data/heatmaps/ hem de yeni data/{denek}/ klasörlerini tara
    search_dirs = [HEATMAPS_DIR]
    if os.path.isdir(DATA_DIR):
        for d in os.listdir(DATA_DIR):
            full = os.path.join(DATA_DIR, d)
            if os.path.isdir(full) and d not in ('heatmaps',):
                search_dirs.append(full)
    for sdir in search_dirs:
        if not os.path.isdir(sdir): continue
        for fname in os.listdir(sdir):
            if not fname.endswith('.json'): continue
            try:
                with open(os.path.join(sdir, fname), 'r', encoding='utf-8') as f:
                    m = json.load(f)
                    # PNG yolunu "slug/file.png" formatına çevir
                    parent = os.path.basename(sdir)
                    if parent != 'heatmaps' and m.get('png'):
                        m['png'] = f"{parent}/{m['png']}"
                    metas.append(m)
            except Exception:
                pass
    return jsonify(sorted(metas, key=lambda x: x.get('timestamp', ''), reverse=True))

# ── BAŞLAT ────────────────────────────────────────────────
def _open_browser():
    webbrowser.open('http://localhost:5000')
    webbrowser.open_new_tab('http://localhost:5000/admin')

if __name__ == '__main__':
    print('=' * 50)
    print('  ShopX Backend')
    print('  Shop  →  http://localhost:5000')
    print('  Admin →  http://localhost:5000/admin')
    print('=' * 50)
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        Timer(1.5, _open_browser).start()
    socketio.run(app, host='0.0.0.0', port=5000, debug=True,
                 allow_unsafe_werkzeug=True)
