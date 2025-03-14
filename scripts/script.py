import requests
from bs4 import BeautifulSoup
import json
import time
from urllib.parse import urljoin

# JSON principal con las 12 especialidades
main_data = [
    {
        "name": "Industrias Agropecuarias",
        "url": "https://www.guiasmayores.com/especialidades-ja---actividades-agropecuarias.html",
        "img": "https://www.guiasmayores.com/uploads/1/1/3/1/1131412/especialiadaes-de-actividades-agropecuarias_orig.png"
    },
    {
        "name": "Recreación",
        "url": "https://www.guiasmayores.com/especialidades-ja---actividades-recreacionales.html",
        "img": "https://www.guiasmayores.com/uploads/1/1/3/1/1131412/especialidades-de-actividades-recreacionales_orig.png"
    },
    {
        "name": "Vocacional",
        "url": "https://www.guiasmayores.com/especialidades-ja---actividades-vocacionales.html",
        "img": "https://www.guiasmayores.com/uploads/1/1/3/1/1131412/especialidades-de-actividades-vocacionales_orig.png"
    },
    {
        "name": "ADRA",
        "url": "https://www.guiasmayores.com/especialidades-ja---adra.html",
        "img": "https://www.guiasmayores.com/uploads/1/1/3/1/1131412/especialidades-de-adra_orig.png"
    },
    {
        "name": "Artes y Habilidades Manuales",
        "url": "https://www.guiasmayores.com/especialidades-ja---artes-y-actividades-manuales.html",
        "img": "https://www.guiasmayores.com/uploads/1/1/3/1/1131412/especialidades-de-artes-y-actividades-manuales_orig.png"
    },
    {
        "name": "Artes Domésticas",
        "url": "https://www.guiasmayores.com/especialidades-ja---artes-domeacutesticas.html",
        "img": "https://www.guiasmayores.com/uploads/1/1/3/1/1131412/especialidades-de-artes-dom-sticas_orig.png"
    },
    {
        "name": "Crecimiento Espiritual, Actividades Misioneras y Herencia",
        "url": "https://www.guiasmayores.com/especialidades-ja---crecimiento-espiritual-actividades-misioneras-y-herencia.html",
        "img": "https://www.guiasmayores.com/uploads/1/1/3/1/1131412/especialidades-de-crecimiento-espiritual-actividades-misioneras-y-herencia_orig.png"
    },
    {
        "name": "Naturaleza",
        "url": "https://www.guiasmayores.com/especialidades-ja---estudio-de-la-naturaleza.html",
        "img": "https://www.guiasmayores.com/uploads/1/1/3/1/1131412/especialiadaes-de-estudio-de-la-naturaleza_orig.png"
    },
    {
        "name": "Salud y Ciencia",
        "url": "https://www.guiasmayores.com/especialidades-ja---salud-y-ciencia.html",
        "img": "https://www.guiasmayores.com/uploads/1/1/3/1/1131412/salud-y-ciencia_orig.png"
    },
    {
        "name": "Servicios Comunitarios Adventistas",
        "url": "https://www.guiasmayores.com/especialidades-ja---servicios-comunitarios-adventistas.html",
        "img": "https://www.guiasmayores.com/uploads/1/1/3/1/1131412/especialidades-de-servicios-comunitarios-adventistas_orig.png"
    },
    {
        "name": "Especialidades de la Asociación de Florida",
        "url": "https://www.guiasmayores.com/especialidades-ja---asociacioacuten-de-florida.html",
        "img": "https://www.guiasmayores.com/uploads/1/1/3/1/1131412/especialidades-de-florida_orig.png"
    },
    {
        "name": "Maestrías (Experto)",
        "url": "https://www.guiasmayores.com/especialidades-ja---maestriacuteas.html",
        "img": "https://www.guiasmayores.com/uploads/1/1/3/1/1131412/887233_orig.png"
    }
]

BASE_URL = "https://www.guiasmayores.com"

def scrape_subspecialties(url):
    """
    Dada la URL de una especialidad (tipo), extrae las subespecialidades
    mostradas en la vista. Se asume que el contenido se encuentra dentro
    del div con id "wsite-content" y que cada bloque de subespecialidad se
    identifica por la clase "wsite-image-border-none".
    """
    try:
        response = requests.get(url)
        response.raise_for_status()
    except Exception as e:
        print(f"Error al obtener {url}: {e}")
        return []
    
    soup = BeautifulSoup(response.content, "html.parser")
    content_div = soup.find("div", id="wsite-content")
    if not content_div:
        return []
    
    subspecialties = []
    # Buscar todos los bloques que contienen la imagen y la información
    image_divs = content_div.find_all("div", class_=lambda c: c and "wsite-image-border-none" in c)
    for div in image_divs:
        a_tag = div.find("a", href=True)
        if not a_tag:
            continue
        spec_url = urljoin(BASE_URL, a_tag["href"])
        img_tag = a_tag.find("img")
        if not img_tag:
            continue
        name = img_tag.get("alt", "").strip()
        img_src = urljoin(BASE_URL, img_tag.get("src", ""))
        # Se intenta extraer la leyenda o caption que usualmente se muestra en un <div> interno
        caption_div = div.find("div")
        caption = caption_div.get_text(strip=True) if caption_div and caption_div.get_text(strip=True) else name

        subspecialties.append({
            "name": name,
            "url": spec_url,
            "img": img_src,
            "caption": caption
        })
    return subspecialties

def update_all_data(data):
    """
    Para cada especialidad del JSON, extrae sus subespecialidades y agrega
    la clave "subespecialidades" al diccionario.
    """
    for item in data:
        url = item.get("url")
        if not url:
            continue
        print(f"Procesando '{item.get('name')}' en: {url}")
        subs = scrape_subspecialties(url)
        item["subespecialidades"] = subs
        # Pausa para no sobrecargar el servidor
        time.sleep(2)
    return data

def main():
    updated_data = update_all_data(main_data)
    with open("especialidades_actualizado.json", "w", encoding="utf-8") as f:
        json.dump(updated_data, f, ensure_ascii=False, indent=4)
    print("JSON actualizado guardado en 'especialidades_actualizado.json'.")

if __name__ == "__main__":
    main()
