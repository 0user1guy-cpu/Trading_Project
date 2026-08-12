#!/usr/bin/env python3
"""Relanceur : recrée le projet depuis le blueprint `snapshot_conv01.md`.

Ce script est l'inverse du générateur : il lit `lance/snapshot_conv01.md`,
extrait chaque bloc de code (sections de la forme "### chemin/relatif"), recrée les
fichiers à la racine du projet, puis (optionnellement) installe les dépendances,
build le frontend et démarre le serveur.

Usage :
    python lance/relancer.py                  # sync GitHub + régénère le snapshot
    python lance/relancer.py --install        # + pip install + npm install
    python lance/relancer.py --build          # + build du frontend
    python lance/relancer.py --start          # + lance le serveur
    python lance/relancer.py --full          # fait tout (sync + install + build + start)
    python lance/relancer.py --from-snapshot  # OFFLINE : recrée depuis le snapshot (sans git pull)

Le protocole « lance » (voir lance/README.md) correspond à `--full`.

IMPORTANT : par défaut, le relanceur tire le **vrai projet GitHub à jour**
(`git pull` sur la branche courante) AVANT de lancer, puis régénère le
snapshot depuis les fichiers actuels. Ainsi « lance le projet » suit toujours
la progression réelle du dépôt, pas une photocopie figée. Utilise
`--from-snapshot` uniquement en mode hors-ligne (sans accès git/remote).
"""
import os
import re
import sys
import subprocess

SNAPSHOT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "snapshot_conv01.md")
SNAPSHOT_GEN = os.path.join(os.path.dirname(os.path.abspath(__file__)), "generer_snapshot.py")
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Regex : capture le chemin après "### `chemin`" puis le bloc de code qui suit.
HEADER_RE = re.compile(r"^### `([^`]+)`\s*$")
FENCE_RE = re.compile(r"^```([a-zA-Z]*)\s*$")


def parse_snapshot():
    """Retourne une liste de (chemin_relatif, contenu) extraite du snapshot."""
    if not os.path.isfile(SNAPSHOT_PATH):
        print(f"❌ Snapshot introuvable : {SNAPSHOT_PATH}")
        print("   Génère-le d'abord avec :  python lance/generer_snapshot.py")
        sys.exit(1)

    with open(SNAPSHOT_PATH, "r", encoding="utf-8") as f:
        lines = f.read().splitlines()

    files = []
    i = 0
    in_section_6 = False
    while i < len(lines):
        line = lines[i]
        # On ne capture que les fichiers de la section "Contenu des fichiers"
        if line.strip().lower().startswith("## 6."):
            in_section_6 = True
        elif line.strip().lower().startswith("## 7."):
            in_section_6 = False

        if in_section_6:
            m = HEADER_RE.match(line)
            if m:
                rel_path = m.group(1)
                # Le bloc de code fence commence à la ligne suivante (ou après un commentaire)
                j = i + 1
                # Avance jusqu'à trouver la première fence d'ouverture
                while j < len(lines) and not FENCE_RE.match(lines[j]):
                    j += 1
                if j >= len(lines):
                    i += 1
                    continue
                j += 1  # passe la fence d'ouverture
                content_lines = []
                while j < len(lines) and not (FENCE_RE.match(lines[j]) and lines[j].strip() == "```"):
                    content_lines.append(lines[j])
                    j += 1
                files.append((rel_path, "\n".join(content_lines) + "\n"))
                i = j
        i += 1
    return files


def recreate_files(files):
    """Recrée chaque fichier à sa place sous PROJECT_ROOT."""
    print(f"📁 Recréation de {len(files)} fichiers depuis le snapshot...\n")
    created, skipped = 0, 0
    for rel, content in files:
        # Sécurité : on n'écrase jamais .env ni rien en dehors du projet
        if rel.startswith("/") or ".." in rel:
            print(f"   ⚠️  Chemin suspect ignoré : {rel}")
            skipped += 1
            continue
        abs_path = os.path.join(PROJECT_ROOT, rel)
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(content)
        created += 1
        print(f"   ✅ {rel}")
    print(f"\n→ {created} fichiers (re)créés, {skipped} ignorés.\n")
    return created


