import SearchForm from '@/components/SearchForm'
import FavoriteRoutes from '@/components/FavoriteRoutes'
import NotificationSetup from '@/components/NotificationSetup'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-sncf-blue mb-2">
          Recherchez vos trains TGV MAX
        </h2>
        <p className="text-gray-600">
          Vérifiez rapidement la disponibilité des places TGV MAX sur vos trajets préférés
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <SearchForm />
        </div>
        <div className="md:col-span-1 space-y-6">
          <FavoriteRoutes />
          <NotificationSetup />
        </div>
      </div>

      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-sncf-blue mb-2">Comment ça marche ?</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Entrez votre gare de départ et d'arrivée</li>
          <li>Sélectionnez votre date de voyage</li>
          <li>Consultez les trains disponibles avec TGV MAX</li>
          <li>Sauvegardez vos trajets favoris pour un accès rapide</li>
        </ol>
      </div>
    </div>
  )
}