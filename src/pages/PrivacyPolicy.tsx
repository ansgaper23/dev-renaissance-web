
import React from 'react';
import Navbar from '@/components/Navbar';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-cuevana-blue">Política de Privacidad</h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">1. Información que Recopilamos</h2>
              <p className="text-cuevana-white/90 leading-relaxed mb-4">
                En CineExplorer, recopilamos diferentes tipos de información para brindarle un mejor servicio:
              </p>
              <ul className="list-disc list-inside text-cuevana-white/90 space-y-2 ml-4">
                <li><strong>Información personal:</strong> Nombre, dirección de correo electrónico, y otros datos que nos proporcione voluntariamente</li>
                <li><strong>Información de uso:</strong> Cómo interactúa con nuestro servicio, incluyendo páginas visitadas y contenido visualizado</li>
                <li><strong>Información técnica:</strong> Dirección IP, tipo de navegador, sistema operativo, y datos del dispositivo</li>
                <li><strong>Cookies:</strong> Pequeños archivos que se almacenan en su dispositivo para mejorar su experiencia</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">2. Cómo Utilizamos su Información</h2>
              <p className="text-cuevana-white/90 leading-relaxed mb-4">
                Utilizamos la información recopilada para:
              </p>
              <ul className="list-disc list-inside text-cuevana-white/90 space-y-2 ml-4">
                <li>Proporcionar y mantener nuestro servicio</li>
                <li>Personalizar su experiencia y recomendaciones de contenido</li>
                <li>Comunicarnos con usted sobre el servicio</li>
                <li>Mejorar y optimizar nuestro sitio web</li>
                <li>Prevenir fraudes y garantizar la seguridad</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">3. Compartir Información</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                No vendemos, intercambiamos ni transferimos su información personal a terceros sin su consentimiento, excepto en las siguientes circunstancias: cuando sea requerido por ley, para proteger nuestros derechos legales, o con proveedores de servicios de confianza que nos ayudan a operar nuestro sitio web bajo estrictos acuerdos de confidencialidad.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">4. Seguridad de los Datos</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                Implementamos medidas de seguridad apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción. Esto incluye revisiones internas de nuestras prácticas de recopilación, almacenamiento y procesamiento de datos.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">5. Cookies y Tecnologías Similares</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web, recordar sus preferencias y analizar el tráfico del sitio. Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad del sitio.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">6. Sus Derechos</h2>
              <p className="text-cuevana-white/90 leading-relaxed mb-4">
                Usted tiene derecho a:
              </p>
              <ul className="list-disc list-inside text-cuevana-white/90 space-y-2 ml-4">
                <li>Acceder a la información personal que tenemos sobre usted</li>
                <li>Solicitar la corrección de información inexacta</li>
                <li>Solicitar la eliminación de su información personal</li>
                <li>Objetar el procesamiento de su información personal</li>
                <li>Solicitar la portabilidad de sus datos</li>
                <li>Retirar su consentimiento en cualquier momento</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">7. Retención de Datos</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                Conservamos su información personal solo durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera o permita un período de retención más largo.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">8. Cambios en esta Política</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos sobre cualquier cambio publicando la nueva Política de Privacidad en esta página y actualizando la fecha de "última actualización".
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">9. Contacto</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                Si tiene preguntas sobre esta Política de Privacidad o sobre nuestras prácticas de datos, puede contactarnos a través de nuestros canales oficiales de atención al cliente.
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

export default PrivacyPolicy;
