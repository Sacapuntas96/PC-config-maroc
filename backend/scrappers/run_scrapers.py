"""
run_scrapers.py
----------------
Lance les scrapers de composants les uns après les autres et range
leurs fichiers JSON dans un dossier data/ (au lieu du dossier courant),
pour que load_to_db.py puisse ensuite les fusionner en une seule base.

Chaque scraper tourne dans un processus séparé (via subprocess) donc
un plantage sur une catégorie n'interrompt pas les autres.

Usage:
    python run_scrapers.py
    python run_scrapers.py --only ultrapc_processeurs.py ultrapc_boitiers.py
    python run_scrapers.py --timeout 300
"""

import sys
import argparse
import subprocess
from pathlib import Path

SCRAPERS_DIR = Path(__file__).resolve().parent
# data/ est un dossier frère de scrappers/ (backend/data), pas un
# sous-dossier de scrappers/ : on remonte d'un niveau.
DATA_DIR = SCRAPERS_DIR.parent / "data"

SCRIPTS = [
    "ultrapc_processeurs.py",
    "ultrapc_cartes_meres.py",
    "ultrapc_cartes_graphiques.py",
    "ultrapc_memoire_vive.py",
    "ultrapc_disques.py",
    "ultrapc_alimentations.py",
    "ultrapc_boitiers.py",
    "ultrapc_cartes_son.py",
    "ultrapc_refroidissement.py",
]

DEFAULT_TIMEOUT = 600  # secondes


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--only", nargs="*", default=None,
        help="Ne lancer que ces scripts (noms de fichiers), ex: --only ultrapc_processeurs.py",
    )
    parser.add_argument(
        "--timeout", type=int, default=DEFAULT_TIMEOUT,
        help=f"Timeout par scraper en secondes (défaut: {DEFAULT_TIMEOUT})",
    )
    args = parser.parse_args()

    # --only sans arguments (liste vide) ne doit PAS faire tourner tous les
    # scripts silencieusement : on distingue "non fourni" (None) de "fourni
    # mais vide" ([]).
    if args.only is not None:
        if len(args.only) == 0:
            print("!! --only a été fourni sans aucun script, arrêt.")
            sys.exit(1)
        scripts = args.only
    else:
        scripts = SCRIPTS

    DATA_DIR.mkdir(parents=True, exist_ok=True)

    failures = []
    timeouts = []
    for script in scripts:
        script_path = SCRAPERS_DIR / script
        if not script_path.exists():
            print(f"!! {script} introuvable, ignoré")
            failures.append(script)
            continue

        # Snapshot des fichiers présents avant l'exécution, pour vérifier
        # ensuite que le scraper a bien écrit quelque chose dans data/
        # (utile si le scraper utilise un chemin absolu et ignore cwd).
        before = set(DATA_DIR.glob("*.json"))

        print(f"\n=== {script} ===", flush=True)
        try:
            result = subprocess.run(
                [sys.executable, str(script_path)],
                cwd=DATA_DIR,
                timeout=args.timeout,
            )
        except subprocess.TimeoutExpired:
            print(f"!! {script} a dépassé le timeout ({args.timeout}s), abandonné")
            timeouts.append(script)
            failures.append(script)
            continue

        if result.returncode != 0:
            print(f"!! {script} a échoué (code {result.returncode})")
            failures.append(script)
            continue

        after = set(DATA_DIR.glob("*.json"))
        if after == before:
            print(f"!! {script} s'est terminé sans erreur mais n'a écrit "
                  f"aucun nouveau fichier JSON dans {DATA_DIR}/ "
                  f"(vérifier s'il écrit avec un chemin absolu)")

    print(f"\nTerminé. JSON écrits dans {DATA_DIR}/")
    if failures:
        print(f"Scripts en échec: {', '.join(failures)}")
        if timeouts:
            print(f"  dont timeouts: {', '.join(timeouts)}")
        sys.exit(1)


if __name__ == "__main__":
    main()