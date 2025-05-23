
import React from 'react';
import Navbar from '@/components/Navbar';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-cuevana-blue">Términos de Servicio</h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">1. Aceptación de los Términos</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                Al acceder y utilizar CineExplorer, usted acepta cumplir con estos Términos de Servicio y todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, no debe utilizar este sitio web.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">2. Descripción del Servicio</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                CineExplorer es una plataforma de streaming que proporciona acceso a contenido audiovisual con los derechos de autor correspondientes. Todos los contenidos mostrados en esta plataforma cuentan con las licencias apropiadas para su distribución.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">3. Uso Aceptable</h2>
              <p className="text-cuevana-white/90 leading-relaxed mb-4">
                Usted se compromete a utilizar el servicio únicamente para fines legales y de acuerdo con estos términos. Está prohibido:
              </p>
              <ul className="list-disc list-inside text-cuevana-white/90 space-y-2 ml-4">
                <li>Usar el servicio para cualquier propósito ilegal o no autorizado</li>
                <li>Intentar obtener acceso no autorizado a cualquier parte del servicio</li>
                <li>Transmitir virus, malware o cualquier código malicioso</li>
                <li>Reproducir, distribuir o modificar el contenido sin autorización</li>
                <li>Crear cuentas falsas o proporcionar información falsa</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">4. Derechos de Autor</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                Todo el contenido disponible en CineExplorer está protegido por derechos de autor y otras leyes de propiedad intelectual. CineExplorer posee las licencias necesarias para la distribución de todo el contenido ofrecido en la plataforma.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">5. Cuentas de Usuario</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                Para acceder a ciertas funciones del servicio, puede necesitar crear una cuenta. Usted es responsable de mantener la confidencialidad de su cuenta y contraseña, y acepta la responsabilidad por todas las actividades que ocurran bajo su cuenta.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">6. Limitación de Responsabilidad</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                CineExplorer no será responsable por daños directos, indirectos, incidentales, especiales o consecuentes que resulten del uso o la incapacidad de usar el servicio, incluso si CineExplorer ha sido advertido de la posibilidad de tales daños.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">7. Modificaciones del Servicio</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                CineExplorer se reserva el derecho de modificar o discontinuar el servicio en cualquier momento sin previo aviso. No seremos responsables ante usted o cualquier tercero por cualquier modificación, suspensión o discontinuación del servicio.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">8. Ley Aplicable</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                Estos términos se regirán e interpretarán de acuerdo con las leyes del país donde opera CineExplorer, sin tener en cuenta los principios de conflicto de leyes.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">9. Contacto</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos a través de nuestros canales oficiales de atención al cliente.
              </p>
            </section>
            
            <p className="text-cuevana-white/70 text-sm mt-8 pt-8 border-t border-cuevana-gray-200">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
