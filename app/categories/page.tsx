import { mockCategories } from '@/lib/mockData';
import CategoryCard from '@/components/category-card';
import { FaTrophy, FaMoneyBillWave, FaStar } from 'react-icons/fa';

export default function CategoriesPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="w-full h-[330px] mb-12 relative">
        <img
          src="/gallery-banner.jpg"
          alt="Meme Battle Categories Header"
          className="w-full h-full object-cover"
        />
        {/* Text Overlay */}
        <div className="absolute inset-0 flex flex-col justify-center ml-10">
          <div className="p-6 rounded-lg">
            <h1
              className="text-5xl font-extrabold mb-2 mt-4"
              style={{
                color: '#ff00ff', // Neon pink
                textShadow: '0 0 5px #ff00ff, 0 0 10px #ff00ff',
              }}
            >
              Create memes, earn money
            </h1>
            {/* New Elements Below */}
            <div className="flex flex-row items-center mt-4 space-x-4">
              <div className="flex flex-col items-center">
                <FaTrophy className="text-yellow-500 text-3xl" />
                <span className="text-sm text-white mt-1">Win Prizes</span>
              </div>
              <div className="flex flex-col items-center">
                <FaMoneyBillWave className="text-yellow-500 text-3xl" />
                <span className="text-sm text-white mt-1">Earn Money</span>
              </div>
              <div className="flex flex-col items-center">
                <FaStar className="text-yellow-500 text-3xl" />
                <span className="text-sm text-white mt-1">Get Featured</span>
              </div>
            </div>
            <p
              className="text-lg max-w-md mt-8"
              style={{
                color: '#ffffff', // White with glow
                textShadow: '0 0 5px #ffffff, 0 0 10px #ffffff',
              }}
            >
              Join our Meme Contests & Earn Rewards!
            </p>
          </div>
        </div>
        <div
          className="absolute bottom-0 left-0 w-full h-14"
          style={{
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
          }}
        ></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Meme Battle Categories</h1>
          <p className="text-muted-foreground">
            Browse all categories and find the perfect battle for your memes
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
}
