import threading
import tkinter as tk
from tkinter import ttk, messagebox
import socket
import ssl
import win32print
import json
import os
from io import BytesIO
from PIL import Image
from PyPDF2 import PdfReader
import logging
import subprocess
import requests
import shutil
import sys
import zipfile
import platform
import urllib.parse
import http.client
import ctypes

# ===================== CONFIGURACIÓN =====================
CONFIG_FILE = "config.json"
selected_printer = None
proxy_running = False
proxy_thread = None
AUTH_TOKEN = "supersecreto123"
LOG_FILE = "proxy_log.txt"
CERT_FILE = "cert.pem"
KEY_FILE = "key.pem"
OPENSSL_DIR = "openssl"
OPENSSL_BINARY = "openssl.exe" if platform.system() == "Windows" else "openssl"
OPENSSL_DEFAULT_INSTALL_PATH = r"C:\Program Files\OpenSSL-Win64\bin\openssl.exe"
USE_SSL = True  # Variable global para controlar el modo HTTP/HTTPS

# ===================== REGISTRO =====================
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

# ===================== VERIFICAR Y SOLICITAR PRIVILEGIOS DE ADMINISTRADOR =====================
def is_admin():
    """Verifica si el script se está ejecutando con privilegios de administrador."""
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def request_admin_privileges():
    """Solicita privilegios de administrador relanzando el script con elevación."""
    if is_admin():
        return True  # Ya tiene privilegios de administrador

    # Relanzar el script con privilegios de administrador
    script_path = os.path.abspath(sys.argv[0])
    try:
        # Usar ShellExecuteW para solicitar elevación
        ctypes.windll.shell32.ShellExecuteW(
            None, "runas", sys.executable, f'"{script_path}"', None, 1
        )
        # Salir del proceso actual (sin privilegios)
        sys.exit(0)
    except Exception as e:
        logging.error(f"❌ Error al solicitar privilegios de administrador: {e}")
        messagebox.showerror(
            "Error",
            "No se pudo solicitar privilegios de administrador.\n\n"
            "Por favor, ejecute el script manualmente como administrador:\n"
            "1. Haga clic derecho sobre el script.\n"
            "2. Seleccione 'Ejecutar como administrador'."
        )
        sys.exit(1)

# ===================== INSTALACIÓN AUTOMÁTICA DEL CERTIFICADO =====================
def install_certificate():
    """Instala el certificado cert.pem en el almacén de certificados confiables de Windows."""
    if platform.system() != "Windows":
        logging.info("📜 Instalación automática de certificados solo está soportada en Windows.")
        return False

    # Verificar que el archivo cert.pem exista
    if not os.path.exists(CERT_FILE):
        logging.error(f"❌ El archivo {CERT_FILE} no existe.")
        messagebox.showerror("Error", f"No se encontró el archivo {CERT_FILE}. No se puede instalar el certificado.")
        return False

    try:
        # Usar certutil para agregar el certificado al almacén de certificados confiables
        certutil_cmd = ["certutil", "-addstore", "-f", "Root", CERT_FILE]
        result = subprocess.run(certutil_cmd, capture_output=True, text=True, check=True)
        logging.info(f"✅ Certificado instalado correctamente:\n{result.stdout}")
        messagebox.showinfo(
            "Certificado Instalado",
            "El certificado SSL ha sido instalado automáticamente en el almacén de certificados confiables.\n\n"
            "Por favor, reinicie su navegador o aplicación para que los cambios surtan efecto."
        )
        return True
    except subprocess.CalledProcessError as e:
        logging.error(f"❌ Error al instalar el certificado: {e.stderr}")
        if "access denied" in e.stderr.lower():
            messagebox.showerror(
                "Error de Permisos",
                "No se pudo instalar el certificado debido a falta de permisos.\n\n"
                "Por favor, ejecute el script como administrador:\n"
                "1. Haga clic derecho sobre el script.\n"
                "2. Seleccione 'Ejecutar como administrador'.\n\n"
                "Alternativamente, puede instalar el certificado manualmente siguiendo las instrucciones."
            )
        else:
            messagebox.showerror("Error", f"No se pudo instalar el certificado.\nDetalles: {e.stderr}")
        return False
    except Exception as e:
        logging.error(f"❌ Error al instalar el certificado: {e}")
        messagebox.showerror("Error", f"No se pudo instalar el certificado: {e}")
        return False

