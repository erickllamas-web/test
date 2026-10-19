"""Turn a harness timeline into seam numbers: per tag, the luminance of the stage over time,
black samples, the biggest frame-to-frame visual jump, and the summaries the harness wrote."""
import sys, json, os, numpy as np
from PIL import Image
out=sys.argv[1]; tl=json.load(open(os.path.join(out,'timeline.json')))
def lum(file):
    im=np.asarray(Image.open(os.path.join(out,file)).convert('RGB')).astype(float)
    # ignore the glass panel region (top 110 px on a phone) and the caption corner: measure the middle band
    h,w,_=im.shape; band=im[int(h*0.25):int(h*0.95), :, :]
    return band.mean(), band
tags=[]
for e in tl:
    if 'file' in e and e['tag'] not in tags: tags.append(e['tag'])
for tag in tags:
    rows=[e for e in tl if e.get('tag')==tag]
    prev=None; series=[]; maxjump=(0,None); black=0
    for e in rows:
        L,band=lum(e['file'])
        v=e['vids']; shown=[x for x in v if x['cls']!='off' and float(x['op'])>0]
        series.append((e['ms'],round(L,1),[(x['t'],x['src'][:9],x['op'],x['rs']) for x in v],e.get('shape'),e.get('veil')))
        if L<3: black+=1
        if prev is not None:
            j=np.abs(band-prev).mean()
            if j>maxjump[0]: maxjump=(j,e['ms'])
        prev=band
    lums=[s[1] for s in series]
    print(f"\n### {tag}: {len(rows)} samples over {rows[-1]['ms']} ms | lum min {min(lums):.1f} median {np.median(lums):.1f} max {max(lums):.1f} | black samples {black} | biggest visual jump {maxjump[0]:.1f} at {maxjump[1]} ms")
    for ms,L,v,shape,veil in series:
        print(f"  {ms:5d} ms  lum {L:5.1f}  shape {shape}  veil {veil}  " + "  ".join(f"[{t:6.2f}s {src} op{op} rs{rs}]" for t,src,op,rs in v))
for e in tl:
    if e.get('tag','').endswith('summary'): print('\n##', json.dumps(e))
