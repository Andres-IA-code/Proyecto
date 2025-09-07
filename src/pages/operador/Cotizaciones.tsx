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

        // Verificar si dadorName está definido y no es null/undefined/vacío
        if (!dadorName || dadorName === 'undefined' || dadorName === 'null' || dadorName.trim() === '') {
          console.log('❌ Nombre del dador vacío o undefined:', dadorName);
          setPhone('Nombre no disponible');
          setLoading(false);
          return;
        }

        const nombreCompleto = dadorName.trim();
        const partes = nombreCompleto.split(' ');

        let usuarios: any[] = [];

        // Estrategia 1: Búsqueda por nombre y apellido separados
        if (partes.length >= 2) {
          console.log('📞 Estrategia 1: Búsqueda por nombre y apellido separados');
          const firstName = partes[0];
          const lastName = partes.slice(1).join(' ');
          
          console.log('🔍 Buscando nombre:', firstName, 'apellido:', lastName);
          
          const { data: usuarios1, error: error1 } = await supabase
            .from('Usuarios')
            .select('id_Usuario, Telefono, Nombre, Apellido, Tipo_Persona, Rol_Operativo')
            .eq('Nombre', firstName)
            .eq('Apellido', lastName);

          console.log('📋 Resultados estrategia 1:', usuarios1);

          if (error1) {
            console.error('❌ Error en estrategia 1:', error1);
          } else if (usuarios1 && usuarios1.length > 0) {
            // Filtrar teléfonos válidos
            const usuariosConTelefono = usuarios1.filter(u => 
              u.Telefono && 
              u.Telefono.trim() !== '' && 
              u.Telefono.trim() !== '+54 9' && 
              u.Telefono.trim() !== '+54 9 ' &&
              u.Telefono.length > 10
            );
            
            console.log('📋 Usuarios con teléfono válido:', usuariosConTelefono);
            
            if (usuariosConTelefono.length > 0) {
              usuarios = usuariosConTelefono;
            }
          }
        }

        // Si encontró usuarios
        if (usuarios.length > 0) {
          const selectedUser = usuarios[0];
          console.log('✅ Usuario seleccionado:', selectedUser);
          console.log('📞 Teléfono encontrado:', selectedUser.Telefono);
          setPhone(selectedUser.Telefono);
        } else {
          console.log('❌ No se encontró usuario con teléfono para:', dadorName);
          setPhone('No encontrado');
        }

      } catch (error) {
        console.error('❌ Error inesperado buscando teléfono:', error);
        setPhone('Error');
      } finally {
        setLoading(false);
      }
    };

    findPhone();
  }, [dadorName]);

  // Mostrar estado de carga
  if (loading) {
    return <span className="text-gray-500">Buscando...</span>;
  }

  // Mostrar diferentes estados
  if (phone === 'Nombre no disponible') {
    return <span className="text-orange-500">Nombre no disponible</span>;
  }

  if (!phone || phone === 'No encontrado' || phone === 'Error') {
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

export default PhoneDisplay;