import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos del Servicio — OneClickIA",
  description: "Términos del servicio de OneClickIA.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12">
      <header className="border-b border-sand pb-4">
        <Link href="/" className="text-sm text-orange hover:text-orange/80">
          ← OneClickIA
        </Link>
        <h1 className="mt-2 text-3xl font-semibold text-ink">
          Términos del Servicio
        </h1>
        <p className="mt-1 text-sm text-muted">Última actualización: 2026</p>
      </header>

      <section className="flex flex-col gap-4 text-sm leading-relaxed text-charcoal">
        <p>
          Al usar <strong>OneClickIA</strong> aceptas estos términos. Léelos con
          atención.
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">1. El servicio</h2>
        <p>
          OneClickIA es una plataforma SaaS que automatiza la creación de
          campañas publicitarias usando inteligencia artificial. Permite
          generar copy e imágenes para anuncios, gestionar campañas en
          plataformas como Meta Ads, y analizar rendimiento.
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">
          2. Uso aceptable
        </h2>
        <p>
          Te comprometes a usar OneClickIA solo para fines legales. No puedes
          generar contenido que viole derechos de autor, sea engañoso, ilegal,
          o viole las políticas de las plataformas publicitarias conectadas.
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">
          3. Tu contenido
        </h2>
        <p>
          Mantienes todos los derechos sobre el contenido que subes (logos,
          imágenes, copy de tu marca). Nos otorgas una licencia limitada para
          procesarlo y generar variaciones de anuncios para tu marca.
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">
          4. Integraciones con terceros
        </h2>
        <p>
          OneClickIA usa servicios de terceros (Meta Ads API, Google Gemini,
          Foreplay). El uso de esos servicios está también sujeto a sus
          propios términos. Eres responsable de cumplir las políticas
          publicitarias de cada plataforma donde publiques anuncios.
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">
          5. Costo y facturación
        </h2>
        <p>
          Algunas funcionalidades pueden requerir suscripción de pago. Los
          precios y condiciones se publicarán antes de cobrar. Puedes cancelar
          tu suscripción en cualquier momento.
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">
          6. Cancelación
        </h2>
        <p>
          Puedes eliminar tu cuenta en cualquier momento. Eliminaremos tus
          datos según describe nuestra{" "}
          <Link href="/privacy" className="text-orange hover:text-orange/80">
            Política de Privacidad
          </Link>
          .
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">
          7. Limitación de responsabilidad
        </h2>
        <p>
          OneClickIA se provee "tal cual". No garantizamos resultados
          específicos de las campañas publicitarias. El rendimiento de los
          anuncios depende de muchos factores fuera de nuestro control.
        </p>

        <h2 className="mt-4 text-xl font-semibold text-ink">
          8. Contacto
        </h2>
        <p>
          Para preguntas sobre estos términos:{" "}
          <a
            href="mailto:hugocruz11@hotmail.com"
            className="text-orange hover:text-orange/80"
          >
            hugocruz11@hotmail.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
