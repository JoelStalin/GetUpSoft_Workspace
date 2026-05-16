# compare_follow_data.py

import json

def main():
    """
    Compara los archivos followers.json y following.json y guarda el resultado
    como un arreglo simple de objetos de usuario completos.
    """
    try:
        with open('followers.json', 'r', encoding='utf-8') as f:
            followers_list = json.load(f)
        
        with open('following.json', 'r', encoding='utf-8') as f:
            following_list = json.load(f)

    except FileNotFoundError as e:
        print(f"❌ Error: No se encontró el archivo {e.filename}.")
        return
    except json.JSONDecodeError:
        print("❌ Error: Uno de los archivos JSON está corrupto. Elimínalo y vuelve a ejecutar el script.")
        return

    followers_usernames = {user['username'] for user in followers_list}
    
    not_following_back = [
        user for user in following_list 
        if user['username'] not in followers_usernames
    ]
    
    not_following_back.reverse()

    print(f"✅ Comparación completada: {len(not_following_back)} usuarios no te siguen de vuelta.")

    with open('not_following_back.json', 'w', encoding='utf-8') as f:
        json.dump(not_following_back, f, indent=4)

    print("Resultados guardados en 'not_following_back.json'")

if __name__ == "__main__":
    main()