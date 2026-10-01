// Registro único dos plugins GSAP. Importe sempre daqui: `import { gsap, Flip } from "@/lib/gsap"`.
// Todos os plugins fazem parte do pacote público `gsap` (licença gratuita da GreenSock, inclusive uso comercial).
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    ScrollToPlugin,
    Flip,
    DrawSVGPlugin,
    MotionPathPlugin,
    CustomEase,
    SplitText,
  );
  // Curva oficial da BORA (--ease-enfase em boraassessoria.com): expo-out suave.
  CustomEase.create("bora", "0.16, 1, 0.3, 1");
  gsap.defaults({ ease: "bora", duration: 0.8 });
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export {
  CustomEase,
  DrawSVGPlugin,
  Flip,
  gsap,
  MotionPathPlugin,
  ScrollToPlugin,
  ScrollTrigger,
  SplitText,
  useGSAP,
};
