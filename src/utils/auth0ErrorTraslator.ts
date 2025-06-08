export function translateAuth0Error(message: string): string {
    const translations: Record<string, string> = {
    'The user already exists.': 'Este correo ya está registrado.',
    'Password is too weak.': 'La contraseña es demasiado débil.',
    'Wrong email or password.': 'Correo o contraseña incorrectos.',
    'invalid_request': 'Solicitud inválida.',
    'invalid_grant': 'Credenciales inválidas.',
  };

  return translations[message] || 'Ocurrió un error inesperado.';
}