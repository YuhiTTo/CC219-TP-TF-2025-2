"use client"

interface HeaderProps {
  userEmail: string
  onLogout: () => void
}

export default function Header({ userEmail, onLogout }: HeaderProps) {
  return (
    <header className="bg-white shadow-md border-b border-border">
      <div className="container mx-auto px-4 py-6 max-w-7xl flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Demo de Modelos de Análisis de Reseñas</h1>
          <p className="text-sm text-gray-600 mt-1">Amazon Fine Food Reviews</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Conectado como:</p>
            <p className="font-semibold text-foreground">{userEmail}</p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-error hover:bg-error/90 text-white rounded-lg font-semibold transition duration-200"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  )
}
