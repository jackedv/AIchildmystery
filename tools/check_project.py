"""Small dependency-free smoke check for the local prototype."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
required = [
    ROOT / "index.html",
    ROOT / "styles.css",
    ROOT / "src" / "app.js",
    ROOT / "assets" / "scene" / "background.png",
    ROOT / "assets" / "scene" / "manifest.json",
]
missing = [str(p.relative_to(ROOT)) for p in required if not p.exists()]
if missing:
    raise SystemExit("缺少文件: " + ", ".join(missing))

manifest = json.loads((ROOT / "assets" / "scene" / "manifest.json").read_text(encoding="utf-8"))
if manifest["scene"]["width"] != 1672 or manifest["scene"]["height"] != 941:
    raise SystemExit("场景尺寸与素材 manifest 不一致")

print(f"OK: {len(required)} 个核心文件存在，场景 {manifest['scene']['width']}x{manifest['scene']['height']}")
