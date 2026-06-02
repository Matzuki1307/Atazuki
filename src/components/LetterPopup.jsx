import { memo } from "react";
import exitButton from "../assets/Atapaz/ExitButton.png";

const CARTA_TEXT = `Mi momorrita linda,

A veces me pongo a pensar en todo lo que ha pasado entre nosotros y me cuesta creer que una historia que empezó hace tres años hoy sea la realidad más bonita que tengo. (Pero 3 años me tocó esperar)

Desde que llegaste a mi vida hubo algo en ti que me atrapó. Tal vez fue tu forma de ser, tu manera tan única de decir las cosas (Si era autista), la luz que llevas contigo, o simplemente esa esencia tan tuya que hace imposible no quererte. Lo que sí sé con total certeza es que, desde entonces, mi corazón te eligió incluso antes de que yo entendiera por completo lo que estaba sintiendo. (Remitirse al documento "Cómo me empezaste a gustar" de Matzuuki)

Durante mucho tiempo te admiré, te quise en silencio y soñé con la posibilidad de que algún día nuestros caminos se unieran de verdad (Ya mucho jiji bromis). Y ahora, después de todo ese tiempo, poder decir que desde aquel 16 de noviembre eres mi novia sigue sintiéndose como uno de los regalos más hermosos que me ha dado la vida.

Mi amorcito, tú eres la mujer más increíble que he conocido. No solo por lo hermosa que eres, sino por la forma en la que piensas, por tu inteligencia, por tu humor, por tu fuerza, por tu forma de hacer que todo a tu alrededor tenga más color. (Aunque compartas neuronas con Dewey)

Quiero que sepas algo que quizás no te digo lo suficiente: gracias a ti me atreví a creer más en mí. Gracias a ti encontré más fuerza para perseguir mi sueño de convertirme en frikiraper(Ahora freeker), para tomar en serio eso que vive dentro de mí y luchar por hacerlo realidad. De alguna forma, tu amor me recordó que los sueños no están hechos para guardarse, sino para perseguirse con todo el corazón. (Por eso nunca me rendí contigo)

Y si hoy me preguntas qué sueño cuando pienso en el futuro, mi respuesta siempre te va a incluir.

Sueño con el día en que podamos mirar hacia atrás y sonreír al recordar todo lo que vivimos para llegar hasta ahí (3 años *cof cof*). Sueño con verte vestida de blanco. Sueño con tomarte de la mano frente a todos y prometerte que voy a elegirte cada día. Sueño con casarme contigo, construir una vida a tu lado, acompañarte en cada etapa, reír contigo, crecer contigo y seguir enamorándome de ti incluso cuando pasen los años.

Porque si algo tengo claro, es que no quiero imaginar mi vida sin ti.

Gracias por existir.
Gracias por llegar a mi vida.
Gracias por quererme.
Gracias por hacerme sentir capaz de tantas cosas.
Gracias por ser tu.

Te amo con una intensidad que a veces ni yo mismo sé explicar, y si algo tengo seguro es que cada día encuentro una razón nueva para amarte todavía más.

Con todo mi corazón,

Momorrito`;

const MINI_LETTERS = {
  p: { label: "P", title: "P - Perfecta para mí", text: "Si alguien me preguntara cómo se ve una persona increíble, pensaría en ti. No porque seas perfecta de una manera irreal, sino porque eres perfectamente tú, y eso es justo lo que más amo de ti, aunque no te funcione ni unita." },
  a: { label: "A", title: "A - Admiración", text: "Admiro tu inteligencia, tu forma de pensar, tus rayadas, tu humor y esa sinceridad tan tuya. Me inspiras a ser mejor y a luchar por mis sueños, incluso cuando yo mismo dudo." },
  u: { label: "U", title: "U - Única", text: "Eres una persona irrepetible, de esas que aparecen una sola vez en la vida. Y desde que llegaste a la mía, supe que jamás querría dejarte ir." },
  l: { label: "L", title: "L - Luz", text: "Llegaste a iluminar mi vida de una forma que no sabía que necesitaba. Contigo todo tiene más sentido, más color y más ganas de seguir adelante. Te amo mi momorrita <3" },
  a2: { label: "A", title: "A - Amor", text: "Eres el amor más bonito que he conocido y la persona con la que sueño mi futuro. Algún día quiero mirarte al altar y saber que todas mis decisiones me llevaron a ti." },
};

const LETTER_KEYS = ["p", "a", "u", "l", "a2"];

const LetterPopup = memo(function LetterPopup({
  show,
  popupView,
  dontShowAgain,
  currentTheme,
  pixelButtonStyle,
  onClose,
  onSelectLetter,
  onBackToSelector,
  onContinue,
  onDontShowAgainChange,
}) {
  if (!show) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 50,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "80%",
          height: "80%",
          background: currentTheme.panel,
          border: "2px solid #8fa4ff",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "'Courier New', monospace",
          color: "#dbe2ff",
          position: "relative",
        }}
      >
        <img
          src={exitButton}
          onClick={onClose}
          style={{
            position: "absolute",
            top: "6px",
            right: "8px",
            zIndex: 10,
            width: "18px",
            cursor: "pointer",
            WebkitAppRegion: "no-drag",
          }}
        />

        {popupView === "selector" && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: currentTheme.progress,
              }}
            >
              Cartas para ti
            </div>
            <button
              onClick={() => onSelectLetter("momorrita")}
              style={{
                ...pixelButtonStyle,
                fontSize: "14px",
                padding: "10px 24px",
              }}
            >
              Momorrita
            </button>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              {LETTER_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => onSelectLetter(key)}
                  style={{
                    ...pixelButtonStyle,
                    fontSize: "18px",
                    width: "48px",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {MINI_LETTERS[key].label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: "10px", opacity: 0.6, marginTop: "4px" }}>
              Toca una letra para leer tu carta
            </div>
          </div>
        )}

        {popupView === "momorrita" && (
          <>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "14px",
                fontSize: "10.5px",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
                textAlign: "left",
              }}
            >
              {CARTA_TEXT}
            </div>
            <div
              style={{
                padding: "8px 14px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                borderTop: "1px solid #2a3d8a",
              }}
            >
              <button onClick={onContinue} style={pixelButtonStyle}>
                Continuar
              </button>
              <label
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: "10px",
                  color: "#b0baff",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => onDontShowAgainChange(e.target.checked)}
                  style={{ accentColor: "#8fa4ff", cursor: "pointer" }}
                />
                No volver a mostrar
              </label>
            </div>
          </>
        )}

        {LETTER_KEYS.includes(popupView) && (
          <>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                fontSize: "11px",
                lineHeight: "1.7",
                whiteSpace: "pre-wrap",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: currentTheme.progress,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {MINI_LETTERS[popupView].title}
              </div>
              <div>{MINI_LETTERS[popupView].text}</div>
            </div>
            <div
              style={{
                padding: "8px 14px 12px",
                display: "flex",
                justifyContent: "center",
                borderTop: "1px solid #2a3d8a",
              }}
            >
              <button onClick={onBackToSelector} style={pixelButtonStyle}>
                Continuar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default LetterPopup;
