import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
const isSupabaseConfigured = () => {
  return supabaseUrl && 
         supabaseAnonKey && 
         supabaseUrl !== 'https://your-project-url.supabase.co' &&
         supabaseAnonKey !== 'your-anon-key' &&
         supabaseUrl.includes('.supabase.co');
};

// Create a fallback client even if not configured to prevent runtime errors
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables not found, using fallback configuration');
    // Return a mock client that will throw meaningful errors
    return {
      from: () => ({
        insert: () => Promise.reject(new Error('Base de datos no configurada. Por favor contacta al administrador.')),
        select: () => Promise.reject(new Error('Base de datos no configurada. Por favor contacta al administrador.')),
        update: () => Promise.reject(new Error('Base de datos no configurada. Por favor contacta al administrador.')),
        delete: () => Promise.reject(new Error('Base de datos no configurada. Por favor contacta al administrador.')),
      }),
      auth: {
        signUp: () => Promise.reject(new Error('Autenticación no configurada. Por favor contacta al administrador.')),
        signInWithPassword: () => Promise.reject(new Error('Autenticación no configurada. Por favor contacta al administrador.')),
        signOut: () => Promise.reject(new Error('Autenticación no configurada. Por favor contacta al administrador.')),
        getUser: () => Promise.reject(new Error('Autenticación no configurada. Por favor contacta al administrador.')),
        resetPasswordForEmail: () => Promise.reject(new Error('Autenticación no configurada. Por favor contacta al administrador.')),
        updateUser: () => Promise.reject(new Error('Autenticación no configurada. Por favor contacta al administrador.')),
        resend: () => Promise.reject(new Error('Autenticación no configurada. Por favor contacta al administrador.')),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      }
    };
  }
  
  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase not properly configured. Please update your .env file with valid Supabase credentials.');
    throw new Error('Base de datos no configurada correctamente. Por favor contacta al administrador.');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

// Database types based on the schema
export interface Usuario {
  id_Usuario?: number;
  Nombre: string;
  Apellido?: string;
  DNI?: number;
  Domicilio?: string;
  Numero?: number;
  Piso?: number;
  Departamento?: string;
  Localidad?: string;
  Tipo_Persona?: string;
  Rol_Operativo?: string;
  Correo?: string;
  Telefono?: string;
  auth_user_id?: string;
}

// Helper to get the correct URL based on environment
const getAppUrl = () => {
  // En desarrollo (localhost)
  if (window.location.hostname === 'localhost') {
    return window.location.origin;
  }
  // En bolt.new u otra plataforma
  return window.location.origin;
};

// Check if Supabase is properly configured before making requests
const checkSupabaseConfig = () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado correctamente. Por favor contacta al administrador del sistema para configurar la base de datos.');
  }
};

