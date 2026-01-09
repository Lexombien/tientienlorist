
import { FlowerProduct } from './types';

export const ZALO_NUMBER = '0900000000';

export const DEFAULT_CATEGORIES = [
  'Bó hoa 300-500K',
  'Bó Hoa 1tr',
  'Bó Hoa Lớn',
  'Chậu Giỏ Hoa',
  'Gấu Hoa'
];

export const INITIAL_FLOWERS: FlowerProduct[] = [];

// Helper to generate sample data for demo purposes if localStorage is empty
const generateSamples = () => {
  const samples: FlowerProduct[] = [];
  DEFAULT_CATEGORIES.forEach((cat, catIdx) => {
    for (let i = 1; i <= 8; i++) {
      samples.push({
        id: `${catIdx}-${i}`,
        title: `${cat} Mẫu #${i}`,
        originalPrice: 500000 + (catIdx * 200000),
        salePrice: 400000 + (catIdx * 200000),
        category: cat,
        switchInterval: 3000,
        images: [
          `https://picsum.photos/seed/flower-${catIdx}-${i}-a/600/800`,
          `https://picsum.photos/seed/flower-${catIdx}-${i}-b/600/800`,
          `https://picsum.photos/seed/flower-${catIdx}-${i}-c/600/800`
        ]
      });
    }
  });
  return samples;
};

export const FLOWERS_SAMPLES = generateSamples();
