#!/usr/bin/env python3
"""ShopX Backend – Flask + Socket.IO"""

import json
import os
from datetime import datetime
from threading import Lock

from flask import Flask, jsonify, request, send_from_directory
from flask_socketio import SocketIO, emit, join_room

# ── CONFIG ────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_DIR   = os.path.join(BASE_DIR, 'data')
LOGS_FILE  = os.path.join(DATA_DIR, 'logs.json')
SESS_FILE  = os.path.join(DATA_DIR, 'sessions.json')
MAX_LOGS   = 1000

os.makedirs(DATA_DIR, exist_ok=True)

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
_active_session = {'active': False, 'name': None}

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
    print(f'[WS] Oturum başlatıldı: {_active_session["name"]}')

@socketio.on('session_stopped')
def on_session_stopped(data):
    """Admin → Sunucu: Oturum durduruldu — siteyi sıfırla"""
    global _active_session
    _active_session = {'active': False, 'name': None}
    emit('command', {'cmd': 'SESSION_STOPPED'}, to='shop')
    print(f'[WS] Oturum durduruldu, site sıfırlanıyor')

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

# ── BAŞLAT ────────────────────────────────────────────────
if __name__ == '__main__':
    print('=' * 50)
    print('  ShopX Backend')
    print('  Shop  →  http://localhost:5000')
    print('  Admin →  http://localhost:5000/admin')
    print('=' * 50)
    socketio.run(app, host='0.0.0.0', port=5000, debug=True,
                 allow_unsafe_werkzeug=True)
