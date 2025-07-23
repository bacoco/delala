export default function LoadingResults() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-64 mb-8"></div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-3 flex-1">
                  <div className="flex gap-3">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="space-y-2 text-center">
                      <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                      <div className="h-px bg-gray-200"></div>
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="h-8 bg-gray-200 rounded w-16 ml-auto"></div>
                      <div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div>
                    </div>
                  </div>
                </div>
                <div className="ml-6">
                  <div className="h-10 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center mt-8">
        <span className="spinner"></span>
        <p className="text-gray-600 mt-4">Recherche des trains en cours...</p>
      </div>
    </div>
  )
}