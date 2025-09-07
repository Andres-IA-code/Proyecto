import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface PhoneDisplayProps {
  dadorName: string;
}

const PhoneDisplay: React.FC<PhoneDisplayProps> = ({ dadorName }) => {
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findPhone = async () => {
      try {
        setLoading(true);
        console.log('🔍 Buscando teléfono para dador:', dadorName);

        if (!dadorName || dadorName.trim() === '') {
          setPhone('No disponible');
          setLoading(false);
          return;
        }

        const nombreCompleto = dadorName.trim();
        const partes = nombreCompleto.split(' ');

        // Estrategia principal: nombre y apellido separados
        if (partes.length >= 2) {
          const nombre = partes[0];
          const apellido = partes.slice(1).join(' ');
          
          console.log('🔍 Buscando:', { nombre, apellido });
          
          const { data: usuario } = await supabase
            .from('Usuarios')
            .select('Telefono')
            .eq('Nombre', nombre)
            .eq('Apellido', apellido)
            .not('Telefono', 'is', null)
            .neq('Telefono', '')
            .neq('Telefono', '+54 9 ')
            .limit(1)
            .single();

          if (usuario?.Telefono) {
            console.log('✅ Teléfono encontrado:', usuario.Telefono);
            setPhone(usuario.Telefono);
            setLoading(false);
            return;
          }
        }

        // Estrategia alternativa: buscar por cualquier coincidencia
        const { data: usuarioAlternativo } = await supabase
          .from('Usuarios')
          .select('Telefono, Nombre, Apellido')
          .or(`Nombre.ilike.%${partes[0]}%,Apellido.ilike.%${partes[partes.length - 1]}%`)
          .not('Telefono', 'is', null)
          .neq('Telefono', '')
          .neq('Telefono', '+54 9 ')
          .limit(1)
          .single();

        if (usuarioAlternativo?.Telefono) {
          console.log('✅ Teléfono encontrado (alternativo):', usuarioAlternativo.Telefono);
          setPhone(usuarioAlternativo.Telefono);
        } else {
          console.log('❌ No se encontró teléfono para:', dadorName);
          setPhone('No registrado');
        }

      } catch (error) {
        console.error('❌ Error buscando teléfono:', error);
        setPhone('Error');
      } finally {
        setLoading(false);
      }
    };

    findPhone();
  }, [dadorName]);

  if (loading) {
    return <span className="text-gray-500">Buscando...</span>;
  }

  if (!phone || phone === 'No registrado' || phone === 'Error') {
    return <span className="text-gray-500">{phone || 'No disponible'}</span>;
  }

  return (
    <a 
      href={`tel:${phone}`} 
      className="text-blue-600 hover:text-blue-800 underline"
    >
      {phone}
    </a>
  );
};

// Componente principal de la página de Cotizaciones
const Cotizaciones: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cotizaciones</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Página de cotizaciones en desarrollo...</p>
      </div>
    </div>
  );
};

export default Cotizaciones;