
import React from 'react';
import Navbar from '@/components/Navbar';

const DMCANotice = () => {
  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-cuevana-blue">Aviso DMCA</h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">Descargo de Responsabilidad</h2>
              <div className="bg-cuevana-gray-100 border-l-4 border-cuevana-blue p-6 rounded-r-lg mb-6">
                <p className="text-cuevana-white font-semibold text-lg">
                  🚨 IMPORTANTE: Este sitio NO aloja ningún video ni contenido audiovisual en nuestros servidores.
                </p>
                <p className="text-cuevana-white/90 mt-2">
                  Todo el contenido mostrado proviene de fuentes públicas y enlaces externos. CineExplorer actúa únicamente como un agregador de enlaces y no es responsable del contenido alojado en sitios de terceros.
                </p>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">Política de Derechos de Autor</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                CineExplorer respeta los derechos de propiedad intelectual y espera que nuestros usuarios hagan lo mismo. Respondemos a avisos de presunta infracción de derechos de autor que cumplan con la Ley de Derechos de Autor del Milenio Digital (DMCA).
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">Cómo Presentar una Notificación DMCA</h2>
              <p className="text-cuevana-white/90 leading-relaxed mb-4">
                Si cree que su trabajo protegido por derechos de autor ha sido copiado de una manera que constituye una infracción de derechos de autor, puede notificarnos proporcionando la siguiente información:
              </p>
              <ul className="list-disc list-inside text-cuevana-white/90 space-y-2 ml-4">
                <li>Una firma física o electrónica de la persona autorizada para actuar en nombre del propietario de los derechos de autor</li>
                <li>Identificación del trabajo protegido por derechos de autor que se afirma ha sido infringido</li>
                <li>Identificación del material que se afirma es infractor y información suficiente para localizarlo</li>
                <li>Información de contacto del denunciante (dirección, teléfono, email)</li>
                <li>Una declaración de que el denunciante cree de buena fe que el uso no está autorizado</li>
                <li>Una declaración bajo pena de perjurio de que la información es exacta y que el denunciante está autorizado</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">Agente Designado para Notificaciones DMCA</h2>
              <div className="bg-cuevana-gray-100 p-6 rounded-lg">
                <p className="text-cuevana-white/90 leading-relaxed">
                  <strong>Nombre:</strong> Agente de Derechos de Autor de CineExplorer<br/>
                  <strong>Email:</strong> dmca@cineexplorer.com<br/>
                  <strong>Dirección postal:</strong> [Dirección física de la empresa]<br/>
                  <strong>Teléfono:</strong> [Número de teléfono de contacto]
                </p>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">Contranotificación</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                Si cree que el material que fue eliminado o al que se deshabilitó el acceso no es infractor, o que tiene autorización del propietario de los derechos de autor para usar el material, puede enviar una contranotificación con la información requerida por la DMCA.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">Política de Infractores Reincidentes</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                CineExplorer terminará, en circunstancias apropiadas, las cuentas de usuarios que son infractores reincidentes de derechos de autor.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">Limitación de Responsabilidad</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                CineExplorer no puede ser responsabilizado por el contenido alojado en sitios web de terceros. Nuestro servicio se limita a proporcionar enlaces a contenido disponible públicamente en Internet. Los usuarios acceden a este contenido bajo su propia responsabilidad.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-gold">Tiempo de Respuesta</h2>
              <p className="text-cuevana-white/90 leading-relaxed">
                Procesamos todas las notificaciones DMCA válidas dentro de las 24-48 horas siguientes a su recepción. Una vez verificada la validez de la notificación, procederemos a eliminar o deshabilitar el acceso al material en cuestión.
              </p>
            </section>
            
            <div className="bg-cuevana-gray-100 border border-cuevana-gray-200 p-6 rounded-lg mt-8">
              <h3 className="text-lg font-semibold mb-2 text-cuevana-blue">Nota Importante</h3>
              <p className="text-cuevana-white/90">
                Las notificaciones DMCA falsas pueden estar sujetas a responsabilidad por daños bajo la Sección 512(f) de la DMCA. Asegúrese de que su reclamo sea válido antes de enviar una notificación.
              </p>
            </div>
            
            <p className="text-cuevana-white/70 text-sm mt-8 pt-8 border-t border-cuevana-gray-200">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DMCANotice;
