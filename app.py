import os, json
from flask import Flask, render_template, request, redirect, url_for
from werkzeug.utils import secure_filename

app = Flask(__name__)

CONFIG_FILE   = 'config.json'
UPLOAD_FOLDER = os.path.join('static', 'uploads')
ALLOWED_EXT   = {'jpg', 'jpeg', 'png', 'webp', 'gif'}
ALLOWED_AUDIO = {'mp3', 'ogg', 'wav', 'm4a'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Render uses ephemeral filesystem — warn in console
if os.environ.get('RENDER'):
    print("⚠️  Running on Render — uploaded files are temporary. Use /setup to re-upload after redeploy.")

DEFAULT_CONFIG = {
    "person1":     "Name",
    "person2":     "Name",
    "message":     "Every day with you feels like the beginning of something beautiful. Thank you for your smile, your warmth, and for being exactly you. Here's to many more months together.",
    "target_date": "2026-05-18T09:15",
    "photos":      [],
    "music":       ""
}

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE) as f:
            data = json.load(f)
            for k, v in DEFAULT_CONFIG.items():
                data.setdefault(k, v)
            return data
    return DEFAULT_CONFIG.copy()

def save_config(cfg):
    with open(CONFIG_FILE, 'w') as f:
        json.dump(cfg, f, indent=2)

def allowed_image(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXT

def allowed_audio(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_AUDIO

@app.route('/')
def home():
    cfg = load_config()
    return render_template('index.html', cfg=cfg)

@app.route('/setup', methods=['GET', 'POST'])
def setup():
    cfg   = load_config()
    saved = False

    if request.method == 'POST':
        action = request.form.get('action')

        if action == 'save_details':
            cfg['person1']     = request.form.get('person1', '').strip()
            cfg['person2']     = request.form.get('person2', '').strip()
            cfg['message']     = request.form.get('message', '').strip()
            cfg['target_date'] = request.form.get('target_date', '').strip()
            save_config(cfg)
            saved = True

        elif action == 'upload_photos':
            files = request.files.getlist('photos')
            for f in files:
                if f and allowed_image(f.filename):
                    fname = secure_filename(f.filename)
                    base, ext = os.path.splitext(fname)
                    counter = 1
                    while os.path.exists(os.path.join(UPLOAD_FOLDER, fname)):
                        fname = f"{base}_{counter}{ext}"
                        counter += 1
                    f.save(os.path.join(UPLOAD_FOLDER, fname))
                    if fname not in cfg['photos']:
                        cfg['photos'].append(fname)
            save_config(cfg)
            saved = True

        elif action == 'delete_photo':
            fname = request.form.get('filename')
            path  = os.path.join(UPLOAD_FOLDER, fname)
            if os.path.exists(path):
                os.remove(path)
            if fname in cfg['photos']:
                cfg['photos'].remove(fname)
            save_config(cfg)

        elif action == 'upload_music':
            f = request.files.get('music')
            if f and allowed_audio(f.filename):
                # remove old music file if exists
                if cfg['music']:
                    old = os.path.join(UPLOAD_FOLDER, cfg['music'])
                    if os.path.exists(old):
                        os.remove(old)
                fname = secure_filename(f.filename)
                f.save(os.path.join(UPLOAD_FOLDER, fname))
                cfg['music'] = fname
                save_config(cfg)
                saved = True

        elif action == 'delete_music':
            if cfg['music']:
                path = os.path.join(UPLOAD_FOLDER, cfg['music'])
                if os.path.exists(path):
                    os.remove(path)
                cfg['music'] = ''
                save_config(cfg)

        return redirect(url_for('setup', saved='1') if saved else url_for('setup'))

    return render_template('setup.html', cfg=cfg, saved=request.args.get('saved'))

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
