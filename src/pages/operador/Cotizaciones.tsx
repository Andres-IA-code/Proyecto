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
          console.log('❌ Nombre del dador vacío');
          setPhone('No disponible');
          setLoading(false);
          return;
        }

        const nombreCompleto = dadorName.trim();
        const partes = nombreCompleto.split(' ');

        let usuarios: any[] = [];
        let error: any = null;

        // Estrategia 1: Búsqueda por nombre y apellido separados (PRIORITARIA)
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

          console.log('📋 Resultados estrategia 1 (sin filtros):', usuarios1);

          if (error1) {
            console.error('❌ Error en estrategia 1:', error1);
          } else if (usuarios1 && usuarios1.length > 0) {
            // Filtrar teléfonos válidos después de la consulta
            const usuariosConTelefono = usuarios1.filter(u => 
              u.Telefono && 
              u.Telefono.trim() !== '' && 
              u.Telefono.trim() !== '+54 9' && 
              u.Telefono.trim() !== '+54 9 ' &&
              u.Telefono.length > 10 // Un teléfono válido debe tener más de 10 caracteres
            );
            
            console.log('📋 Usuarios con teléfono válido:', usuariosConTelefono);
            
            if (usuariosConTelefono.length > 0) {
              usuarios = usuariosConTelefono;
            }
          }
        }

        // Estrategia 2: Búsqueda exacta por nombre completo
        if (usuarios.length === 0) {
          console.log('📞 Estrategia 2: Búsqueda exacta por nombre completo');
          const { data: usuarios2, error: error2 } = await supabase
            .from('Usuarios')
            .select('id_Usuario, Telefono, Nombre, Apellido, Tipo_Persona, Rol_Operativo')
            .eq('Nombre', nombreCompleto);

          console.log('📋 Resultados estrategia 2:', usuarios2);

          if (usuarios2 && usuarios2.length > 0) {
            const usuariosConTelefono = usuarios2.filter(u => 
              u.Telefono && 
              u.Telefono.trim() !== '' && 
              u.Telefono.trim() !== '+54 9' && 
              u.Telefono.trim() !== '+54 9 ' &&
              u.Telefono.length > 10
            );
            
            if (usuariosConTelefono.length > 0) {
              usuarios = usuariosConTelefono;
            }
          }

          error = error2;
        }

        // Estrategia 3: Búsqueda flexible con ILIKE
        if (usuarios.length === 0) {
          console.log('📞 Estrategia 3: Búsqueda flexible con ILIKE');
          const { data: usuarios3, error: error3 } = await supabase
            .from('Usuarios')
            .select('id_Usuario, Telefono, Nombre, Apellido, Tipo_Persona, Rol_Operativo')
            .or(`Nombre.ilike.%${nombreCompleto}%,Apellido.ilike.%${nombreCompleto}%`);

          console.log('📋 Resultados estrategia 3:', usuarios3);

          if (usuarios3 && usuarios3.length > 0) {
            const usuariosConTelefono = usuarios3.filter(u => 
              u.Telefono && 
              u.Telefono.trim() !== '' && 
              u.Telefono.trim() !== '+54 9' && 
              u.Telefono.trim() !== '+54 9 ' &&
              u.Telefono.length > 10
            );
            
            if (usuariosConTelefono.length > 0) {
              usuarios = usuariosConTelefono;
            }
          }

          error = error3;
        }

        if (error) {
          console.error('❌ Error buscando teléfono:', error);
          setPhone('Error al buscar');
          setLoading(false);
          return;
        }

        if (usuarios.length === 0) {
          console.log('❌ No se encontró usuario con teléfono para:', dadorName);
          
          // Diagnóstico: buscar si existe el usuario sin filtrar por teléfono
          const { data: allUsers } = await supabase
            .from('Usuarios')
            .select('id_Usuario, Telefono, Nombre, Apellido, Tipo_Persona, Rol_Operativo')
            .or(`Nombre.ilike.%${nombreCompleto}%,Apellido.ilike.%${nombreCompleto}%`);
          
          console.log('🔍 Usuarios encontrados (sin filtro de teléfono):', allUsers);
          
          if (allUsers && allUsers.length > 0) {
            const userWithBadPhone = allUsers[0];
            console.log('⚠️ Usuario encontrado pero con teléfono inválido:', userWithBadPhone.Telefono);
            setPhone('Teléfono no válido');
          } else {
            setPhone('No registrado');
          }
          
          setLoading(false);
          return;
        }

        // Priorizar usuarios con rol "dador"
        const dadorUsers = usuarios.filter(u => 
          u.Rol_Operativo?.toLowerCase().includes('dador')
        );

        const selectedUser = dadorUsers.length > 0 ? dadorUsers[0] : usuarios[0];
        
        console.log('✅ Usuario seleccionado:', selectedUser);
        console.log('📞 Teléfono encontrado:', selectedUser.Telefono);

        setPhone(selectedUser.Telefono || 'No registrado');

      } catch (error) {
        console.error('❌ Error inesperado buscando teléfono:', error);
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

  if (!phone || 
      phone === 'No registrado' || 
      phone === 'Error' || 
      phone === 'Error al buscar' ||
      phone === 'Teléfono no válido') {
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