def run(cmd, cwd=PROJECT_ROOT, shell=False):
    """Exécute une commande et affiche son retour."""
    print(f"▶ $ {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    res = subprocess.run(cmd, cwd=cwd, shell=shell)
    return res.returncode == 0


def sync_from_github():
    """Tire le vrai projet GitHub à jour avant de lancer.

    On récupère les dernières modifications de la branche COURANTE (git pull),
    SANS changer de branche (pour ne pas perdre de travail en cours). Ainsi
    « lance le projet » suit toujours la progression réelle du dépôt, pas une
    photocopie figée. Si le pull échoue (hors-ligne, modifs locales non
    commitées), on continue avec les fichiers locaux tels quels.
    """
    print("\n🔄 Synchronisation depuis GitHub (git pull sur la branche courante)...")
    git = "git"

    if not run([git, "fetch", "--all", "--prune"]):
        print("   ⚠️  git fetch a échoué (pas de remote ? mode hors-ligne ?).")
        print("      → on continue avec les fichiers locaux tels quels.")
        return False

    res = subprocess.run([git, "pull", "--ff-only"], cwd=PROJECT_ROOT,
                          capture_output=True, text=True)
    if res.returncode != 0:
        msg = (res.stderr or res.stdout or "").strip().splitlines()
        print("   ⚠️  git pull --ff-only a échoué :", " ".join(msg)[:140])
        print("      → on continue avec les fichiers locaux tels quels.")
        return False

    print("   ✅ Projet synchronisé (branche courante à jour).")
    return True


def refresh_snapshot():
    """Régénère le snapshot depuis les fichiers sources actuels.

    À appeler APRÈS git pull pour que le blueprint reflète le vrai projet
    à jour. Échoue silencieusement si le générateur est absent.
    """
    print("\n📝 Régénération du snapshot depuis les fichiers actuels...")
    if not os.path.isfile(SNAPSHOT_GEN):
        print("   ⚠️  generer_snapshot.py introuvable — snapshot non rafraîchi.")
        return False
    ok = run([sys.executable, SNAPSHOT_GEN])
    if ok:
        print("   ✅ Snapshot rafraîchi (snapshot_conv01.md).")
    return ok


def install_deps():
    print("\n📦 Installation des dépendances Python...")
    ok = run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    if not ok:
        print("   ⚠️  Échec pip install.")
    print("\n📦 Installation des dépendances frontend (npm install)...")
    npm = "npm.cmd" if sys.platform.startswith("win") else "npm"
    run([npm, "install"], cwd=os.path.join(PROJECT_ROOT, "frontend"))
    return ok


def build_frontend():
    print("\n🔧 Build du frontend (npm run build)...")
    npm = "npm.cmd" if sys.platform.startswith("win") else "npm"
    return run([npm, "run", "build"], cwd=os.path.join(PROJECT_ROOT, "frontend"))


def start_server():
    print("\n🚀 Démarrage du serveur (python lancer.py)...")
    print("   → http://localhost:8000  (Ctrl+C pour arrêter)\n")
    # Importé ici pour ne pas bloquer si on n'a pas installé
    return run([sys.executable, "lancer.py"])


def ensure_db():
    """Initialise la structure SQLite si la DB n'existe pas."""
    db_path = os.path.join(PROJECT_ROOT, "data.sauv.trading", "market_items.db")
    if os.path.isfile(db_path):
        print("💾 Base SQLite déjà présente.")
        return
    print("\n🗄️  Base SQLite absente → initialisation de la structure...")
    run([sys.executable, os.path.join(PROJECT_ROOT, "utils", "database.py")])
    env_path = os.path.join(PROJECT_ROOT, ".env")
    if not os.path.isfile(env_path):
        print("\n   ⚠️  Pas de fichier .env. Crée-le depuis .env.example et")
        print("       renseigne OPENSKIN_API_KEY, puis lance :")
        print("       python utils/fetcher.py   # pour repeupler la base")
        print("       (le serveur peut quand même démarrer, l'API renverra des listes vides.)\n")


def main():
    import argparse
    p = argparse.ArgumentParser(description="Relance le projet depuis le snapshot.")
    p.add_argument("--install", action="store_true", help="Installe les deps Python + npm")
    p.add_argument("--build", action="store_true", help="Build le frontend React")
    p.add_argument("--start", action="store_true", help="Démarre le serveur (python lancer.py)")
    p.add_argument("--full", action="store_true", help="= sync GitHub + refresh snapshot + install + build + start")
    p.add_argument("--from-snapshot", action="store_true",
                   help="OFFLINE : recrée depuis le snapshot SANS git pull (photocopie figée)")
    args = p.parse_args()

    # --- Mode online (défaut) : on tire le vrai projet GitHub à jour ---
    use_snapshot_only = args.from_snapshot

    if not use_snapshot_only:
        sync_from_github()
        refresh_snapshot()

    # --- Recrée les fichiers depuis le snapshot (maintenant à jour) ---
    files = parse_snapshot()
    recreate_files(files)
    ensure_db()

    if args.full:
        args.install = args.build = args.start = True

    if args.install:
        install_deps()
    if args.build:
        build_frontend()
    if args.start:
        start_server()

    if not any([args.install, args.build, args.start, args.full]):
        print("✅ Projet synchronisé + fichiers prêts. Pour aller plus loin :")
        print("   pip install -r requirements.txt")
        print("   cd frontend && npm install && npm run build")
        print("   python lancer.py   # → http://localhost:8000")
        print("\n   ou :  python lance/relancer.py --full")
        print("\n💡 En mode offline (sans git) :  python lance/relancer.py --from-snapshot --full")


if __name__ == "__main__":
    sys.exit(main() or 0)
