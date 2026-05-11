// Data dummy riders yang sedang ngetem
export type Menu = {
  name: string;
  price: string;
  image: string;
};

export type Rider = {
  id: number;
  brand: string;
  brandShort: string;
  logo: string;
  riderName: string;
  status: "ngetem" | "otw";
  landmark: string;       // patokan singkat
  ngetemSince: string;    // jam mulai ngetem, format "HH:MM"
  distance: string;       // jarak dari user
  lat: number;
  lng: number;
  menus: Menu[];
};

export const riders: Rider[] = [
  {
    id: 1,
    brand: "Jago Coffee",
    brandShort: "Jago",
    logo: "/brand_coffe/Jago.jpeg",
    riderName: "Budi Santoso",
    status: "ngetem",
    landmark: "Depan Alfamart Sudirman",
    ngetemSince: "07:30",
    distance: "0.3 km",
    lat: -7.2575,
    lng: 112.7521,
    menus: [
      { name: "Kopi Susu Jago", price: "Rp 18.000", image: "/brand_coffe/jago/kopi susu jago.png" },
      { name: "Matcha Latte", price: "Rp 20.000", image: "/brand_coffe/jago/matcha.png" },
      { name: "Salted Caramel", price: "Rp 22.000", image: "/brand_coffe/jago/Salted Caramel Latte.png" },
    ],
  },
  {
    id: 2,
    brand: "Kopi Susu Jalanan",
    brandShort: "KSJ",
    logo: "/brand_coffe/KSJ.png",
    riderName: "Andi Prasetyo",
    status: "ngetem",
    landmark: "Parkiran Indomaret Ahmad Yani",
    ngetemSince: "08:00",
    distance: "0.7 km",
    lat: -7.2610,
    lng: 112.7480,
    menus: [
      { name: "Es Kopi Susu", price: "Rp 15.000", image: "/brand_coffe/ksj/es kopi susu.png" },
    ],
  },
  {
    id: 3,
    brand: "Calf",
    brandShort: "Calf",
    logo: "/brand_coffe/Calf.jpeg",
    riderName: "Reza Firmansyah",
    status: "ngetem",
    landmark: "Trotoar Basuki Rahmat",
    ngetemSince: "07:45",
    distance: "1.1 km",
    lat: -7.2545,
    lng: 112.7560,
    menus: [
      { name: "Caramel Jeff", price: "Rp 22.000", image: "/brand_coffe/calf/caramel-jeff.png" },
      { name: "Mocha Jeff", price: "Rp 23.000", image: "/brand_coffe/calf/mocha-jeff.png" },
      { name: "Americano", price: "Rp 15.000", image: "/brand_coffe/calf/americano.png" },
    ],
  },
  {
    id: 4,
    brand: "Jago Coffee",
    brandShort: "Jago",
    logo: "/brand_coffe/Jago.jpeg",
    riderName: "Dimas Wijaya",
    status: "ngetem",
    landmark: "Pintu Perumahan Griya Indah",
    ngetemSince: "08:30",
    distance: "1.5 km",
    lat: -7.2590,
    lng: 112.7440,
    menus: [
      { name: "Citrus Cold Brew", price: "Rp 20.000", image: "/brand_coffe/jago/Citrus Cold Brew.png" },
      { name: "Chocolate", price: "Rp 18.000", image: "/brand_coffe/jago/chocolate.png" },
    ],
  },
  {
    id: 5,
    brand: "Calf",
    brandShort: "Calf",
    logo: "/brand_coffe/Calf.jpeg",
    riderName: "Fajar Nugroho",
    status: "ngetem",
    landmark: "Halte Bus Diponegoro",
    ngetemSince: "09:00",
    distance: "2.0 km",
    lat: -7.2530,
    lng: 112.7590,
    menus: [
      { name: "Liquid Jeff", price: "Rp 24.000", image: "/brand_coffe/calf/liquid-jeff.png" },
      { name: "Es Kopi Reguler", price: "Rp 18.000", image: "/brand_coffe/calf/eskopi-reg.png" },
    ],
  },
];
