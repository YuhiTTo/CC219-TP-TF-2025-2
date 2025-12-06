// Declaraciones globales de tipos para el proyecto

declare module "*.css" {
  const content: Record<string, string>
  export default content
}

declare module "*.scss" {
  const content: Record<string, string>
  export default content
}

// Tipos para variables de entorno
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    NEXT_PUBLIC_API_URL: string
  }
}
