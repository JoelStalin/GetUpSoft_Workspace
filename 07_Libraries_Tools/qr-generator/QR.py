import tkinter as tk
from tkinter import filedialog, messagebox, colorchooser
from PIL import Image, ImageTk
import qrcode
import validators

def create_qr_with_logo(data, logo_path, output_file="qr_with_logo.png", fill_color="black", back_color="white", box_size=10):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=box_size,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    qr_img = qr.make_image(fill_color=fill_color, back_color=back_color).convert('RGB')
    
    logo = Image.open(logo_path)
    qr_width, qr_height = qr_img.size
    logo_size = int(qr_width / 4)
    logo = logo.resize((logo_size, logo_size), Image.LANCZOS)
    
    pos = ((qr_width - logo_size) // 2, (qr_height - logo_size) // 2)
    
    qr_img.paste(logo, pos, mask=logo if logo.mode == 'RGBA' else None)
    
    qr_img.save(output_file)
    return output_file

def choose_logo():
    file_path = filedialog.askopenfilename(
        title="Selecciona un logo",
        filetypes=[("Imagen", "*.png;*.jpg;*.jpeg;*.bmp;*.gif")]
    )
    logo_entry.delete(0, tk.END)
    logo_entry.insert(0, file_path)

def choose_save_location():
    file_path = filedialog.asksaveasfilename(
        defaultextension=".png",
        filetypes=[("PNG files", "*.png"), ("All files", "*.*")]
    )
    if file_path:
        output_entry.delete(0, tk.END)
        output_entry.insert(0, file_path)

def choose_fill_color():
    color = colorchooser.askcolor(title="Selecciona el color del QR")[1]
    if color:
        fill_color_entry.delete(0, tk.END)
        fill_color_entry.insert(0, color)

def choose_back_color():
    color = colorchooser.askcolor(title="Selecciona el color de fondo")[1]
    if color:
        back_color_entry.delete(0, tk.END)
        back_color_entry.insert(0, color)

def generate_qr():
    url = url_entry.get().strip()
    logo_path = logo_entry.get().strip()
    output_file = output_entry.get().strip()
    fill_color = fill_color_entry.get().strip() or "black"
    back_color = back_color_entry.get().strip() or "white"
    size_option = size_var.get()
    
    size_mapping = {"Pequeño": 5, "Mediano": 10, "Grande": 15}
    box_size = size_mapping.get(size_option, 10)
    
    if not url:
        messagebox.showerror("Error", "Por favor, ingresa la URL.")
        return
    if not validators.url(url):
        messagebox.showerror("Error", "Por favor, ingresa una URL válida.")
        return
    if not logo_path:
        messagebox.showerror("Error", "Por favor, selecciona un logo.")
        return
    if not output_file:
        messagebox.showerror("Error", "Por favor, selecciona una ubicación para guardar el archivo.")
        return

    try:
        create_qr_with_logo(url, logo_path, output_file, fill_color, back_color, box_size)
        messagebox.showinfo("Éxito", f"Código QR generado y guardado en '{output_file}'.")
        
        img = Image.open(output_file)
        img.thumbnail((300, 300))
        img_tk = ImageTk.PhotoImage(img)
        qr_label.config(image=img_tk)
        qr_label.image = img_tk
    except Exception as e:
        messagebox.showerror("Error", f"Error generando el código QR: {e}")

root = tk.Tk()
root.title("Generador de Código QR con Logo")

url_label = tk.Label(root, text="URL:")
url_label.grid(row=0, column=0, padx=5, pady=5, sticky='e')
url_entry = tk.Entry(root, width=50)
url_entry.grid(row=0, column=1, padx=5, pady=5, columnspan=2)

logo_label = tk.Label(root, text="Logo:")
logo_label.grid(row=1, column=0, padx=5, pady=5, sticky='e')
logo_entry = tk.Entry(root, width=40)
logo_entry.grid(row=1, column=1, padx=5, pady=5)
logo_button = tk.Button(root, text="Seleccionar", command=choose_logo)
logo_button.grid(row=1, column=2, padx=5, pady=5)

output_label = tk.Label(root, text="Guardar en:")
output_label.grid(row=2, column=0, padx=5, pady=5, sticky='e')
output_entry = tk.Entry(root, width=40)
output_entry.grid(row=2, column=1, padx=5, pady=5)
output_button = tk.Button(root, text="Seleccionar", command=choose_save_location)
output_button.grid(row=2, column=2, padx=5, pady=5)

fill_color_label = tk.Label(root, text="Color del QR:")
fill_color_label.grid(row=3, column=0, padx=5, pady=5, sticky='e')
fill_color_entry = tk.Entry(root, width=40)
fill_color_entry.grid(row=3, column=1, padx=5, pady=5)
fill_color_button = tk.Button(root, text="Seleccionar", command=choose_fill_color)
fill_color_button.grid(row=3, column=2, padx=5, pady=5)

back_color_label = tk.Label(root, text="Color de fondo:")
back_color_label.grid(row=4, column=0, padx=5, pady=5, sticky='e')
back_color_entry = tk.Entry(root, width=40)
back_color_entry.grid(row=4, column=1, padx=5, pady=5)
back_color_button = tk.Button(root, text="Seleccionar", command=choose_back_color)
back_color_button.grid(row=4, column=2, padx=5, pady=5)

size_label = tk.Label(root, text="Tamaño del QR:")
size_label.grid(row=5, column=0, padx=5, pady=5, sticky='e')
size_var = tk.StringVar(value="Mediano")
size_options = ["Pequeño", "Mediano", "Grande"]
size_menu = tk.OptionMenu(root, size_var, *size_options)
size_menu.grid(row=5, column=1, padx=5, pady=5)

generate_button = tk.Button(root, text="Generar Código QR", command=generate_qr)
generate_button.grid(row=6, column=0, columnspan=3, padx=5, pady=10)

qr_label = tk.Label(root)
qr_label.grid(row=7, column=0, columnspan=3, padx=5, pady=5)

root.mainloop()