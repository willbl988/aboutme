export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Golf Tracker</h3>
          <p className="text-gray-400 mb-4">
            Track your golf rounds and scores in real-time with friends.
          </p>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Golf Tracker. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

