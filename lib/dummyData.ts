export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  seller: string;
  sellerId: string;
}

export const products: Product[] = [
  {
    id: "1",
    title: "Vintage Band Tee - Nirvana",
    price: 45,
    image: "/products/1.jpg",
    seller: "@thrifted.dreams",
    sellerId: "seller1",
  },
  {
    id: "2",
    title: "Carhartt Brown Jacket",
    price: 85,
    image: "/products/2.jpg",
    seller: "@streetvibe",
    sellerId: "seller2",
  },
  {
    id: "3",
    title: "Levi's 501 Denim - Blue",
    price: 65,
    image: "/products/3.jpg",
    seller: "@denim.collector",
    sellerId: "seller3",
  },
  {
    id: "4",
    title: "Baggy Cargo Pants",
    price: 55,
    image: "/products/4.jpg",
    seller: "@thrifted.dreams",
    sellerId: "seller1",
  },
  {
    id: "5",
    title: "Y2K Baby Tee Pink",
    price: 35,
    image: "/products/5.jpg",
    seller: "@gen.z.closet",
    sellerId: "seller4",
  },
  {
    id: "6",
    title: "Oversized Flannel Shirt",
    price: 48,
    image: "/products/6.jpg",
    seller: "@streetvibe",
    sellerId: "seller2",
  },
  {
    id: "7",
    title: "Vintage Adidas Windbreaker",
    price: 72,
    image: "/products/7.jpg",
    seller: "@retro.fits",
    sellerId: "seller5",
  },
  {
    id: "8",
    title: "Leather Biker Jacket",
    price: 120,
    image: "/products/8.jpg",
    seller: "@denim.collector",
    sellerId: "seller3",
  },
];
