import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import './styles.css'
import './cinematic.css'

const WEDDING_DATE = new Date('2026-10-30T09:15:00+05:30')

function Lotus({small=false}) {
  return (
    <span className={`lotus ${small?'lotus--small':''}`} aria-hidden="true">
      {Array.from({length:8},(_,i)=><i key={i} style={{'--i':i}} />)}
      <b />
    </span>
  )
}

function Reveal({children, className=''}) {
  const reduce = useReducedMotion()
  return (
    <motion.div 
      className={className} 
      initial={reduce?false:{opacity:0,y:34}} 
      whileInView={{opacity:1,y:0}} 
      viewport={{once:true,amount:.2}} 
      transition={{duration:.72,ease:[.2,.75,.25,1]}}
    >
      {children}
    </motion.div>
  )
}

function LivingDetails(){
  const [blooms,setBlooms]=useState([])
  const {scrollYProgress}=useScroll()
  useEffect(()=>{
    const tap=e=>{
      if(e.target.closest('button,a'))return;
      const id=Date.now();
      setBlooms(v=>[...v.slice(-18),{id,x:e.clientX,y:e.clientY}]);
      setTimeout(()=>setBlooms(v=>v.filter(b=>b.id!==id)),900)
    };
    window.addEventListener('pointerdown',tap);
    return()=>window.removeEventListener('pointerdown',tap)
  },[])
  return (
    <>
      <motion.div className="reading-progress" style={{scaleY:scrollYProgress}}/>
      <div className="tap-blooms" aria-hidden="true">
        {blooms.map(b=>(
          <span key={b.id} style={{left:b.x,top:b.y}}>
            {Array.from({length:7},(_,i)=><i key={i} style={{'--i':i}}/>)}
          </span>
        ))}
      </div>
    </>
  )
}

function MusicWidget({ playing, onToggle }) {
  return (
    <button 
      className={`music-toggle ${playing ? 'is-playing' : ''}`}
      onClick={onToggle}
      aria-label={playing ? "Mute music" : "Play music"}
      title={playing ? "Mute music" : "Play music"}
    >
      <div className="music-bars" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <span className="music-label">{playing ? 'Audio On' : 'Music'}</span>
    </button>
  )
}

function Opening({onOpen}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef(null)

  const handleStart = () => {
    if (isPlaying) return
    setIsPlaying(true)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.muted = true
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Playback attempt:', err)
          if (videoRef.current) {
            videoRef.current.play().catch(() => onOpen())
          }
        })
      }
    }
  }

  return (
    <motion.div
      className={`opening opening--cinematic ${isPlaying ? 'is-playing' : ''}`}
      exit={{opacity: 0, scale: 1.035, filter: 'blur(8px)'}}
      transition={{duration: 1.05, ease: [.76, 0, .24, 1]}}
      onClick={handleStart}
      onWheel={(e) => {
        if (e.deltaY > 15) handleStart()
      }}
      style={{cursor: isPlaying ? 'default' : 'pointer'}}
    >
      <video
        ref={videoRef}
        className="opening__video"
        src="/assets/sm.mp4"
        playsInline
        muted
        autoPlay={false}
        preload="auto"
        onEnded={onOpen}
        style={{
          opacity: isPlaying ? 1 : 0,
          transition: 'opacity 0.4s ease'
        }}
      />
      <img
        src="/assets/flow-first-frame.webp"
        alt="A flower-filled wedding pavilion with closed green silk curtains"
        style={{
          opacity: isPlaying ? 0 : 1,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none'
        }}
      />
      <div className="opening__vignette" style={{opacity: isPlaying ? 0.3 : 1}} />

      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            className="opening__ui"
            initial={{opacity: 1}}
            exit={{opacity: 0, transition: {duration: 0.4}}}
          >
            <div className="opening__copy">
              <p className="opening__eyebrow">The wedding celebration of</p>
              <h2>
                <span>Sumukh</span>
                <i>&</i>
                <span>Vismayi</span>
              </h2>
              <p className="opening__date">30 · October · 2026</p>
            </div>

            <div className="opening__center-action" aria-label="Tap to open invitation">
              <div className="opening__ring-pulse" />
              <div className="opening__center-circle" />
              <span className="opening__tap-hint">Tap to open</span>
            </div>

            {/* Scroll indicator at the bottom of slide 1 (Opening) */}
            <div className="opening__bottom-hint" onClick={handleStart}>
              <span>Scroll down or tap to enter</span>
              <div className="scroll-chevron">↓</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isPlaying && (
        <motion.button
          className="opening__skip"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{delay: 1.2, duration: 0.4}}
          onClick={(e) => {
            e.stopPropagation()
            onOpen()
          }}
          aria-label="Skip to invitation"
        >
          Skip <i>→</i>
        </motion.button>
      )}
    </motion.div>
  )
}

