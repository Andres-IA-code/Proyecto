// Email validation using a more comprehensive regex and DNS checking simulation
export const validateEmail = async (email: string): Promise<{ isValid: boolean; error?: string }> => {
  // Basic format validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }

  // Check for common disposable email domains
  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email'
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  if (disposableDomains.includes(domain)) {
    return { isValid: false, error: 'No se permiten emails temporales' };
  }

  // Check for common valid domains (this is a simplified check)
  const commonDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'live.com',
    'icloud.com',
    'protonmail.com',
    'company.com' // Add more as needed
  ];

  // For demonstration, we'll accept common domains and any .com, .org, .net, .edu domains
  const validTlds = ['.com', '.org', '.net', '.edu', '.gov', '.mx', '.ar', '.cl', '.co'];
  const hasValidTld = validTlds.some(tld => domain.endsWith(tld));

  if (!hasValidTld && !commonDomains.includes(domain)) {
    return { isValid: false, error: 'Dominio de email no válido' };
  }

  return { isValid: true };
};

export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
  return nameRegex.test(name);
};

export const validateDNI = (dni: string): boolean => {
  const dniRegex = /^\d{7,8}$/;
  return dniRegex.test(dni);
};

export const validateCUIT = (cuit: string): boolean => {
  // CUIT should be 11 digits only (no hyphens)
  const cuitRegex = /^\d{11}$/;
  return cuitRegex.test(cuit);
};

export const validatePhone = (phone: string): boolean => {
  // Updated regex for format: +54 9 xxxx-xxxxxx
  const phoneRegex = /^\+54\s9\s\d{4}-\d{6}$/;
  return phoneRegex.test(phone);
};

// Helper function to format phone number as user types
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters except +
  const cleaned = value.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +54, add it
  let formatted = cleaned.startsWith('+54') ? cleaned : '+54' + cleaned.replace(/^\+/, '');
  
  // Remove +54 prefix for processing
  const digits = formatted.replace('+54', '');
  
  // Format based on length
  if (digits.length === 0) {
    return '+54 9 ';
  } else if (digits.length === 1 && digits === '9') {
    return '+54 9 ';
  } else if (digits.length <= 5) {
    // +54 9 xxxx
    const withoutNine = digits.startsWith('9') ? digits.slice(1) : digits;
    return `+54 9 ${withoutNine}`;
  } else if (digits.length <= 11) {
    // +54 9 xxxx-xxxxxx
    const withoutNine = digits.startsWith('9') ? digits.slice(1) : digits;
    const part1 = withoutNine.slice(0, 4);
    const part2 = withoutNine.slice(4, 10);
    return `+54 9 ${part1}${part2 ? '-' + part2 : ''}`;
  }
  
  // Limit to correct format
  const withoutNine = digits.startsWith('9') ? digits.slice(1) : digits;
  const part1 = withoutNine.slice(0, 4);
  const part2 = withoutNine.slice(4, 10);
  return `+54 9 ${part1}-${part2}`;
};