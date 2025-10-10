import { useEffect } from 'react';
import { supabase, createUserProfile } from '../lib/supabase';

const AuthListener = () => {
  useEffect(() => {
    console.log('🎧 AuthListener iniciado');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email);
        
        // Solo procesar eventos de registro (SIGNED_UP)
        if (event === 'SIGNED_UP' && session?.user) {
          try {
            console.log('📝 Nuevo usuario registrado:', session.user.email);
            console.log('📧 Email confirmado:', session.user.email_confirmed_at ? 'SÍ' : 'NO');
            console.log('📦 Metadata:', session.user.user_metadata);
            
            // Solo procesar si el email está confirmado
            if (!session.user.email_confirmed_at) {
              console.log('⏳ Email no confirmado, esperando verificación...');
              return;
            }
            
            // Verificar si ya existe un perfil para este usuario
            const { data: existingProfile, error: profileError } = await supabase
              .from('Usuarios')
              .select('id_Usuario')
              .eq('auth_user_id', session.user.id)
              .maybeSingle();

            console.log('🔍 Búsqueda de perfil:', { existingProfile, profileError });

            if (profileError) {
              console.error('❌ Error checking existing profile:', profileError);
              return;
            }

            // Si no existe perfil, intentar crearlo
            if (!existingProfile) {
              console.log('📝 No existe perfil, intentando crear...');
              
              // Verificar si tiene datos en metadata
              if (session.user.user_metadata?.userData) {
                console.log('💾 Datos encontrados en metadata, creando perfil...');
                console.log('📋 Datos a insertar:', session.user.user_metadata.userData);
                
                const profile = await createUserProfile(session.user);
                console.log('✅ Perfil creado exitosamente:', profile);
              } else {
                console.log('⚠️ No hay datos en metadata. Creando perfil básico...');
                
                // Crear perfil básico aunque no haya metadata
                const basicUserData = {
                  Nombre: session.user.email?.split('@')[0] || 'Usuario',
                  Correo: session.user.email,
                  Tipo_Persona: 'Física',
                  Rol_Operativo: 'dador'
                };
                
                const profile = await createUserProfile(session.user, basicUserData);
                console.log('✅ Perfil básico creado:', profile);
              }
            } else {
              console.log('✅ Perfil ya existe:', existingProfile);
            }
          } catch (error) {
            console.error('💥 Error en AuthListener:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 Usuario cerró sesión');
          // Limpiar localStorage cuando el usuario cierre sesión
          localStorage.removeItem('userSession');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        } else {
          console.log('ℹ️ Evento ignorado:', event);
        }
      }
    );

    return () => {
      console.log('🔌 AuthListener desconectado');
      subscription.unsubscribe();
    };
  }, []);

  return null;
};

export default AuthListener;