# ===================== DESCARGA E INSTALACIÓN DE OPENSSL =====================
def check_openssl_installed():
    """Verifica si OpenSSL está instalado y accesible."""
    global OPENSSL_BINARY
    possible_paths = [
        OPENSSL_BINARY,
        OPENSSL_DEFAULT_INSTALL_PATH,
        os.path.join(os.getcwd(), OPENSSL_DIR, "Win64OpenSSL-3_4_1", "bin", "openssl.exe"),
    ]

    for path in possible_paths:
        try:
            result = subprocess.run([path, "version"], capture_output=True, text=True, check=True)
            logging.info(f"✅ OpenSSL encontrado en {path}: {result.stdout.strip()}")
            OPENSSL_BINARY = path
            return True
        except (subprocess.CalledProcessError, FileNotFoundError, PermissionError):
            continue
    logging.warning("⚠️ OpenSSL no está instalado o no se encuentra en el PATH.")
    return False

def download_and_install_openssl():
    """Descarga e instala OpenSSL automáticamente según el sistema operativo."""
    if check_openssl_installed():
        logging.info("✅ OpenSSL ya está instalado. No se requiere descarga.")
        return True

    system = platform.system()
    if system == "Windows":
        openssl_urls = [
            "https://slproweb.com/download/Win64OpenSSL_Light-3_4_1.msi",
        ]
        openssl_msi = "Win64OpenSSL_Light-3_4_1.msi"
        downloaded = False

        for url in openssl_urls:
            try:
                logging.info(f"📥 Intentando descargar OpenSSL desde {url}...")
                response = requests.get(url, stream=True)
                response.raise_for_status()
                with open(openssl_msi, "wb") as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                logging.info("✅ Descarga completada.")
                downloaded = True
                break
            except requests.exceptions.RequestException as e:
                logging.warning(f"⚠️ Error al descargar desde {url}: {e}")
                continue

        if not downloaded:
            error_msg = "No se pudo descargar OpenSSL desde ninguna fuente. Por favor, descárguelo manualmente desde https://slproweb.com/products/Win32OpenSSL.html e instálelo."
            logging.error(f"❌ {error_msg}")
            messagebox.showerror("Error", error_msg)
            return False

        try:
            logging.info("📦 Instalando OpenSSL...")
            subprocess.run(["msiexec", "/i", openssl_msi, "/quiet", "/norestart"], check=True)
            os.remove(openssl_msi)
            logging.info("✅ Instalación completada.")

            if not check_openssl_installed():
                logging.error("❌ OpenSSL no se encontró después de la instalación.")
                messagebox.showerror("Error", "OpenSSL no se encontró después de la instalación. Asegúrese de que se instaló correctamente.")
                return False

        except subprocess.CalledProcessError as e:
            logging.error(f"❌ Error al instalar OpenSSL: {e}")
            messagebox.showerror("Error", f"No se pudo instalar OpenSSL. Es posible que necesite permisos de administrador.\nDetalles: {e}")
            return False
        except Exception as e:
            logging.error(f"❌ Error al instalar OpenSSL: {e}")
            messagebox.showerror("Error", f"No se pudo instalar OpenSSL: {e}")
            return False

    elif system == "Linux":
        try:
            logging.info("📥 Instalando OpenSSL en Linux...")
            subprocess.run(["sudo", "apt", "update"], check=True)
            subprocess.run(["sudo", "apt", "install", "-y", "openssl"], check=True)
            logging.info("✅ OpenSSL instalado en Linux.")
        except Exception as e:
            logging.error(f"❌ Error al instalar OpenSSL en Linux: {e}")
            messagebox.showerror("Error", f"No se pudo instalar OpenSSL en Linux: {e}")
            return False

    elif system == "Darwin":
        try:
            logging.info("📥 Instalando OpenSSL en macOS...")
            subprocess.run(["brew", "install", "openssl"], check=True)
            logging.info("✅ OpenSSL instalado en macOS.")
        except Exception as e:
            logging.error(f"❌ Error al instalar OpenSSL en macOS: {e}")
            messagebox.showerror("Error", f"No se pudo instalar OpenSSL en macOS: {e}")
            return False

    else:
        logging.error(f"❌ Sistema operativo no soportado: {system}")
        messagebox.showerror("Error", f"Sistema operativo no soportado: {system}")
        return False

    return True

