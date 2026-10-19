import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
"""Predictions from the director port: (1) sky-hold lengths vs track density, (2) the night pass over
one sidereal day, (3) night sweep candidates scored the way the 2026-09-28 grid scored them."""
import sys, json, math, numpy as np
from collections import Counter
from director import *
base=sys.argv[1]
meta,rows=load_track(base+'/pai_track.json')
sky=json.load(open(base+'/night/sky.json'))
R=np.array(rows); n0=len(rows)

# ── (1) hold lengths vs density ─────────────────────────────────────────────
def densify(rows,k):
    """k× samples by linear interpolation of the 720 real rows — a stand-in for a denser daemon track.
    Only the Sun altitudes (the clock) and the count matter for hold lengths."""
    a=np.array(rows); n=len(a); m=(n-1)*k+1
    x=np.linspace(0,n-1,m); i=np.floor(x).astype(int); i=np.minimum(i,n-2); f=(x-i)[:,None]
    out=a[i]*(1-f)+a[i+1]*f
    # LST unwrapped then rewrapped
    lst=a[:,0].copy(); d=np.diff(lst)%360; un=np.concatenate([[lst[0]],lst[0]+np.cumsum(d)])
    out[:,0]=(un[i]*(1-f[:,0])+un[i+1]*f[:,0])%360
    return [list(r) for r in out]
print("== (1) frames the same sky sample is held, by track density (film animation act / night pass)")
for k in [1,2,3,6]:
    rk=densify(rows,k) if k>1 else rows
    mk=dict(meta); mk['n_frames']=len(rk)
    f=Film(mk,rk); sc=sidecar(f); a0=int((f.intro+f.hero)*30); rf=runs(sc['sample'][a0:])
    fn=Film(mk,rk,night=True,anim_secs=60); scn=sidecar(fn); rn=runs(scn['sample'])
    still_f=sum(1 for i in range(a0,len(sc['sample'])-1) if sc['sample'][i]==sc['sample'][i+1])
    still_n=sum(1 for i in range(len(scn['sample'])-1) if scn['sample'][i]==scn['sample'][i+1])
    print(f"  {len(rk):5d} samples ({meta['cycle_h']*60/(len(rk)-1):5.2f} min apart): film max hold {max(rf)} frames, "
          f"frozen transitions {still_f}/{len(sc['sample'])-a0-1} ({100*still_f/(len(sc['sample'])-a0-1):.0f}%) | "
          f"night max hold {max(rn)}, frozen {still_n}/{len(scn['sample'])-1} ({100*still_n/(len(scn['sample'])-1):.0f}%)")

# ── (2) the sidereal day inside the track ───────────────────────────────────
lst=R[:,0]; d=np.diff(lst)%360; un=np.concatenate([[lst[0]],lst[0]+np.cumsum(d)])
adv=un-un[0]; i_sid=int(np.argmin(np.abs(adv-360)))
print(f"\n== (2) LST advances {adv[-1]:.3f}° over the track; 360° is reached at sample {i_sid} "
      f"(residual {adv[i_sid]-360:+.3f}° = {abs(adv[i_sid]-360)*10.88:.1f} px at 4K centre); "
      f"the track's last sample is {adv[-1]-360:.2f}° = {(adv[-1]-360)*10.88:.0f} px past it")
moon0=R[0,5:7]; moonS=R[i_sid,5:7]
def ang(a1,e1,a2,e2):
    v1=np.array(dirAltaz(a1,e1)) if False else None
    import math
    d1=[math.sin(a1*D2R)*math.cos(e1*D2R),math.sin(e1*D2R),math.cos(a1*D2R)*math.cos(e1*D2R)]
    d2=[math.sin(a2*D2R)*math.cos(e2*D2R),math.sin(e2*D2R),math.cos(a2*D2R)*math.cos(e2*D2R)]
    return math.degrees(math.acos(max(-1,min(1,sum(x*y for x,y in zip(d1,d2))))))
print(f"   at the loop the Moon would jump {ang(*moonS,*moon0):.1f}° (it moves ~13°/day against the stars); "
      f"today it jumps {ang(*R[-1,5:7],*moon0):.1f}° and the stars jump {adv[-1]-360:.1f}°")

# ── (3) the night seek index, scored per shape ──────────────────────────────
ra=np.radians(np.array(sky['ra'])); dec=np.radians(np.array(sky['dec'])); mag=np.array(sky['mag'])
con=np.array(sky['con']); cons=sky['con_list']
# flux-weighted constellation centroids, as birthday.rs constellation_centroids()
cen=[]
for ci,code in enumerate(cons):
    sel=con==ci
    if not sel.any(): continue
    w=10**(-0.4*mag[sel]); v=np.array([(w*np.cos(dec[sel])*np.cos(ra[sel])).sum(),(w*np.cos(dec[sel])*np.sin(ra[sel])).sum(),(w*np.sin(dec[sel])).sum()])
    v/=np.linalg.norm(v); cen.append((math.atan2(v[1],v[0])%(2*math.pi), math.asin(max(-1,min(1,v[2]))), mag[sel].min()))
cen_ra=np.array([c[0] for c in cen]); cen_dec=np.array([c[1] for c in cen]); cen_mag=np.array([c[2] for c in cen])
lat=math.radians(meta['lat'])
def altaz(ra_,dec_,lst_deg):
    ha=math.radians(lst_deg)-ra_
    sa=np.sin(dec_)*math.sin(lat)+np.cos(dec_)*math.cos(lat)*np.cos(ha)
    alt=np.arcsin(np.clip(sa,-1,1))
    az=np.arctan2(-np.cos(dec_)*np.sin(ha), np.sin(dec_)*math.cos(lat)-np.cos(dec_)*math.sin(lat)*np.cos(ha))
    return np.degrees(az)%360, np.degrees(alt)
