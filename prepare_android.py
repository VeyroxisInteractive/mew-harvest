from pathlib import Path
import shutil
root=Path(__file__).resolve().parent
assets=root/'android/app/src/main/assets'
if assets.exists():shutil.rmtree(assets)
assets.mkdir(parents=True)
for p in root.iterdir():
 if p.is_file() and p.suffix.lower() in {'.html','.js','.css','.png','.webp','.jpg','.jpeg','.svg','.json','.webmanifest','.mp3','.wav','.ogg'}:shutil.copy2(p,assets/p.name)
shutil.copytree(root/'art',assets/'art')
p=assets/'index.html';s=p.read_text();s=s.replace("if('serviceWorker' in navigator)","if(false /* APK uses bundled files */)");p.write_text(s)
print('Bundled game files prepared.')