# ===================== GENERACIÓN DE SSL =====================
def generate_ssl_cert():
    """Genera certificados SSL con SAN para localhost y 127.0.0.1."""
    if not os.path.exists(CERT_FILE) or not os.path.exists(KEY_FILE):
        if not check_openssl_installed():
            if not download_and_install_openssl():
                return False

        try:
            logging.info("🔒 Generando certificado SSL con SAN...")

            # Crear un archivo de configuración temporal para OpenSSL
            openssl_conf = """
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = 127.0.0.1

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
"""
            conf_file = "openssl-san.conf"
            with open(conf_file, "w") as f:
                f.write(openssl_conf)

            # Generar el certificado con SAN
            result = subprocess.run([
                OPENSSL_BINARY, "req", "-x509", "-newkey", "rsa:2048",
                "-keyout", KEY_FILE, "-out", CERT_FILE, "-days", "365", "-nodes",
                "-config", conf_file
            ], check=True, capture_output=True, text=True)

            # Eliminar el archivo de configuración temporal
            os.remove(conf_file)

            logging.info("✅ Certificado SSL generado correctamente con SAN para localhost y 127.0.0.1.")
            
            # Instalar el certificado automáticamente en Windows
            install_certificate()
            
            # Mostrar instrucciones manuales por si la instalación automática falla
            show_trust_instructions()
            return True
        except subprocess.CalledProcessError as e:
            logging.error(f"❌ Error generando certificado SSL: {e.stderr}")
            messagebox.showerror("Error", f"No se pudo generar el certificado SSL.\nDetalles: {e.stderr}")
            return False
        except FileNotFoundError:
            logging.error("❌ OpenSSL no está instalado o no se encuentra en the PATH.")
            messagebox.showerror("Error", "OpenSSL no está instalado o no se encuentra en the PATH.")
            return False
    else:
        # Si el certificado ya existe, intentar instalarlo de nuevo
        install_certificate()
        show_trust_instructions()
    return True

def show_trust_instructions():
    """Muestra instrucciones para confiar en el certificado SSL manualmente."""
    messagebox.showinfo(
        "Certificado SSL Generado",
        f"Se ha generado un certificado SSL autofirmado en {CERT_FILE}.\n\n"
        "Se intentó instalar el certificado automáticamente, pero si sigue viendo errores como 'ERR_CERT_COMMON_NAME_INVALID', "
        "puede instalarlo manualmente:\n"
        "1. Abra el archivo cert.pem (ubicado en el directorio del script).\n"
        "2. Importe el certificado a su almacén de certificados confiables:\n"
        "   - En Windows: Haga doble clic en cert.pem, seleccione 'Instalar certificado', "
        "elija 'Máquina local', y colóquelo en 'Autoridades de certificación raíz de confianza'.\n"
        "   - En macOS: Abra el archivo en 'Acceso a Llaveros', arrástrelo a 'Sistema', y confíelo.\n"
        "   - En Linux: Agregue el certificado a su almacén de certificados (por ejemplo, /usr/local/share/ca-certificates).\n"
        "3. Reinicie su navegador o aplicación.\n\n"
        "Si no puede confiar en el certificado, puede cambiar al modo HTTP (no seguro) desde la interfaz."
    )

