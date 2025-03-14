import json
import re
import unidecode

def slugify(text):
    """
    Convierte el texto en un slug, por ejemplo:
      "Agricultura de subsistencia" -> "agricultura-de-subsistencia"
    """
    # Pasa a minúsculas y elimina acentos
    text = unidecode.unidecode(text.lower())
    # Sustituye cualquier carácter que no sea alfanumérico por guiones
    text = re.sub(r'[^a-z0-9]+', '-', text)
    # Quita guiones de inicio/fin
    return text.strip('-')

def obtener_nombre_archivo(url):
    """
    Devuelve el nombre de archivo que está al final de la URL.
    Ejemplo:
      "https://www.guiasmayores.com/uploads/1/1/3/1/1131412/agricultura_de_subsistencia.pdf"
      -> "agricultura_de_subsistencia.pdf"
    """
    return url.split('/')[-1]

def main():
    # Lee el JSON original
    with open('especialidades.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    for item in data:
        # Generamos el slug para el nombre principal
        main_slug = slugify(item['name'])



        del item['url']
        # Ajustamos la imagen principal para que apunte a la carpeta principal
        nombre_img_principal = obtener_nombre_archivo(item['img'])

        item['img'] = f"/{main_slug}/{nombre_img_principal}"

        item['slug'] = f"{main_slug}" 

        # Ahora recorremos las subespecialidades
        if 'subespecialidades' in item:
            for sub in item['subespecialidades']:
                sub_slug = slugify(sub['name'])
                

                # Extraemos los nombres de archivo para PDF e imagen
                nombre_pdf = obtener_nombre_archivo(sub['url'])
                nombre_img = obtener_nombre_archivo(sub['img'])

                # La nueva URL “base” de la subespecialidad
                sub['slug'] = f"{sub_slug}"
                # Guardamos los paths locales para PDF e imagen
                sub['pdf'] = None
                if nombre_pdf.endswith('.pdf'):
                    sub['pdf'] = f"/{main_slug}/{sub_slug}/{nombre_pdf}"
                sub['img'] = f"/{main_slug}/{sub_slug}/{nombre_img}"
                del sub['caption']
                del sub['url']
        
        item['items'] = item.pop('subespecialidades')
        print(item)
        #del item['subespecialidades']

    # Guardamos el resultado en un nuevo archivo
    with open('especialidades_actualizado.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

if __name__ == '__main__':
    main()
