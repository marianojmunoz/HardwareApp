import time
import pandas as pd

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


URL_BASE = "http://190.183.223.6/gold/"

def crear_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    # opcional: para que no sea tan “ruidoso”
    # options.add_argument("--headless=new")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    return driver

def buscar_imagen(driver, descripcion):
    driver.get(URL_BASE)

    try:
        # input name="keywords"
        input_busqueda = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "keywords"))
        )
    except Exception:
        print("No se encontró el input de búsqueda")
        return None

    # limpiar y escribir
    input_busqueda.clear()
    input_busqueda.send_keys(descripcion)
    input_busqueda.send_keys(Keys.ENTER)

    # esperar a que carguen resultados
    try:
        # esperamos a que aparezca alguna imagen de producto
        img = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "img.img-responsive.thumbnail.group.list-group-image")
            )
        )
        src = img.get_attribute("src")
        return src
    except Exception:
        print("Sin imagen para:", descripcion)
        return None

def main():
    input_file = "gremio.xlsx"
    output_file = "gremio_con_imagenes.xlsx"

    df = pd.read_excel(input_file)

    # si no existe columna IMG_GREMIO, la creamos
    if "IMG_GREMIO" not in df.columns:
        df["IMG_GREMIO"] = None

    driver = crear_driver()

    try:
        total = len(df)
        for idx in range(total):
            desc = str(df.at[idx, "PRODUCTO"])

            # si ya tiene valor, saltear (permite reanudar)
            if pd.notna(df.at[idx, "IMG_GREMIO"]) and df.at[idx, "IMG_GREMIO"] != "":
                continue

            print(f"[{idx+1}/{total}] Buscando imagen para: {desc}")
            img_url = buscar_imagen(driver, desc)
            df.at[idx, "IMG_GREMIO"] = img_url

            # guardar cada 50 filas para no perder progreso
            if (idx + 1) % 50 == 0:
                print("Guardando progreso parcial...")
                df.to_excel(output_file, index=False)

            # pequeña pausa para no “matar” el server
            time.sleep(0.5)

        # guardado final
        print("Guardando archivo final...")
        df.to_excel(output_file, index=False)
        print("Listo:", output_file)

    finally:
        driver.quit()

if __name__ == "__main__":
    main()
