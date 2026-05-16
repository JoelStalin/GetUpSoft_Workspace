from flask import Flask, render_template, request, send_file
from PIL import Image
import qrcode
import validators
import os
from io import BytesIO
import base64

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def create_qr_with_logo(data, logo_path, fill_color="black", back_color="white", box_size=10):
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=box_size,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)

        qr_img = qr.make_image(fill_color=fill_color, back_color=back_color).convert('RGB')
        
        if logo_path:
            logo = Image.open(logo_path)
            qr_width, qr_height = qr_img.size
            logo_size = int(qr_width / 4)
            logo = logo.resize((logo_size, logo_size), Image.LANCZOS)
            pos = ((qr_width - logo_size) // 2, (qr_height - logo_size) // 2)
            qr_img.paste(logo, pos, mask=logo if logo.mode == 'RGBA' else None)
        
        img_buffer = BytesIO()
        qr_img.save(img_buffer, format="PNG")
        img_buffer.seek(0)
        return img_buffer
    except Exception as e:
        raise RuntimeError(f"Error generando el código QR: {e}")

@app.route('/', methods=['GET', 'POST'])
def index():
    qr_image_base64 = None
    error_message = None

    if request.method == 'POST':
        url = request.form.get('url')
        fill_color = request.form.get('fill_color', "black")
        back_color = request.form.get('back_color', "white")
        size_option = request.form.get('size_option')
        size_mapping = {"Pequeño": 5, "Mediano": 10, "Grande": 15}
        box_size = size_mapping.get(size_option, 10)
        
        logo_file = request.files.get('logo')
        logo_path = None

        # Validaciones
        if not url:
            error_message = "Por favor, ingresa la URL."
        elif not validators.url(url):
            error_message = "Por favor, ingresa una URL válida."
        elif logo_file and logo_file.filename:
            logo_path = os.path.join(app.config['UPLOAD_FOLDER'], logo_file.filename)
            logo_file.save(logo_path)
        
        # Generar QR si no hubo errores
        if not error_message:
            try:
                qr_image_data = create_qr_with_logo(url, logo_path, fill_color, back_color, box_size)
                qr_image_base64 = base64.b64encode(qr_image_data.getvalue()).decode('utf-8')
            except Exception as e:
                error_message = str(e)

    return render_template('index.html', qr_image_base64=qr_image_base64, error_message=error_message)

@app.route('/download_qr')
def download_qr():
    qr_image_base64 = request.args.get('qr_image')
    if qr_image_base64:
        img_bytes = base64.b64decode(qr_image_base64)
        return send_file(BytesIO(img_bytes), mimetype='image/png', as_attachment=True, download_name='qr_code.png')
    return "No QR code available", 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)
