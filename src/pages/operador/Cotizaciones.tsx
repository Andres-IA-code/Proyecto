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

        // PASO 1: Debug inicial - ver todos los usuarios disponibles
        console.log('📊 DEBUG: Consultando usuarios disponibles...');
        const { data: allUsersDebug } = await supabase
          .from('Usuarios')
          .select('id_Usuario, Telefono, Nombre, Apellido, Tipo_Persona, Rol_Operativo')
          .limit(10); // Solo primeros 10 para no saturar el log

        console.log('👥 Usuarios disponibles (muestra):', allUsersDebug);
        console.log('🔍 Buscando coincidencias con:', dadorName.trim());

        // PASO 2: Búsqueda por coincidencias en nombre y apellido
        const nombreLimpio = dadorName.trim();
        const partes = nombreLimpio.split(' ');
        
        console.log('🧩 Partes del nombre:', partes);

        // Estrategia 1: Búsqueda exacta por nombre completo
        console.log('📞 Estrategia 1: Búsqueda exacta por nombre completo');
        let { data: usuarios, error } = await supabase
          .from('Usuarios')
          .select('id_Usuario, Telefono, Nombre, Apellido, Tipo_Persona, Rol_Operativo')
          .eq('Nombre', nombreLimpio)
          .not('Telefono', 'is', null)
          .neq('Telefono', '')
          .neq('Telefono', '+54 9 ');

        console.log('📋 Resultados estrategia 1:', usuarios);

        // Estrategia 2: Búsqueda por nombre y apellido separados
        if ((!usuarios || usuarios.length === 0) && partes.length >= 2) {
          console.log('📞 Estrategia 2: Búsqueda por nombre y apellido separados');
          const firstName = partes[0];
          const lastName = partes.slice(1).join(' ');
          
          console.log('🔍 Buscando nombre:', firstName, 'apellido:', lastName);
          
          const { data: usuarios2, error: error2 } = await supabase
            .from('Usuarios')
            .select('id_Usuario, Telefono, Nombre, Apellido, Tipo_Persona, Rol_Operativo')
            .eq('Nombre', firstName)
            .eq('Apellido', lastName)
            .not('Telefono', 'is', null)
            .neq('Telefono', '')
            .neq('Telefono', '+54 9 ');

          console.log('📋 Resultados estrategia 2:', usuarios2);
          usuarios = usuarios2;
          error = error2;
        }

        // Estrategia 3: Búsqueda flexible con ILIKE
        if (!usuarios || usuarios.length === 0) {
          console.log('📞 Estrategia 3: Búsqueda flexible con ILIKE');
          const { data: usuarios3, error: error3 } = await supabase
            .from('Usuarios')
            .select('id_Usuario, Telefono, Nombre, Apellido, Tipo_Persona, Rol_Operativo')
            .or(`Nombre.ilike.%${nombreLimpio}%,Apellido.ilike.%${nombreLimpio}%`)
            .not('Telefono', 'is', null)
            .neq('Telefono', '')
            .neq('Telefono', '+54 9 ');

          console.log('📋 Resultados estrategia 3:', usuarios3);
          usuarios = usuarios3;
          error = error3;
        }

        // Estrategia 4: Búsqueda ultra flexible (cada parte del nombre)
        if ((!usuarios || usuarios.length === 0) && partes.length > 1) {
          console.log('📞 Estrategia 4: Búsqueda por cada parte del nombre');
          
          for (const parte of partes) {
            if (parte.length >= 3) { // Solo partes de al menos 3 caracteres
              const { data: usuariosParte } = await supabase
                .from('Usuarios')
                .select('id_Usuario, Telefono, Nombre, Apellido, Tipo_Persona, Rol_Operativo')
                .or(`Nombre.ilike.%${parte}%,Apellido.ilike.%${parte}%`)
                .not('Telefono', 'is', null)
                .neq('Telefono', '')
                .neq('Telefono', '+54 9 ');

              console.log(`🔍 Buscando parte "${parte}":`, usuariosParte);
              
              if (usuariosParte && usuariosParte.length > 0) {
                usuarios = usuariosParte;
                break;
              }
            }
          }
        }

        // Estrategia 5: Búsqueda sin filtro de teléfono (para diagnóstico)
        if (!usuarios || usuarios.length === 0) {
          console.log('📞 Estrategia 5: Búsqueda sin filtro de teléfono (diagnóstico)');
          const { data: usuariosSinFiltro } = await supabase
            .from('Usuarios')
            .select('id_Usuario, Telefono, Nombre, Apellido, Tipo_Persona, Rol_Operativo')
            .or(`Nombre.ilike.%${nombreLimpio}%,Apellido.ilike.%${nombreLimpio}%`);

          console.log('📋 Usuarios encontrados sin filtro de teléfono:', usuariosSinFiltro);
          
          // Si encuentra usuarios pero sin teléfono válido
          if (usuariosSinFiltro && usuariosSinFiltro.length > 0) {
            console.log('⚠️ Se encontraron usuarios pero sin teléfonos válidos');
            setPhone('Sin teléfono registrado');
            setLoading(false);
            return;
          }
        }

        if (error) {
          console.error('❌ Error buscando teléfono:', error);
          setPhone('Error al buscar');
          setLoading(false);
          return;
        }

        if (usuarios.length === 0) {
          console.log('❌ No se encontró usuario con teléfono para:', dadorName);
          setPhone('Usuario no encontrado');
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

  if (!phone || phone === 'No registrado' || phone === 'Error' || 
      phone === 'Error al buscar' || phone === 'Usuario no encontrado' ||
      phone === 'Sin teléfono registrado') {
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