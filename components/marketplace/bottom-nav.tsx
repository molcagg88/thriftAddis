import { Home, Search, Plus, User } from "lucide-react";

// interface BottomNavProps {
//   onSellClick: () => void;
//   onProfileClick: () => void;
// }

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 md:hidden left-0 right-0 bg-white border-t-2 border-green-600 z-50">
      <div className="flex items-center justify-around py-3">
        {/* Home */}
        <button className="flex flex-col items-center gap-1 p-3 hover:bg-green-50 transition-colors">
          <Home size={24} className="text-green-600" />
          <span className="text-xs text-green-600 font-bold">Home</span>
        </button>

        {/* Search */}
        <button className="flex flex-col items-center gap-1 p-3 hover:bg-green-50 transition-colors">
          <Search size={24} className="text-green-600" />
          <span className="text-xs text-green-600 font-bold">Search</span>
        </button>

        {/* Sell - Center Prominent Button */}
        <button className="flex flex-col items-center gap-1 bg-green-600 text-white p-4 -mt-6 border-2 border-green-600 hover:bg-green-700 transition-colors">
          <Plus size={28} />
          <span className="text-xs font-bold">Sell</span>
        </button>

        {/* Profile */}
        <button className="flex flex-col items-center gap-1 p-3 hover:bg-green-50 transition-colors">
          <User size={24} className="text-green-600" />
          <span className="text-xs text-green-600 font-bold">Profile</span>
        </button>

        {/* Messages */}
        <button className="flex flex-col items-center gap-1 p-3 hover:bg-green-50 transition-colors">
          <div className="relative">
            <div className="w-6 h-6 border-2 border-green-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-green-600">💬</span>
            </div>
          </div>
          <span className="text-xs text-green-600 font-bold">Msgs</span>
        </button>
      </div>
    </nav>
  );
}