def basis(az,alt,fov):
    a,e=math.radians(az),math.radians(alt)
    fwd=np.array([math.sin(a)*math.cos(e),math.sin(e),math.cos(a)*math.cos(e)])
    right=np.cross([0,1,0],fwd); right/=np.linalg.norm(right); up=np.cross(fwd,right)
    t=round(math.tan(math.radians(fov)*0.25)*1e5)/1e5
    return right,up,fwd,2*t/(1-t*t)
SHAPES={'169':(3840,2160),'916':(2160,3840),'43':(3840,2880),'34':(2880,3840)}
W=H=3840; MAGLIM=9.061
def score_sweep(nsweep,night_last,label,steps=1800,anim=60.0):
    f=Film(meta,rows,night=True,anim_secs=anim,nsweep=nsweep,night_last=night_last)
    nst=len(mag); nco=len(cen); nb=2+len(meta['planets']); tot=nst+nco+nb
    best={k:np.full(tot,-1e18) for k in SHAPES}; bt={k:np.zeros(tot) for k in SHAPES}
    balt={k:np.full(tot,-90.0) for k in SHAPES}; bframed={k:np.zeros(tot,bool) for k in SHAPES}
    br={k:np.zeros(tot) for k in SHAPES}
    maxalt=np.full(tot,-90.0); aims=[]
    for k in range(steps):
        a=k/(steps-1); t=a*anim; s=f.shot(t); r=rows[s['sample']]
        right,up,fwd,half=basis(s['az'],s['alt'],s['fov']); aims.append(fwd)
        az1,al1=altaz(ra,dec,r[0]); az2,al2=altaz(cen_ra,cen_dec,r[0])
        baz=np.array([r[1],r[5]]+[r[14+4*j] for j in range(len(meta['planets']))]); bal=np.array([r[2],r[6]]+[r[15+4*j] for j in range(len(meta['planets']))])
        AZ=np.concatenate([az1,az2,baz]); AL=np.concatenate([al1,al2,bal]); MG=np.concatenate([mag,cen_mag,np.full(nb,-np.inf)])
        isb=np.zeros(tot,bool); isb[nst+nco:]=True
        maxalt=np.maximum(maxalt,AL)
        ok=np.where(isb, AL>-1.0, True) & (MG<=MAGLIM)
        A=np.radians(AZ); E=np.radians(AL); V=np.stack([np.sin(A)*np.cos(E),np.sin(E),np.cos(A)*np.cos(E)],1)
        cz=V@fwd; ok&=cz>1e-4; cz=np.where(cz>1e-4,cz,1)
        nx=(V@right)/cz/(half*W/H); ny=(V@up)/cz/half
        x=(nx+1)*0.5*W-0.5; y=(1-ny)*0.5*H-0.5
        for key,(cw,ch) in SHAPES.items():
            x0=(W-cw)/2; y0=(H-ch)/2; inside=ok&(x>=x0)&(y>=y0)&(x<x0+cw)&(y<y0+ch)
            rr=np.hypot(x-W/2,y-H/2)/(0.5*math.hypot(cw,ch))
            wa=np.where(isb,1.0,0.0)
            sc=np.where(AL>0.5, 1000+100*(1-rr)+wa*AL, 30*(1-rr))
            sc=np.where(inside,sc,-1e18)
            upd=sc>best[key]
            best[key][upd]=sc[upd]; bt[key][upd]=t; balt[key][upd]=AL[upd]; bframed[key][upd]=True
            # zoom needed to centre: W/(W-2|ox|), H/(H-2|oy|) within the crop
            ox=np.abs(x-W/2); oy=np.abs(y-H/2)
            z=np.maximum(1,np.maximum(cw/np.maximum(1,cw-2*ox), ch/np.maximum(1,ch-2*oy)))
            br[key][upd]=z[upd]
    # free-look: worst gap between any sky direction and the nearest frame aim
    aims=np.array(aims); g=np.arange(20000)+0.5; ph=np.arccos(1-2*g/20000); th=math.pi*(1+5**0.5)*g
    P=np.stack([np.cos(th)*np.sin(ph),np.cos(ph),np.sin(th)*np.sin(ph)],1)
    gap=np.degrees(np.arccos(np.clip((P@aims.T).max(1),-1,1))); worst=gap.max(); med=np.median(gap)
    out=[]
    for key in SHAPES:
        fr=bframed[key]; below=((balt[key]<0.5)&(maxalt>5)&fr); over2=(br[key]>2)&fr
        out.append(f"{key}: framed {fr.sum()} below {below[:nst].sum()}s+{below[nst:nst+nco].sum()}c over2x {over2.sum()}")
    print(f"  {label:34s} | freelook worst {worst:5.1f}° median {med:4.1f}° | "+" | ".join(out))
print("\n== (3) night sweep candidates (pan, alt_base, alt_amp, cycles), scored as the grid was")
score_sweep((1440,0,70,6.5),719,"shipped: 6.5 cyc, whole track")
score_sweep((1440,0,70,6.5),i_sid,"6.5 cyc, sidereal day")
for cyc in [6.0,7.0]:
    score_sweep((1440,0,70,cyc),i_sid,f"{cyc} cyc, sidereal day")
for cyc in [6.0,7.0]:
    score_sweep((1440,0,75,cyc),i_sid,f"{cyc} cyc amp 75, sidereal day")
score_sweep((1440,0,65,7.0),i_sid,"7.0 cyc amp 65, sidereal day")