def check_certificate_trust(ip, port):
    """Verifica si el certificado SSL es confiable intentando una conexión HTTPS."""
    try:
        conn = http.client.HTTPSConnection(ip, port, timeout=2)
        conn.request("GET", "/")
        conn.getresponse()
        conn.close()
        return True
    except ssl.SSLError as e:
        if "CERTIFICATE_VERIFY_FAILED" in str(e):
            logging.warning("⚠️ El certificado SSL no es confiable por el cliente.")
            return False
        logging.error(f"❌ Error al verificar el certificado: {e}")
        return False
    except Exception as e:
        logging.error(f"❌ Error al verificar el certificado: {e}")
        return False

# ===================== FUNCIONES DE CONFIGURACIÓN =====================
def load_config():
    global selected_printer, USE_SSL
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as file:
                config = json.load(file)
                ip_entry.insert(0, config.get("ip", ""))
                port_entry.insert(0, config.get("port", ""))
                selected_printer = config.get("printer", "")
                USE_SSL = config.get("use_ssl", True)
                ssl_var.set(USE_SSL)
                if selected_printer in printer_dropdown["values"]:
                    printer_dropdown.set(selected_printer)
        except Exception as e:
            logging.error(f"Error cargando configuración: {e}")

def save_config():
    config = {
        "ip": ip_entry.get().strip(),
        "port": port_entry.get().strip(),
        "printer": selected_printer,
        "use_ssl": USE_SSL,
    }
    try:
        with open(CONFIG_FILE, "w") as file:
            json.dump(config, file, indent=4)
        logging.info("✅ Configuración guardada correctamente")
    except Exception as e:
        logging.error(f"❌ Error guardando configuración: {e}")

def on_printer_selected(event):
    global selected_printer
    selected_printer = printer_dropdown.get()
    save_config()
    logging.info(f"🖨️ Impresora seleccionada: {selected_printer}")

def toggle_ssl_mode():
    global USE_SSL
    USE_SSL = ssl_var.get()
    save_config()
    logging.info(f"🔒 Modo SSL: {'Activado' if USE_SSL else 'Desactivado'}")
    if not USE_SSL:
        messagebox.showwarning(
            "Advertencia de Seguridad",
            "El modo HTTP (no seguro) está activado. Esto significa que las comunicaciones no estarán cifradas.\n\n"
            "Deberá actualizar su sistema POS para usar 'http://127.0.0.1:9060' en lugar de 'https://127.0.0.1:9060'.\n\n"
            "Recomendación: Use HTTPS y confíe en el certificado SSL para mayor seguridad."
        )

# ===================== VALIDACIONES =====================
def is_valid_ip(ip):
    try:
        socket.inet_aton(ip)
        return True
    except socket.error:
        return False

def is_valid_port(port):
    try:
        port = int(port)
        return 1 <= port <= 65535
    except ValueError:
        return False

# ===================== FUNCIONES DE IMPRESIÓN =====================
def get_available_printers():
    return [printer[2] for printer in win32print.EnumPrinters(2)]

def print_data(printer_name, data):
    try:
        hprinter = win32print.OpenPrinter(printer_name)
        job = win32print.StartDocPrinter(hprinter, 1, ("Proxy Print Job", None, "RAW"))
        win32print.StartPagePrinter(hprinter)
        win32print.WritePrinter(hprinter, data)
        win32print.EndPagePrinter(hprinter)
        win32print.EndDocPrinter(hprinter)
        win32print.ClosePrinter(hprinter)
        logging.info("✅ Impresión completada correctamente")
    except Exception as e:
        logging.error(f"❌ Error al imprimir: {e}")

def print_pdf(printer_name, data):
    try:
        with BytesIO(data) as f:
            reader = PdfReader(f)
            text = "\n".join(
                [page.extract_text() for page in reader.pages if page.extract_text()]
            )
            print_data(printer_name, text.encode("utf-8"))
    except Exception as e:
        logging.error(f"❌ Error al imprimir PDF: {e}")

def print_image(printer_name, data):
    try:
        with BytesIO(data) as f:
            img = Image.open(f)
            img = img.convert('RGB')
            raw_data = img.tobytes()
            print_data(printer_name, raw_data)
    except Exception as e:
        logging.error(f"❌ Error al imprimir imagen: {e}")

