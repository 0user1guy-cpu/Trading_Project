#!/usr/bin/env python3
"""Lance l'application Trading Project en un seul serveur (port 8000).

Usage :
    python lancer.py

Ce script démarre FastAPI qui sert :
  - l'API (/api/items, /api/items/{id}, etc.)
  - le frontend React (interface CSFloat-style) sur la même URL

Une fois lancé, ouvre http://localhost:8000 dans ton navigateur.
"""
import os
import sys
import subprocess


def check_python_deps():
    """Vérifie que fastapi et uvicorn sont installés."""
    missing = []
    try:
        import fastapi  # noqa: F401
    except ImportError:
        missing.append("fastapi")
    try:
        import uvicorn  # noqa: F401
    except ImportError:
        missing.append("uvicorn[standard]")
    if missing:
        print("❌ Dépendances Python manquantes :", ", ".join(missing))
        print("   Lance d'abord :  pip install -r requirements.txt")
        sys.exit(1)


def check_node():
    """Vérifie que Node.js/npm est installé."""
    is_windows = sys.platform.startswith("win")
    npm = "npm.cmd" if is_windows else "npm"
    try:
        subprocess.run([npm, "--version"], capture_output=True, check=True, shell=is_windows)
        return True
    except (FileNotFoundError, subprocess.CalledProcessError):
        print("❌ Node.js / npm introuvable.")
        print("   Installe Node.js (version LTS) : https://nodejs.org/")
        print("   Puis relance :  python lancer.py")
        return False


def build_frontend(project_dir):
    """Build le frontend React si pas déjà compilé."""
    frontend_dir = os.path.join(project_dir, "frontend")
    frontend_dist = os.path.join(frontend_dir, "dist")
    is_windows = sys.platform.startswith("win")
    npm = "npm.cmd" if is_windows else "npm"

    if os.path.isfile(os.path.join(frontend_dist, "index.html")):
        return True  # déjà compilé

    if not check_node():
        return False

    print("🔧 Compilation du frontend (premier lancement, ~10s)...")
    if not os.path.isdir(os.path.join(frontend_dir, "node_modules")):
        print("📦 Installation des dépendances npm...")
        result = subprocess.run([npm, "install"], cwd=frontend_dir, shell=is_windows)
        if result.returncode != 0:
            print("❌ Échec de 'npm install'. Vérifie que Node.js est bien installé.")
            return False

    result = subprocess.run([npm, "run", "build"], cwd=frontend_dir, shell=is_windows)
    if result.returncode != 0:
        print("❌ Échec du build du frontend.")
        return False

    print("✅ Frontend compilé.\n")
    return True


def main():
    project_dir = os.path.dirname(os.path.abspath(__file__))

    print("Trading Project — démarrage...\n")

    # 1. Vérifie les dépendances Python
    check_python_deps()

    # 2. Build le frontend si nécessaire
    if not build_frontend(project_dir):
        print("\n⚠️  Le frontend n'a pas pu être compilé, mais l'API peut quand même démarrer.")
        print("   L'interface web ne s'affichera pas tant que Node.js n'est pas installé.")
        print("   Tu peux quand même tester l'API sur http://localhost:8000/docs\n")

    # 3. Lance le serveur FastAPI
    print("=" * 56)
    print("  ✅ Serveur démarré !")
    print("  👉 Ouvre http://localhost:8000 dans ton navigateur")
    print("  (Ctrl+C dans le terminal pour arrêter)")
    print("=" * 56 + "\n")

    import uvicorn
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nServeur arrêté. À bientôt !")
        sys.exit(0)
