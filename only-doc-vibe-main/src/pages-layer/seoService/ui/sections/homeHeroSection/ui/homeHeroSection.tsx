import type { HomeHeroSectionProps } from "../model/types";

export const HomeHeroSection: React.FC<HomeHeroSectionProps> = () => {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="mb-4 text-3xl font-bold">Home Main Section</h2>
        <p className="text-gray-600">This is your new home section component</p>
      </div>
    </section>
  );
};