// Auth helper functions
export const signUp = async (email: string, password: string, userData: Omit<Usuario, 'id_Usuario' | 'auth_user_id'>) => {
  try {
    checkSupabaseConfig();
    
    console.log('🚀 Iniciando registro con Supabase Auth...');
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getAppUrl()}/login?verified=true`,
        data: {
          userData: userData
        }
      }
    });

    if (authError) {
      console.error('❌ Error en Supabase Auth:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario de autenticación');
    }

    console.log('✅ Usuario creado en Supabase Auth:', authData.user.id);
    console.log('📧 Email confirmado:', authData.user.email_confirmed_at ? 'SÍ' : 'NO');

    // Si el email está confirmado inmediatamente (desarrollo), crear el perfil ahora
    if (authData.user.email_confirmed_at) {
      console.log('📝 Email confirmado inmediatamente, creando perfil...');
      try {
        const profile = await createUserProfile(authData.user, userData);
        console.log('✅ Perfil creado inmediatamente:', profile);
        return { user: authData.user, profile };
      } catch (profileError) {
        console.error('❌ Error creando perfil inmediato:', profileError);
        // No lanzar error aquí, el perfil se creará cuando se confirme el email
      }
    }

    return { user: authData.user, profile: null };
  } catch (error) {
    console.error('💥 Error in signUp:', error);
    throw error;
  }
};

// New function to create user profile after email confirmation
export const createUserProfile = async (user: any, userData?: Omit<Usuario, 'id_Usuario' | 'auth_user_id'>) => {
  try {
    checkSupabaseConfig();
    
    console.log('📝 Creando perfil de usuario...');
    console.log('👤 Usuario:', user.id, user.email);
    
    const profileData = userData || user.user_metadata?.userData;
    
    if (!profileData) {
      throw new Error('No user data available for profile creation');
    }

    console.log('📋 Datos del perfil:', profileData);

    // Verificar si ya existe un perfil
    const { data: existingProfile, error: checkError } = await supabase
      .from('Usuarios')
      .select('id_Usuario')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error verificando perfil existente:', checkError);
      throw checkError;
    }

    if (existingProfile) {
      console.log('✅ Perfil ya existe:', existingProfile);
      return existingProfile;
    }

    // Crear nuevo perfil
    const { data: profile, error } = await supabase
      .from('Usuarios')
      .insert([{
        ...profileData,
        auth_user_id: user.id,
        Correo: user.email
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error insertando perfil:', error);
      throw error;
    }

    console.log('✅ Perfil creado exitosamente:', profile);
    return profile;
  } catch (error) {
    console.error('💥 Error creating user profile:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    checkSupabaseConfig();
    
    console.log('🔐 Iniciando sesión con:', email);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('❌ Error de autenticación:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No se pudo autenticar el usuario');
    }

    console.log('✅ Autenticación exitosa:', authData.user.id);

    // Buscar el perfil del usuario con reintentos
    let profileData = null;
    let retryCount = 0;
    const maxRetries = 5;

    while (!profileData && retryCount < maxRetries) {
      console.log(`🔍 Buscando perfil (intento ${retryCount + 1}/${maxRetries})...`);
      
      const { data, error: profileError } = await supabase
        .from('Usuarios')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Error consultando perfil:', profileError);
        throw new Error('Error al consultar el perfil del usuario');
      }

      if (data) {
        profileData = data;
        console.log('✅ Perfil encontrado:', profileData);
        break;
      }

      console.log('⚠️ Perfil no encontrado, intentando crear...');
      
      // Si no existe perfil, intentar crearlo con los datos del metadata
      if (authData.user.user_metadata?.userData) {
        try {
          profileData = await createUserProfile(authData.user);
          console.log('✅ Perfil creado durante login:', profileData);
          break;
        } catch (createError) {
          console.error('❌ Error creando perfil durante login:', createError);
        }
      }

      retryCount++;
      if (retryCount < maxRetries) {
        console.log('⏳ Esperando 2 segundos antes del siguiente intento...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!profileData) {
      console.error('❌ No se pudo encontrar o crear el perfil después de', maxRetries, 'intentos');
      throw new Error('No se encontró el perfil del usuario. Por favor contacta al administrador o intenta registrarte nuevamente.');
    }

    return { user: authData.user, profile: profileData };
  } catch (error) {
    console.error('💥 Error in signIn:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    checkSupabaseConfig();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    
    // Clear any Supabase-related entries from localStorage to prevent stale tokens
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error in signOut:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    checkSupabaseConfig();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('Usuarios')
      .select('*')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error loading user profile:', profileError);
      return null;
    }

    if (!profileData) {
      console.warn('No user profile found for authenticated user');
      return null;
    }

    return { user, profile: profileData };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const resetPassword = async (email: string) => {
  try {
    checkSupabaseConfig();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getAppUrl()}/reset-password`
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error in resetPassword:', error);
    throw error;
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    checkSupabaseConfig();
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updatePassword:', error);
    throw error;
  }
};

export const resendEmailVerification = async (email: string) => {
  try {
    checkSupabaseConfig();
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${getAppUrl()}/login?verified=true`
      }
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error in resendEmailVerification:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<Usuario>) => {
  try {
    checkSupabaseConfig();
    
    const { data, error } = await supabase
      .from('Usuarios')
      .update(updates)
      .eq('auth_user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
};