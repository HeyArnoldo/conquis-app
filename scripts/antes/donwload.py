import os
import requests
import json
import time
import unicodedata
import re
from urllib.parse import urlparse

def slugify(value):
    """
    Convierte una cadena en un slug apto para nombres de carpeta.
    """
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value.lower())
    return re.sub(r'[-\s]+', '-', value).strip('-_')

def download_file(url, path):
    """
    Descarga el archivo de la URL y lo guarda en la ruta especificada.
    """
    try:
        print(f"Descargando {url} en {path}...")
        response = requests.get(url, stream=True)
        response.raise_for_status()
        with open(path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print("Descarga completada.")
    except Exception as e:
        print(f"Error descargando {url}: {e}")

def main():
    # Cargar el JSON previamente generado
    with open("./especialidades_actualizado.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    base_folder = "files"
    
    for specialty in data:
        specialty_name = specialty.get("name", "unknown")
        specialty_slug = slugify(specialty_name)
        specialty_folder = os.path.join(base_folder, specialty_slug)
        os.makedirs(specialty_folder, exist_ok=True)
        print(f"\nProcesando especialidad: {specialty_name} (slug: {specialty_slug})")
        
        # Descargar imagen de la actividad principal (especialidad) si existe
        main_img_url = specialty.get("img")
        if main_img_url:
            parsed_img = urlparse(main_img_url)
            img_filename = os.path.basename(parsed_img.path)
            img_path = os.path.join(specialty_folder, img_filename)
            download_file(main_img_url, img_path)
        
        """ # Procesar cada subespecialidad
        for sub in specialty.get("subespecialidades", []):
            sub_name = sub.get("name", "unknown")
            sub_slug = slugify(sub_name)
            folder_path = os.path.join(specialty_folder, sub_slug)
            os.makedirs(folder_path, exist_ok=True)
            print(f"  Subespecialidad: {sub_name} (carpeta: {folder_path})")
            
            # Descargar solo la imagen de la subespecialidad
            img_url = sub.get("img")
            if img_url:
                parsed_img = urlparse(img_url)
                img_filename = os.path.basename(parsed_img.path)
                img_path = os.path.join(folder_path, img_filename)
                download_file(img_url, img_path)
            
            # Si solo quieres imágenes, no se descarga el PDF
            # time.sleep para evitar saturar el servidor
            time.sleep(1) """
        #time.sleep(2)

if __name__ == "__main__":
    main()