function Countdown() {
  const calc=()=>Math.max(0,WEDDING_DATE-Date.now())
  const [left,setLeft]=useState(calc())
  useEffect(()=>{
    const id=setInterval(()=>setLeft(calc()),1000);
    return()=>clearInterval(id)
  },[])
  const values=[
    ['Days',Math.floor(left/86400000)],
    ['Hours',Math.floor(left/3600000)%24],
    ['Mins',Math.floor(left/60000)%60],
    ['Secs',Math.floor(left/1000)%60]
  ]
  return (
    <div className="countdown">
      {values.map(([label,value])=>(
        <div className="time" key={label}>
          <div className="flip">
            <AnimatePresence mode="popLayout">
              <motion.span 
                key={value} 
                initial={{rotateX:-80,opacity:0}} 
                animate={{rotateX:0,opacity:1}} 
                exit={{rotateX:80,opacity:0}} 
                transition={{duration:.34}}
              >
                {String(value).padStart(2,'0')}
              </motion.span>
            </AnimatePresence>
          </div>
          <small>{label}</small>
        </div>
      ))}
    </div>
  )
}

function ScratchDate(){
  const canvas=useRef(null),drawing=useRef(false),moves=useRef(0)
  const [revealed,setRevealed]=useState(false)
  useEffect(()=>{
    const c=canvas.current,ctx=c.getContext('2d');
    const draw=()=>{
      const r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
      c.width=r.width*d;
      c.height=r.height*d;
      ctx.scale(d,d);
      const g=ctx.createLinearGradient(0,0,r.width,r.height);
      g.addColorStop(0,'#c58b25');
      g.addColorStop(.45,'#f0c65c');
      g.addColorStop(1,'#9e6519');
      ctx.fillStyle=g;
      ctx.fillRect(0,0,r.width,r.height);
      ctx.fillStyle='rgba(48,68,22,.18)';
      for(let x=-20;x<r.width;x+=42) {
        for(let y=-20;y<r.height;y+=42){
          ctx.beginPath();
          ctx.ellipse(x,y,7,16,.7,0,Math.PI*2);
          ctx.fill()
        }
      }
      ctx.fillStyle='#304416';
      ctx.textAlign='center';
      ctx.font='600 11px Manrope';
      ctx.letterSpacing='3px';
      ctx.fillText('SCRATCH TO REVEAL',r.width/2,r.height/2+4)
    };
    draw();
    window.addEventListener('resize',draw);
    return()=>window.removeEventListener('resize',draw)
  },[])

  const scratch=e=>{
    if(!drawing.current||revealed)return;
    const c=canvas.current,r=c.getBoundingClientRect(),ctx=c.getContext('2d'),d=Math.min(devicePixelRatio||1,2),x=(e.clientX-r.left)*d,y=(e.clientY-r.top)*d;
    ctx.save();
    ctx.globalCompositeOperation='destination-out';
    ctx.beginPath();
    ctx.arc(x,y,30*d,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
    if(++moves.current>46)setRevealed(true)
  }

  return (
    <section className="scratch-section section">
      <Reveal>
        <p className="script">A little secret</p>
        <h2>Save the date</h2>
        <p className="scratch-hint">Run your finger across the gold to reveal it.</p>
        <div className={`scratch-card ${revealed?'is-revealed':''}`}>
          <div className="scratch-card__date">
            <small>Friday</small>
            <strong>30</strong>
            <span>October · 2026</span>
            <i>Billava Bhavana · Bengaluru</i>
          </div>
          <canvas 
            ref={canvas} 
            onPointerDown={e=>{drawing.current=true;e.currentTarget.setPointerCapture(e.pointerId);scratch(e)}} 
            onPointerMove={scratch} 
            onPointerUp={()=>drawing.current=false} 
            onPointerCancel={()=>drawing.current=false}
          />
          {revealed&&<motion.div className="scratch-spark" initial={{scale:.4,opacity:0}} animate={{scale:1,opacity:1}}>It’s a date</motion.div>}
        </div>
      </Reveal>
    </section>
  )
}

function FloatingLayer(){
  return (
    <>
      <div className="floating-ornaments" aria-hidden="true"><i/><i/><i/><i/></div>
      <div className="lantern-field" aria-hidden="true">
        {Array.from({length:9},(_,i)=><span key={i} className={`lantern lantern--${i%3}`}><b/><i/></span>)}
      </div>
      <nav className="glass-dock" aria-label="Invitation sections">
        <a href="#couple">Couple</a>
        <b>✦</b>
        <a href="#story">Story</a>
        <b>✦</b>
        <a href="#events">Events</a>
        <b>✦</b>
        <a href="#venue">Venue</a>
      </nav>
    </>
  )
}

const events=[
  {
    name: 'Muhurtham',
    lagna: 'Dhanur Lagna',
    date: 'Friday, 30 Oct 2026',
    time: '9:15 AM to 10:19 AM',
    place: '"Billava Bhavana" (Devaki Ananda Suvarna Convention Hall)',
    mark: 'wedding',
    detail: 'Auspicious Muhurtham ceremony in Dhanur lagna. We request your presence to shower your blessings on the couple.'
  },
  {
    name: 'Reception',
    lagna: 'Evening Celebration',
    date: 'Friday, 30 Oct 2026',
    time: '7:00 PM onwards',
    place: '"Billava Bhavana" (Devaki Ananda Suvarna Convention Hall)',
    mark: 'reception',
    detail: 'Join us to celebrate the beginning of their journey together with dinner, music, and fond memories.'
  }
]

function CalendarButton(){
  const add=()=>{
    const body=[
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sumukh & Vismayi//Wedding//EN',
      'BEGIN:VEVENT',
      'UID:sumukh-vismayi-2026@invitestory.in',
      'DTSTAMP:20260923T000000Z',
      'DTSTART:20261030T034500Z',
      'DTEND:20261030T163000Z',
      'SUMMARY:Sumukh & Vismayi | Wedding Celebration',
      'LOCATION:Billava Bhavana (Devaki Ananda Suvarna Convention Hall), Bannerughatta road, Hulimavu, Bengaluru',
      'DESCRIPTION:Wedding of Sumukh C and Vismayi Venkataramu. Muhurtham: 9:15 AM - 10:19 AM | Reception: 7:00 PM onwards.',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([body],{type:'text/calendar'}));
    a.download='sumukh-vismayi-wedding.ics';
    a.click();
    URL.revokeObjectURL(a.href)
  }
  return <button className="button button--gold" onClick={add}>Add to calendar <span>＋</span></button>
}

function App(){
  const [opened,setOpened]=useState(false)
  const [activeEvent,setActiveEvent]=useState(0)
  const [musicPlaying, setMusicPlaying]=useState(false)
  const hero=useRef(null)
  const audioRef=useRef(null)
  const reduce=useReducedMotion()
  const {scrollYProgress}=useScroll({target:hero,offset:['start start','end start']})
  const artY=useTransform(scrollYProgress,[0,1],['0%','14%'])
  const textY=useTransform(scrollYProgress,[0,1],['0%','32%'])
  const petals=useMemo(()=>Array.from({length:16},(_,i)=>({id:i,left:(i*37)%94,delay:(i%6)*.14,rot:(i*53)%180})),[])

  useEffect(() => {
    if (!opened) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [opened])

  const handleOpenInvitation = () => {
    setOpened(true)
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setMusicPlaying(true)
      }).catch((err) => {
        console.log('Autoplay audio notification:', err)
      })
    }
  }

  const toggleMusic = () => {
    if (!audioRef.current) return
    if (musicPlaying) {
      audioRef.current.pause()
      setMusicPlaying(false)
    } else {
      audioRef.current.play().then(() => {
        setMusicPlaying(true)
      }).catch(() => {})
    }
  }

  return (
    <main>
      {/* Background Audio */}
      <audio ref={audioRef} src="/assets/music.mp3" loop preload="auto" />

      <LivingDetails/>
      {opened && <FloatingLayer/>}
      {opened && <MusicWidget playing={musicPlaying} onToggle={toggleMusic} />}

      <AnimatePresence>
        {!opened && <Opening onOpen={handleOpenInvitation} />}
      </AnimatePresence>

      {/* 1st Slide: Hero Section with Scroll indicator at bottom */}
      <section className="hero" ref={hero} id="hero">
        <motion.img 
          style={reduce?{}:{y:artY}} 
          className="hero__art" 
          src="/assets/aarav-ananya-hero.webp" 
          alt="Sumukh and Vismayi wedding celebration illustration" 
        />
        <div className="hero__shade" />
        <motion.div 
          className="hero__copy" 
          style={reduce?{}:{y:textY}} 
          initial={{opacity:0}} 
          animate={{opacity:opened?1:0}} 
          transition={{delay:.25,duration:.9}}
        >
          <p className="eyebrow">Together with our families</p>
          <h1><span>Sumukh</span><i>&</i><span>Vismayi</span></h1>
          <div className="date-rule"><b />30 · 10 · 2026<b /></div>
          <p className="hero__note">We found home in one another.<br/>Come celebrate our forever.</p>
        </motion.div>
        
        {opened && (
          <div className="petal-field" aria-hidden="true">
            {petals.map(p=>(
              <i key={p.id} style={{left:`${p.left}%`,animationDelay:`${p.delay}s`,'--r':`${p.rot}deg`}} />
            ))}
          </div>
        )}

        {/* Scroll indicator at the bottom of the 1st slide */}
        <motion.div 
          className="hero__scroll-indicator" 
          initial={{opacity: 0, y: 12}}
          animate={{opacity: opened ? 1 : 0, y: 0}}
          transition={{delay: 1.1, duration: 0.8}}
          onClick={() => {
            const el = document.getElementById('couple')
            el?.scrollIntoView({behavior: 'smooth'})
          }}
          role="button"
          aria-label="Scroll to explore invitation"
          tabIndex={0}
        >
          <span className="scroll-hint-label">Scroll to explore</span>
          <div className="scroll-mouse-icon">
            <span className="scroll-wheel-dot" />
          </div>
          <span className="scroll-arrow-down">↓</span>
        </motion.div>
      </section>

      {/* Bride & Groom Section with individual photos & Family Details */}
      <section className="couple-section section" id="couple">
        <Reveal>
          <div className="section-heading-center">
            <Lotus small />
            <p className="script">Together with our families</p>
            <h2>The Bride &amp; Groom</h2>
            <div className="gold-ornament-line"><b/><i/><b/></div>
          </div>
        </Reveal>

        <div className="couple-grid">
          {/* Groom Card */}
          <Reveal className="couple-card">
            <div className="couple-card__frame">
              <div className="couple-card__arch">
                <img 
                  src="/assets/sumukh.png" 
                  alt="Sumukh C - The Groom" 
                  className="couple-card__photo" 
                />
              </div>
              <div className="couple-badge">The Groom</div>
            </div>
            <div className="couple-card__info">
              <h3>Sumukh C</h3>
              <p className="couple-card__parentage">
                <span className="relation-label">Son of</span>
                <strong>Smt. Shashikala M.S</strong>
                <span className="ampersand">&amp;</span>
                <strong>Sri. Channakeshava H.S</strong>
              </p>
            </div>
          </Reveal>

          {/* Bride Card */}
          <Reveal className="couple-card">
            <div className="couple-card__frame">
              <div className="couple-card__arch">
                <img 
                  src="/assets/vismayi.png" 
                  alt="Vismayi Venkataramu - The Bride" 
                  className="couple-card__photo" 
                />
              </div>
              <div className="couple-badge">The Bride</div>
            </div>
            <div className="couple-card__info">
              <h3>Vismayi Venkataramu</h3>
              <p className="couple-card__parentage">
                <span className="relation-label">Elder Daughter of</span>
                <strong>Smt. Veena C.S</strong>
                <span className="ampersand">&amp;</span>
                <strong>Late Sri. P.S Venkataramu</strong>
              </p>
            </div>
          </Reveal>
        </div>

        {/* Awaiting your gracious presence card */}
        <Reveal className="presence-card-wrap">
          <div className="presence-card">
            <div className="presence-card__ornament">✦ ✦ ✦</div>
            <p className="kicker">With warm affection &amp; blessings</p>
            <h3>Awaiting your gracious presence:</h3>
            <div className="presence-names-list">
              <p className="presence-main-name">Smt. Shashikala M.S and Sri. Channakeshava H.S</p>
              <p className="presence-sub-name">Kum. Namitha C</p>
            </div>
            <p className="presence-footer-text">&amp; Near and Dear Ones</p>
          </div>
        </Reveal>
      </section>

      {/* Countdown Section */}
      <section className="count-section section" id="count-section">
        <Reveal>
          <p className="script">Until we say yes</p>
          <h2>The celebration begins in</h2>
          <Countdown/>
        </Reveal>
      </section>

      {/* Scratch Date Section */}
      <ScratchDate/>

      {/* Story Section */}
      <section className="story section botanical" id="story">
        <div className="leaf leaf--left" aria-hidden="true" />
        <Reveal className="story__inner">
          <Lotus/>
          <p className="kicker">Our story</p>
          <h2>Two paths,<br/><em>one beautiful promise</em></h2>
          <p>
            From quiet glances to endless laughter, our story has always felt like coming home. 
            With the sacred blessings of our elders and families, we take our first steps together into forever.
          </p>
          <div className="signature">Sumukh <i>&</i> Vismayi</div>
        </Reveal>
        <Reveal className="story__portrait">
          <img 
            loading="lazy" 
            src="/assets/couple.jpg" 
            alt="Sumukh and Vismayi engaged with love" 
          />
          <span>From friends<br/>to forever</span>
        </Reveal>
      </section>

      {/* Events Section */}
      <section className="events section" id="events">
        <Reveal>
          <p className="script">Auspicious Occasions</p>
          <h2>Wedding Festivities</h2>
        </Reveal>
        <div className="event-list">
          {events.map((e,i)=>(
            <Reveal key={e.name}>
              <button 
                className={`event event--${e.mark} ${activeEvent===i?'is-open':''}`} 
                onClick={()=>setActiveEvent(activeEvent===i?-1:i)} 
                aria-expanded={activeEvent===i}
              >
                <div className="event__num">0{i+1}</div>
                <div>
                  <div className="event-header-row">
                    <h3>{e.name}</h3>
                    <span className="event-lagna-badge">{e.lagna}</span>
                  </div>
                  <p>{e.date} · {e.time}</p>
                  <span>{e.place}</span>
                  {activeEvent===i&&(
                    <motion.div 
                      className="event__detail" 
                      initial={{opacity:0,height:0}} 
                      animate={{opacity:1,height:'auto'}}
                    >
                      {e.detail}
                      <br/>
                      <small style={{display:'inline-block',marginTop:'6px',color:'var(--gold)'}}>Tap again to collapse</small>
                    </motion.div>
                  )}
                </div>
                <Lotus small/>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Venue Section */}
      <section className="venue section" id="venue">
        <Reveal className="venue__card">
          <div className="map map--google">
            <iframe 
              title="Google Map showing Billava Bhavana in Bengaluru" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade" 
              src="https://www.google.com/maps?q=Billava+Bhavana+Bannerghatta+Road+Hulimavu+Bengaluru&z=15&output=embed" 
            />
            <div className="map__tint" aria-hidden="true">
              <span className="pin"><Lotus small/></span>
              <p>Touch to explore · Bengaluru</p>
            </div>
          </div>
          <div className="venue__copy">
            <p className="kicker">The Venue</p>
            <h2>"Billava Bhavana"</h2>
            <p className="venue-hall-sub">(Devaki Ananda Suvarna Convention Hall)</p>
            <p className="venue-address">
              Next to Royal Meenakshi Mall,<br/>
              Bannerughatta Road, Hulimavu,<br/>
              Bengaluru
            </p>
            <a 
              className="button" 
              href="https://www.google.com/maps/search/?api=1&query=Billava+Bhavana+Bannerughatta+Road+Hulimavu+Bengaluru" 
              target="_blank" 
              rel="noreferrer"
            >
              Open in Google Maps <span>↗</span>
            </a>
            <CalendarButton/>
          </div>
        </Reveal>
      </section>

      {/* Last Section / Footer with 3rd Couple Image as Background */}
      <footer>
        <img 
          loading="lazy" 
          src="/assets/couple.jpg" 
          alt="Sumukh and Vismayi" 
          className="footer__couple-bg"
        />
        <div className="footer__shade"/>
        <Reveal className="footer__copy">
          <p className="script">With love</p>
          <h2>Sumukh <i>&</i> Vismayi</h2>
          <p>We cannot wait to celebrate with you.</p>
          <div className="footer-date-tag">30 · October · 2026 · Bengaluru</div>
          <Lotus/>
        </Reveal>
        <a 
          href="https://www.instagram.com/invitestory.in/" 
          target="_blank" 
          rel="noreferrer" 
          style={{
            position:'relative',
            zIndex:2,
            display:'block',
            textAlign:'center',
            fontSize:'8.5px',
            textTransform:'uppercase',
            letterSpacing:'.18em',
            color:'rgba(255,248,223,.55)',
            textDecoration:'none',
            paddingBottom:'22px'
          }}
        >
          Follow @invitestory.in on Instagram
        </a>
      </footer>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App/>)