# ===================== AUTENTICACIÓN =====================
def is_authenticated(token):
    return token == AUTH_TOKEN

# ===================== PROXY TCP =====================
def handle_client(client_socket):
    global selected_printer
    try:
        # Set a timeout to avoid hanging
        client_socket.settimeout(10)
        data = client_socket.recv(8192)
        if not data:
            logging.warning("⚠️ No se recibieron datos del cliente.")
            response = (
                b"HTTP/1.1 400 Bad Request\r\n"
                b"Content-Length: 0\r\n"
                b"Connection: close\r\n"
                b"Access-Control-Allow-Origin: https://chefalitas.com.do\r\n"
                b"Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n"
                b"Access-Control-Allow-Headers: Authorization, Content-Type\r\n"
                b"\r\n"
            )
            client_socket.send(response)
            return

        request_str = data.decode('utf-8', errors='ignore')
        logging.info(f"📥 Solicitud recibida:\n{request_str}")

        request_lines = request_str.split('\r\n')
        if not request_lines:
            logging.warning("⚠️ Solicitud vacía o mal formada.")
            response = (
                b"HTTP/1.1 400 Bad Request\r\n"
                b"Content-Length: 0\r\n"
                b"Connection: close\r\n"
                b"Access-Control-Allow-Origin: https://chefalitas.com.do\r\n"
                b"Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n"
                b"Access-Control-Allow-Headers: Authorization, Content-Type\r\n"
                b"\r\n"
            )
            client_socket.send(response)
            return

        request_line = request_lines[0].split()
        if len(request_line) < 3:
            logging.warning("⚠️ Línea de solicitud mal formada.")
            response = (
                b"HTTP/1.1 400 Bad Request\r\n"
                b"Content-Length: 0\r\n"
                b"Connection: close\r\n"
                b"Access-Control-Allow-Origin: https://chefalitas.com.do\r\n"
                b"Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n"
                b"Access-Control-Allow-Headers: Authorization, Content-Type\r\n"
                b"\r\n"
            )
            client_socket.send(response)
            return

        method, path, _ = request_line
        logging.info(f"📋 Método: {method}, Ruta: {path}")

        # Handle CORS preflight request (OPTIONS)
        if method == "OPTIONS":
            logging.info("📋 Respondiendo a solicitud OPTIONS (preflight).")
            response = (
                b"HTTP/1.1 200 OK\r\n"
                b"Content-Length: 0\r\n"
                b"Connection: close\r\n"
                b"Access-Control-Allow-Origin: https://chefalitas.com.do\r\n"
                b"Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n"
                b"Access-Control-Allow-Headers: Authorization, Content-Type\r\n"
                b"\r\n"
            )
            client_socket.send(response)
            return

        parsed_url = urllib.parse.urlparse(path)
        query_params = urllib.parse.parse_qs(parsed_url.query)
        logging.info(f"🔍 Parámetros de consulta: {query_params}")

        if parsed_url.path != "/cgi-bin/epos/service.cgi":
            logging.warning(f"⚠️ Ruta no soportada: {parsed_url.path}")
            response = (
                b"HTTP/1.1 404 Not Found\r\n"
                b"Content-Length: 0\r\n"
                b"Connection: close\r\n"
                b"Access-Control-Allow-Origin: https://chefalitas.com.do\r\n"
                b"Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n"
                b"Access-Control-Allow-Headers: Authorization, Content-Type\r\n"
                b"\r\n"
            )
            client_socket.send(response)
            return

        devid = query_params.get('devid', [None])[0]
        if devid != "local_printer":
            logging.warning(f"⚠️ devid no válido: {devid}")
            response = (
                b"HTTP/1.1 400 Bad Request\r\n"
                b"Content-Length: 24\r\n"
                b"Connection: close\r\n"
                b"Access-Control-Allow-Origin: https://chefalitas.com.do\r\n"
                b"Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n"
                b"Access-Control-Allow-Headers: Authorization, Content-Type\r\n"
                b"\r\n"
                b"Invalid devid"
            )
            client_socket.send(response)
            return

        try:
            headers, body = data.split(b"\r\n\r\n", 1)
            headers_str = headers.decode('utf-8', errors='ignore')
            logging.info(f"📋 Encabezados recibidos:\n{headers_str}")
        except ValueError:
            logging.warning("⚠️ No se pudieron dividir los encabezados y el cuerpo.")
            body = b""
            headers_str = ""

        # Check for Authorization header
        auth_valid = False
        auth_header = None
        for header in headers.split(b"\r\n"):
            if header.startswith(b"Authorization:"):
                auth_header = header.decode('utf-8', errors='ignore')
                logging.info(f"🔐 Authorization header encontrado: {auth_header}")
                if header.startswith(b"Authorization: Bearer "):
                    token = header.split(b"Authorization: Bearer ")[1].strip()
                    token_str = token.decode("utf-8", errors='ignore')
                    logging.info(f"🔐 Token extraído: {token_str}")
                    if token_str == AUTH_TOKEN:
                        auth_valid = True
                        logging.info("✅ Autenticación exitosa.")
                    else:
                        logging.warning(f"⚠️ Token no coincide con AUTH_TOKEN: {token_str} != {AUTH_TOKEN}")
                else:
                    logging.warning(f"⚠️ Formato de Authorization header no soportado: {auth_header}")
                break

        if auth_header is None:
            logging.warning("⚠️ No se encontró el header Authorization en la solicitud.")

        # Temporarily bypass authentication for testing
        # Comment out the following line to re-enable authentication
        auth_valid = True
        logging.info("🔓 Autenticación temporalmente desactivada para pruebas.")

        if not auth_valid:
            logging.warning("⚠️ Token de autenticación no válido.")
            response = (
                b"HTTP/1.1 403 Forbidden\r\n"
                b"Content-Length: 16\r\n"
                b"Connection: close\r\n"
                b"Access-Control-Allow-Origin: https://chefalitas.com.do\r\n"
                b"Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n"
                b"Access-Control-Allow-Headers: Authorization, Content-Type\r\n"
                b"\r\n"
                b"Invalid Token"
            )
            client_socket.send(response)
            return

        # Process the print job
        if body[:4] == b"%PDF":
            logging.info("📄 Procesando archivo PDF...")
            print_pdf(selected_printer, body)
        elif body[:2] == b"\xff\xd8":
            logging.info("🖼️ Procesando imagen...")
            print_image(selected_printer, body)
        else:
            logging.info("📝 Procesando datos de texto...")
            print_data(selected_printer, body)

        response_body = "Impresión completada"
        response = (
            b"HTTP/1.1 200 OK\r\n"
            b"Content-Type: text/plain\r\n"
            b"Content-Length: " + str(len(response_body)).encode('utf-8') + b"\r\n"
            b"Connection: keep-alive\r\n"  # Changed to keep-alive to avoid ERR_CONNECTION_RESET
            b"Access-Control-Allow-Origin: https://chefalitas.com.do\r\n"
            b"Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n"
            b"Access-Control-Allow-Headers: Authorization, Content-Type\r\n"
            b"\r\n" + response_body
        )
        client_socket.send(response)
        logging.info("✅ Respuesta enviada al cliente.")

    except socket.timeout:
        logging.error("❌ Tiempo de espera agotado al recibir datos del cliente.")
        response = (
            b"HTTP/1.1 408 Request Timeout\r\n"
            b"Content-Length: 0\r\n"
            b"Connection: close\r\n"
            b"Access-Control-Allow-Origin: https://chefalitas.com.do\r\n"
            b"Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n"
            b"Access-Control-Allow-Headers: Authorization, Content-Type\r\n"
            b"\r\n"
        )
        client_socket.send(response)
    except ssl.SSLError as e:
        logging.error(f"❌ Error SSL en la conexión: {e}")
        response = (
            b"HTTP/1.1 500 Internal Server Error\r\n"
            b"Content-Length: 21\r\n"
            b"Connection: close\r\n"
            b"Access-Control-Allow-Origin: https://chefalitas.com.do\r\n"
            b"Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n"
            b"Access-Control-Allow-Headers: Authorization, Content-Type\r\n"
            b"\r\n"
            b"Internal Server Error"
        )
        client_socket.send(response)
    except Exception as e:
        logging.error(f"❌ Error en la conexión: {e}")
        response = (
            b"HTTP/1.1 500 Internal Server Error\r\n"
            b"Content-Length: 21\r\n"
            b"Connection: close\r\n"
            b"Access-Control-Allow-Origin: https://chefalitas.com.do\r\n"
            b"Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n"
            b"Access-Control-Allow-Headers: Authorization, Content-Type\r\n"
            b"\r\n"
            b"Internal Server Error"
        )
        client_socket.send(response)

    finally:
        try:
            client_socket.close()
            logging.info("🔌 Conexión cerrada.")
        except Exception as e:
            logging.error(f"❌ Error al cerrar el socket: {e}")

