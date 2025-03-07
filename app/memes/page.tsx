import { mockCategories, mockMemes } from '@/lib/mockData';
import MemeCard from '@/components/meme-card';

export default function AllMemesPage() {
    const featuredMemes = mockMemes;
    return (
        <div className="relative overflow-hidden">
            <div className="w-full h-[330px] mb-12 relative">
                <img
                    src="/Meme.png"
                    alt="All Memes Header"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-center ml-10">
                    <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
                        Featured Memes
                    </h1>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-14 bg-black bg-opacity-50 backdrop-blur-md"></div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-2">Trending Memes</h1>
                    <p className="text-muted-foreground">Check out all the hottest memes in the battle!</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featuredMemes.map((meme) => (
                        <MemeCard key={meme.id} meme={meme} showCategory={true} />
                    ))}
                </div>
            </div>
        </div>
    );
}
