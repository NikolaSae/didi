// Provera da li je tsParticles učitan
window.addEventListener('load', async () => {
  console.log('Stranica učitana, pokrećem tsParticles...');
  
  if (typeof tsParticles === 'undefined') {
    console.error('tsParticles nije učitan!');
    return;
  }
  
  try {
    await tsParticles.load("tsparticles", {
    options: {
      pauseOnBlur: false,
      
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "bubble"
          },
          resize: true
        },
        modes: {
          bubble: {
            distance: 40,
            duration: 2,
            opacity: 8,
            size: 6,
            speed: 3
          }
        }
      },
      
      particles: {
        color: {
          value: ["#4285f4", "#34A853", "#FBBC05", "#EA4335"]
        },
        links: {
          color: "random",
          distance: 40,
          enable: true,
          opacity: 0.8,
          width: 1
        },
        move: {
          direction: "none",
          enable: true,
          outModes: "bounce",
          speed: 1
        },
        number: {
          value: 200
        },
        opacity: {
          animation: {
            enable: true,
            speed: 2,
            sync: false
          },
          value: { min: 0.3, max: 0.8 }
        },
        shape: {
          type: "circle"
        },
        size: {
          value: 1
        }
      },
      
      polygon: {
        draw: {
          enable: true,
          stroke: {
            color: "#fff",
            opacity: 0.2,
            width: 1
          }
        },
        enable: true,
        move: {
          radius: 5
        },
        position: {
          x: 30,
          y: 10
        },
        inline: {
          arrangement: "equidistant"
        },
        scale: 1,
        type: "inline",
        url: "https://particles.js.org/images/google.svg"
      },
      
      background: {
        color: "#000000",
        image: "",
        position: "50% 50%",
        repeat: "no-repeat",
        size: "cover"
      }
    });
    
    console.log("✅ TSParticles učitan uspešno!");
  } catch (error) {
    console.error("❌ Greška pri učitavanju tsParticles:", error);
  }
});