def run_proxy(ip, port):
    global proxy_running
    proxy_running = True

    use_ssl = USE_SSL
    if use_ssl:
        if not generate_ssl_cert():
            logging.warning("⚠️ No se pudieron generar los certificados SSL.")
            result = messagebox.askyesno(
                "Advertencia de Seguridad",
                "No se pudieron generar los certificados SSL. El proxy puede ejecutarse en modo no seguro (HTTP), pero esto es un riesgo de seguridad.\n\n"
                "¿Desea continuar en modo HTTP (no seguro)?\n\n"
                "Recomendación: Confíe en el certificado SSL autofirmado (instrucciones proporcionadas anteriormente) o use un certificado firmado por una CA."
            )
            if not result:
                logging.info("🛑 El usuario canceló la ejecución del proxy debido a la falta de SSL.")
                messagebox.showinfo("Servicio", "Proxy no iniciado debido a la falta de SSL.")
                proxy_running = False
                return
            use_ssl = False

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server_socket.bind((ip, port))
        server_socket.listen(5)

        if use_ssl:
            try:
                context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
                context.minimum_version = ssl.TLSVersion.TLSv1_2
                context.maximum_version = ssl.TLSVersion.TLSv1_3
                # Enable a broader set of ciphers for compatibility
                context.set_ciphers('ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:AES256-SHA:AES128-SHA')
                context.load_cert_chain(certfile=CERT_FILE, keyfile=KEY_FILE)
                server_socket = context.wrap_socket(server_socket, server_side=True)
                logging.info(f"🖨️ Proxy HTTPS corriendo en https://{ip}:{port}...")
                messagebox.showinfo("Servicio", f"Proxy iniciado en modo seguro (HTTPS) en https://{ip}:{port}\n\n"
                                               "El certificado SSL debería estar instalado automáticamente. "
                                               "Si sigue viendo errores, consulte las instrucciones para instalarlo manualmente.")
                # Verificar si el certificado es confiable
                if not check_certificate_trust(ip, port):
                    messagebox.showwarning(
                        "Certificado No Confiable",
                        "El certificado SSL no es confiable por el cliente, lo que puede causar errores.\n\n"
                        "Por favor, asegúrese de que el script se ejecutó como administrador para instalar el certificado automáticamente.\n"
                        "Alternativamente, puede instalarlo manualmente (instrucciones mostradas anteriormente) o cambiar al modo HTTP (no seguro) desde la interfaz."
                    )
            except ssl.SSLError as e:
                logging.warning(f"⚠️ Error SSL al configurar el servidor: {e}")
                result = messagebox.askyesno(
                    "Advertencia de Seguridad",
                    f"Error SSL al configurar el servidor: {e}. El proxy puede ejecutarse en modo no seguro (HTTP), pero esto es un riesgo de seguridad.\n\n"
                    "¿Desea continuar en modo HTTP (no seguro)?\n\n"
                    "Recomendación: Confíe en el certificado SSL autofirmado (instrucciones proporcionadas anteriormente) o use un certificado firmado por una CA."
                )
                if not result:
                    logging.info("🛑 El usuario canceló la ejecución del proxy debido a un error de SSL.")
                    messagebox.showinfo("Servicio", "Proxy no iniciado debido a un error de SSL.")
                    proxy_running = False
                    return
                use_ssl = False
            except Exception as e:
                logging.warning(f"⚠️ Error al configurar SSL: {e}")
                result = messagebox.askyesno(
                    "Advertencia de Seguridad",
                    f"Error al configurar SSL: {e}. El proxy puede ejecutarse en modo no seguro (HTTP), pero esto es un riesgo de seguridad.\n\n"
                    "¿Desea continuar en modo HTTP (no seguro)?\n\n"
                    "Recomendación: Confíe en el certificado SSL autofirmado (instrucciones proporcionadas anteriormente) o use un certificado firmado por una CA."
                )
                if not result:
                    logging.info("🛑 El usuario canceló la ejecución del proxy debido a un error de SSL.")
                    messagebox.showinfo("Servicio", "Proxy no iniciado debido a un error de SSL.")
                    proxy_running = False
                    return
                use_ssl = False

        if not use_ssl:
            logging.info(f"🖨️ Proxy HTTP (no seguro) corriendo en http://{ip}:{port}...")
            messagebox.showwarning("Servicio", f"Proxy iniciado en modo no seguro (HTTP) en http://{ip}:{port}\n\n"
                                              "Esto es un riesgo de seguridad. Deberá actualizar su sistema POS para usar 'http://127.0.0.1:9060'.\n"
                                              "Considere usar HTTPS para mayor seguridad.")

        while proxy_running:
            try:
                server_socket.settimeout(10)  # Avoid hanging on accept
                client_socket, addr = server_socket.accept()
                logging.info(f"📡 Nueva conexión desde {addr}")
                threading.Thread(target=handle_client, args=(client_socket,), daemon=True).start()
            except socket.timeout:
                if not proxy_running:
                    break
                continue
            except Exception as e:
                logging.error(f"❌ Error en la conexión: {e}")
                if not proxy_running:
                    break

        server_socket.close()
        logging.info("🛑 Proxy detenido correctamente")

