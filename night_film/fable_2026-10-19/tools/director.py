"""Python replica of birthday.rs FilmTrack::shot_base + Warp, for sidecar-only predictions.
Verified against the shipped film.json / night film.json (see verify())."""
import json, math
D2R=math.pi/180

def load_track(path):
    txt=open(path).read().split('\n')
    meta=json.loads(txt[0]); rows=[list(map(float,l.split(','))) for l in txt[1:] if l.strip()]
    return meta, rows

def light_of(sun_alt):
    return 'day' if sun_alt>0 else ('twi' if sun_alt>-18 else 'night')
DENS={'day':0.6,'twi':9.0,'night':3.5}

class Warp:
    def __init__(self, sun_alt):
        n=len(sun_alt); last=n-1
        runs=[]; start=0; cur=light_of(sun_alt[0])
        for i in range(1,n):
            l=light_of(sun_alt[i])
            if l!=cur: runs.append((start,i,cur)); start=i; cur=l
        runs.append((start,n-1,cur))
        w=[((i1-i0)/last)*DENS[l] for i0,i1,l in runs]; tot=sum(w)
        self.segs=[]; a=0.0
        for k,(i0,i1,l) in enumerate(runs):
            da=w[k]/tot
            self.segs.append([a,min(a+da,1.0),i0/last,i1/last,l]); a+=da
        self.segs[-1][1]=1.0; self.segs[-1][3]=1.0
    def track_at(self,a):
        a=min(max(a,0.0),1.0)
        for a0,a1,s0,s1,l in self.segs:
            if a<=a1:
                d=a1-a0
                return s0 if d<=0 else s0+(s1-s0)*((a-a0)/d)
        return 1.0
    def share(self,light): return sum(s[1]-s[0] for s in self.segs if s[4]==light)

def key_track(keys,t):
    if t<=keys[0][0]: return keys[0][1]
    if t>=keys[-1][0]: return keys[-1][1]
    for (a0,v0),(a1,v1) in zip(keys,keys[1:]):
        if a0<=t<=a1:
            u=(t-a0)/(a1-a0); s=u*u*(3-2*u); return v0+(v1-v0)*s
    return keys[-1][1]

class Film:
    def __init__(self, meta, rows, night=False, anim_secs=None, widen=16/9,
                 sweep=(720.0,36.0,16.0,2.5), nsweep=(1440.0,0.0,70.0,6.5), night_last=None):
        self.meta=meta; self.rows=rows; self.n=len(rows); self.night=night
        self.intro=meta['intro_secs']; self.hero=meta['hero_secs']
        self.anim=anim_secs if anim_secs else meta['anim_secs']
        self.widen=widen; self.sweep=sweep; self.nsweep=nsweep
        self.warp=Warp([r[2] for r in rows])
        # the last sample the NIGHT pass runs to (default: the whole track, as shipped)
        self.night_last = (self.n-1) if night_last is None else night_last
    def loop_secs(self): return self.anim if self.night else self.intro+self.hero+self.anim
    def sun_off_for(self,si):
        alt=self.rows[si][2]
        if alt>=0: return 0.0
        if alt<=-6: return 1.0
        u=-alt/6; return u*u*(3-2*u)
    def shot(self,t_sec):
        s=self.shot_base(t_sec)
        if self.widen!=1.0:
            half=math.tan(math.radians(s['fov'])*0.5)*self.widen
            s['fov']=math.degrees(2*math.atan(half))
        return s
    def shot_base(self,t_sec):
        last=self.n-1; m=self.meta
        t=t_sec%self.loop_secs()
        if self.night:
            a=min(max(t/self.anim,0),1)
            si=min(int(round(a*self.night_last)),last)
            pan,base,amp,cyc=self.nsweep
            return dict(phase='anim',sample=si,az=m['establish_az']+pan*a,
                        alt=base+amp*math.sin(2*math.pi*cyc*a),fov=m['wide_fov'],sun_off=1.0)
        if t<self.intro:
            keys=[(0.0,1.0),(0.42,1.0),(0.54,0.0),(0.66,0.0),(0.80,1.0),(1.0,1.0)]
            return dict(phase='intro',sample=0,az=m['establish_az'],alt=m['establish_alt'],fov=m['wide_fov'],
                        sun_off=key_track(keys,t/self.intro))
        if t<self.intro+self.hero:
            v=(t-self.intro)/self.hero; u=v*v*(3-2*v)
            return dict(phase='hero',sample=0,
                        az=m['establish_az']+(m['birth_moon_az']-m['establish_az'])*u,
                        alt=m['establish_alt']+(m['birth_moon_alt']-m['establish_alt'])*u,
                        fov=m['wide_fov']+(8.0-m['wide_fov'])*u,sun_off=1.0)
        a=min(max((t-self.intro-self.hero)/self.anim,0),1)
        si=min(int(round(self.warp.track_at(a)*last)),last)
        fov_keys=[(0.0,8.0),(0.06,m['wide_fov']),(1.0,m['wide_fov'])]
        lock_keys=[(0.0,1.0),(0.05,1.0),(0.14,0.0),(1.0,0.0)]
        m_az,m_alt=self.rows[si][5],self.rows[si][6]
        moon_up=min(max((m_alt-2)/12,0),1); lock=key_track(lock_keys,a)*moon_up
        pan,base,amp,cyc=self.sweep
        drift=m['birth_moon_az']+(m['establish_az']+pan-m['birth_moon_az'])*a
        anchor=base+amp*math.sin(2*math.pi*cyc*a)
        return dict(phase='anim',sample=si,az=m_az*lock+drift*(1-lock),
                    alt=min(max(m_alt*lock+anchor*(1-lock),0),85),fov=key_track(fov_keys,a),
                    sun_off=self.sun_off_for(si))

def rust_round(x):
    # Rust f64::round rounds half away from zero
    return math.floor(x+0.5) if x>=0 else -math.floor(-x+0.5)

def sidecar(film,fps=30):
    n=int(round(film.loop_secs()*fps)); out=dict(sample=[],az=[],alt=[],fov=[],lst=[])
    for k in range(n):
        s=film.shot(k/fps)
        out['sample'].append(s['sample']); out['az'].append(s['az']%360); out['alt'].append(s['alt']); out['fov'].append(s['fov'])
        out['lst'].append(film.rows[s['sample']][0])
    return out

def runs(a):
    r=[];c=1
    for i in range(1,len(a)):
        if a[i]==a[i-1]: c+=1
        else: r.append(c); c=1
    r.append(c); return r

if __name__=='__main__':
    import sys
    from collections import Counter
    base=sys.argv[1]
    meta,rows=load_track(base+'/pai_track.json')
    for night,path in [(False,'/film/film.json'),(True,'/night/film.json')]:
        f=Film(meta,rows,night=night,anim_secs=60 if night else None)
        sc=sidecar(f); ref=json.load(open(base+path))
        bad=sum(1 for i in range(ref['frames']) if sc['sample'][i]!=ref['sample'][i])
        daz=max(abs(((sc['az'][i]-ref['aim_az'][i])+180)%360-180) for i in range(ref['frames']))
        dalt=max(abs(sc['alt'][i]-ref['aim_alt'][i]) for i in range(ref['frames']))
        dfov=max(abs(sc['fov'][i]-ref['fov'][i]) for i in range(ref['frames']))
        print(f"verify {path}: frames {len(sc['sample'])}/{ref['frames']}  sample mismatches {bad}  max|daz| {daz:.4f}  max|dalt| {dalt:.4f}  max|dfov| {dfov:.4f}")
