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


def main():
    project_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dist = os.path.join(project_dir, "frontend", "dist")

    # 1. Vérifie que le frontend est compilé ; sinon le build automatiquement
    if not os.path.isfile(os.path.join(frontend_dist, "index.html")):
        print("🔧 Frontend non compilé — build automatique...")
        npm_cmd = ["npm", "run", "build"]
        frontend_dir = os.path.join(project_dir, "frontend")
        if not os.path.isdir(os.path.join(frontend_dir, "node_modules")):
            print("📦 Installation des dépendances npm (premier lancement)...")
            subprocess.run(["npm", "install"], cwd=frontend_dir, check=True, shell=False)
        subprocess.run(npm_cmd, cwd=frontend_dir, check=True, shell=False)
        print("✅ Frontend compilé.\n")

    # 2. Lance le serveur FastAPI (API + frontend sur le même port)
    print("=" * 56)
    print("  Trading Project — serveur démarré")
    print("  Ouvre http://localhost:8000 dans ton navigateur")
    print("  (Ctrl+C pour arrêter)")
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