# ===================== INICIO DEL PROXY =====================
def start_proxy():
    global proxy_thread, proxy_running

    # Solicitar privilegios de administrador si se va a usar HTTPS
    if USE_SSL:
        request_admin_privileges()

    ip = ip_entry.get().strip()
    port_str = port_entry.get().strip()

    if not is_valid_ip(ip) or not is_valid_port(port_str):
        messagebox.showerror("Error", "Debe ingresar una IP y un puerto válidos.")
        return

    if not selected_printer:
        messagebox.showerror("Error", "Debe seleccionar una impresora.")
        return

    port = int(port_str)

    if proxy_running:
        stop_proxy()

    proxy_thread = threading.Thread(target=run_proxy, args=(ip, port), daemon=True)
    proxy_thread.start()
    save_config()

def stop_proxy():
    global proxy_running
    proxy_running = False
    messagebox.showinfo("Servicio", "Proxy detenido")

# ===================== INTERFAZ GRÁFICA =====================
root = tk.Tk()
root.title("Proxy de Impresora")
root.geometry("400x300")

tk.Label(root, text="IP del servicio:").pack()
ip_entry = tk.Entry(root, width=40)
ip_entry.pack()

tk.Label(root, text="Puerto del servicio:").pack()
port_entry = tk.Entry(root, width=40)
port_entry.pack()

printer_dropdown = ttk.Combobox(root, state="readonly", width=40)
printer_dropdown.pack(pady=5)
printer_dropdown["values"] = get_available_printers()
printer_dropdown.bind("<<ComboboxSelected>>", on_printer_selected)

ssl_var = tk.BooleanVar(value=USE_SSL)
tk.Checkbutton(root, text="Usar HTTPS (recomendado)", variable=ssl_var, command=toggle_ssl_mode).pack(pady=5)

tk.Button(root, text="Iniciar Proxy", command=start_proxy, bg="green", fg="white").pack(pady=5)
tk.Button(root, text="Detener Proxy", command=stop_proxy, bg="red", fg="white").pack(pady=5)

load_config()

root.mainloop()