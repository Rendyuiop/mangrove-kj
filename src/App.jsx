import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Mail,
  Instagram,
  Facebook,
  Globe,
  Phone,
  Camera,
  X,
  Languages,
  Moon,
  Sun,
  Menu,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useSwipeable } from "react-swipeable";

// Impor Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Hook useInView
const useInView = (options) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);
  return [ref, isInView];
};

// Komponen FloraCard
const FloraCard = ({
  plant,
  language,
  t,
  onSelect,
  onOpenGallery,
  isActive,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const startInterval = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % plant.images.length
        );
      }, 3500);
    };
    const stopInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    if (isActive && plant.images.length > 1) {
      startInterval();
    } else {
      stopInterval();
    }
    return () => stopInterval();
  }, [isActive, plant.images.length]);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full
              w-full transition-all duration-500 ease-in-out
              ${
                isActive
                  ? "opacity-100 scale-100 blur-0"
                  : "opacity-70 scale-90 blur-sm transform translate-y-4"
              }`}
    >
      <div className="relative h-72 overflow-hidden">
        {plant.images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${plant.name} ${index + 1}`}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover cursor-pointer transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => onOpenGallery(plant.images, currentImageIndex)}
          />
        ))}
        <div
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          onClick={() => onOpenGallery(plant.images, currentImageIndex)}
        >
          <Camera
            className="text-white bg-black bg-opacity-50 p-2 rounded-full transform hover:scale-110 transition-transform duration-200"
            size={32}
          />
        </div>

        {/* === BAGIAN PAGINATION INTERNAL KARTU YANG DIPERBARUI === */}
        {plant.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-10 bg-black/30 backdrop-blur-sm p-1.5 rounded-full">
            {plant.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ease-out
                           ${
                             index === currentImageIndex
                               ? "w-6 bg-white"
                               : "w-1.5 bg-white/50 hover:bg-white/75"
                           }`}
              />
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {plant.name}
        </h3>
        <p className="text-red-600 dark:text-red-400 font-semibold mb-4">
          {plant.commonName?.[language]}
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-5 text-base leading-relaxed flex-grow line-clamp-3">
          {plant.description?.[language]}
        </p>
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
            {t?.flora?.characteristics}
          </h4>
          <ul className="text-base text-gray-600 dark:text-gray-300 space-y-2">
            {plant.characteristics?.[language]?.map((char, charIndex) => (
              <li key={charIndex} className="flex items-center">
                <span className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full mr-3"></span>
                {char}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => onSelect(plant)}
          className="w-full mt-auto bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-lg text-base font-semibold"
        >
          {t?.flora?.viewDetail}
        </button>
      </div>
    </div>
  );
};

// Komponen Utama App
const App = () => {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [language, setLanguage] = useState("id");
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  const translations = {
    id: {
      nav: { home: "Beranda", flora: "Flora", map: "Peta", contact: "Kontak" },
      header: {
        title: "Wisata Mangrove Karangjaladri",
        subtitle: "Jelajahi Keindahan Alam Mangrove di Ujung Barat Jawa",
      },
      hero: {
        title: "Wisata Mangrove",
        titleAccent: "Karangjaladri",
        description:
          "Jelajahi keindahan ekosistem mangrove yang masih alami di Desa Karangjaladri, Kecamatan Parigi, Kabupaten Pangandaran",
        exploreBtn: "Jelajahi Flora",
        mapBtn: "Lihat Peta",
      },
      about: {
        title: "Tentang Wisata Mangrove Karangjaladri",
        description:
          "Terletak di pesisir barat Pulau Jawa, wisata mangrove Karangjaladri menawarkan pengalaman unik menjelajahi ekosistem mangrove yang masih alami. Dengan 4 jenis mangrove dan 1 jenis palm nipah, kawasan ini menjadi rumah bagi berbagai spesies flora dan fauna yang dilindungi.",
        floraCount: "5 Jenis Flora",
        floraDesc:
          "4 spesies mangrove dan 1 palm nipah yang dapat Anda pelajari",
        joggingTrack: "Jogging Track",
        joggingDesc:
          "Jalur jogging sepanjang 2 km untuk aktivitas sehat di alam",
        photoSpot: "Spot Foto",
        photoDesc: "Berbagai spot menarik untuk fotografi dan dokumentasi",
      },
      flora: {
        title: "Keanekaragaman Flora",
        subtitle:
          "Temukan 5 jenis tanaman unik yang membentuk ekosistem mangrove Karangjaladri",
        characteristics: "Karakteristik:",
        viewDetail: "Lihat Detail & Galeri",
        detailTitle: "Karakteristik Utama:",
      },
      activities: {
        title: "Aktivitas Wisata",
        subtitle: "Yang Bisa Anda Lakukan",
        list: [
          "Trekking melalui boardwalk kayu",
          "Bird watching dan fotografi alam",
          "Edukasi ekosistem mangrove",
          "Jogging track sepanjang 2 km",
          "Spot foto instagramable",
        ],
        tipsTitle: "Tips Berkunjung",
        tips: [
          "Kenakan pakaian yang nyaman dan sepatu anti selip",
          "Bawa kamera untuk mengabadikan keindahan alam",
          "Waktu terbaik: pagi hari (06:00-10:00) atau sore hari (15:00-18:00)",
          "Jaga kebersihan dan kelestarian lingkungan",
          "Ikuti jalur yang telah ditentukan",
        ],
      },
      map: {
        title: "Peta Lokasi & Persebaran Flora",
        subtitle: "Peta detail persebaran jenis mangrove dan jalur wisata",
        instruction:
          "Gunakan scroll mouse untuk zoom, klik dan geser untuk memindahkan peta.",
        legend: "Legenda Peta",
        legendItems: {
          joggingTrack: "Jogging Track",
          conservation: "Balai Konservasi Mangrove",
          pendopo: "Pendopo",
          tambak: "Tambak Ikan dan Saung Mangrove",
        },
        mangroveTypes: "Jenis Mangrove",
      },
      contact: {
        title: "Hubungi Kami",
        subtitle:
          "Dapatkan informasi lebih lanjut tentang wisata mangrove Karangjaladri",
        contactInfo: "Informasi Kontak",
        socialMedia: "Media Sosial",
        location: "Lokasi",
        locationDesc: "Kunjungi lokasi wisata mangrove kami:",
        openMaps: "Buka di Google Maps",
      },
      footer: {
        copyright:
          "© 2025 Wisata Mangrove Karangjaladri. Desa Karangjaladri, Kecamatan Parigi, Kabupaten Pangandaran.",
        developed: "Dikembangkan oleh TIM KKN-PPM UGM Periode 2 Tahun 2025",
      },
    },
    en: {
      nav: { home: "Home", flora: "Flora", map: "Map", contact: "Contact" },
      header: {
        title: "Karangjaladri Mangrove Tourism",
        subtitle: "Explore the Natural Beauty of Mangroves in West Java",
      },
      hero: {
        title: "Mangrove Tourism",
        titleAccent: "Karangjaladri",
        description:
          "Explore the pristine mangrove ecosystem in Karangjaladri Village, Parigi District, Pangandaran Regency",
        exploreBtn: "Explore Flora",
        mapBtn: "View Map",
      },
      about: {
        title: "About Karangjaladri Mangrove Tourism",
        description:
          "Located on the west coast of Java Island, Karangjaladri mangrove tourism offers a unique experience exploring pristine mangrove ecosystems. With 4 types of mangroves and 1 type of nipah palm, this area is home to various protected flora and fauna species.",
        floraCount: "5 Flora Types",
        floraDesc: "4 mangrove species and 1 nipah palm that you can study",
        joggingTrack: "Jogging Track",
        joggingDesc: "2 km jogging path for healthy activities in nature",
        photoSpot: "Photo Spots",
        photoDesc: "Various attractive spots for photography and documentation",
      },
      flora: {
        title: "Flora Diversity",
        subtitle:
          "Discover 5 unique plant species that form the Karangjaladri mangrove ecosystem",
        characteristics: "Characteristics:",
        viewDetail: "View Details & Gallery",
        detailTitle: "Main Characteristics:",
      },
      activities: {
        title: "Tourism Activities",
        subtitle: "What You Can Do",
        list: [
          "Trekking through wooden boardwalks",
          "Bird watching and nature photography",
          "Mangrove ecosystem education",
          "2 km jogging track",
          "Instagram-worthy photo spots",
        ],
        tipsTitle: "Visiting Tips",
        tips: [
          "Wear comfortable clothes and non-slip shoes",
          "Bring a camera to capture the natural beauty",
          "Best time: morning (06:00-10:00) or afternoon (15:00-18:00)",
          "Maintain cleanliness and environmental conservation",
          "Follow designated paths",
        ],
      },
      map: {
        title: "Location Map & Flora Distribution",
        subtitle:
          "Detailed map of mangrove species distribution and tourism routes",
        instruction:
          "Use mouse scroll to zoom, click and drag to move the map.",
        legend: "Map Legend",
        legendItems: {
          joggingTrack: "Jogging Track",
          conservation: "Mangrove Conservation Hall",
          pendopo: "Pavilion",
          tambak: "Fish Pond and Mangrove Hut",
        },
        mangroveTypes: "Mangrove Types",
      },
      contact: {
        title: "Contact Us",
        subtitle: "Get more information about Karangjaladri mangrove tourism",
        contactInfo: "Contact Information",
        socialMedia: "Social Media",
        location: "Location",
        locationDesc: "Visit our mangrove tourism location:",
        openMaps: "Open in Google Maps",
      },
      footer: {
        copyright:
          "© 2025 Karangjaladri Mangrove Tourism. Karangjaladri Village, Parigi District, Pangandaran Regency.",
        developed: "Developed by UGM KKN-PPM Team Period 2 Year 2025",
      },
    },
  };
  const plantData = [
    {
      id: 1,
      name: "Avicennia sp.",
      commonName: { id: "Api-api", en: "Api-api" },
      description: {
        id: "Mangrove pionir yang tahan terhadap salinitas tinggi. Memiliki akar napas (pneumatophores) yang khas dan bunga putih kecil. Berperan penting dalam stabilisasi pantai dan habitat satwa laut.",
        en: "Pioneer mangrove that is resistant to high salinity. Has distinctive breathing roots (pneumatophores) and small white flowers. Plays an important role in coastal stabilization and marine wildlife habitat.",
      },
      characteristics: {
        id: ["Toleran garam tinggi", "Akar napas unik", "Bunga putih harum"],
        en: [
          "High salt tolerance",
          "Unique breathing roots",
          "Fragrant white flowers",
        ],
      },
      images: [
        "/images/avicennia1.jpeg",
        "/images/avicennia2.jpeg",
        "/images/avicennia3.jpeg",
      ],
    },
    {
      id: 2,
      name: "Bruguiera sp.",
      commonName: { id: "Tanjang", en: "Tanjang" },
      description: {
        id: "Mangrove dengan sistem akar lutut yang khas. Memiliki bunga merah muda dan propagul yang panjang. Kayunya keras dan sering digunakan untuk konstruksi tradisional.",
        en: "Mangrove with distinctive knee root system. Has pink flowers and long propagules. Its wood is hard and often used for traditional construction.",
      },
      characteristics: {
        id: ["Akar lutut kokoh", "Bunga merah muda", "Kayu berkualitas tinggi"],
        en: ["Strong knee roots", "Pink flowers", "High quality wood"],
      },
      images: [
        "/images/brugeir1.jpeg",
        "/images/brugeir2.jpeg",
        "/images/brugeir3.jpeg",
      ],
    },
    {
      id: 3,
      name: "Nypa fruticans",
      commonName: { id: "Nipah", en: "Nipah Palm" },
      description: {
        id: "Palm air tawar yang tumbuh di muara sungai. Daunnya digunakan untuk atap tradisional, buahnya dapat diolah menjadi gula aren, dan sagunya dapat dikonsumsi.",
        en: "Freshwater palm that grows in river estuaries. Its leaves are used for traditional roofing, its fruit can be processed into palm sugar, and its sago is edible.",
      },
      characteristics: {
        id: ["Daun untuk atap", "Buah penghasil gula", "Sagu bergizi"],
        en: ["Leaves for roofing", "Sugar-producing fruit", "Nutritious sago"],
      },
      images: [
        "/images/nypa1.jpeg",
        "/images/nypa2.jpeg",
        "/images/nypa3.jpeg",
      ],
    },
    {
      id: 4,
      name: "Rhizophora sp.",
      commonName: { id: "Bakau", en: "Red Mangrove" },
      description: {
        id: "Mangrove ikonik dengan akar tunjang yang menjulang tinggi. Sangat efektif dalam mencegah abrasi pantai dan menyediakan nursery ground bagi ikan-ikan muda.",
        en: "Iconic mangrove with tall prop roots. Very effective in preventing coastal erosion and providing nursery grounds for young fish.",
      },
      characteristics: {
        id: ["Akar tunjang tinggi", "Pencegah abrasi", "Nursery ikan"],
        en: ["Tall prop roots", "Erosion prevention", "Fish nursery"],
      },
      images: [
        "/images/rhyzo1.jpeg",
        "/images/rhyzo2.jpeg",
        "/images/rhyzo3.jpeg",
      ],
    },
    {
      id: 5,
      name: "Sonneratia sp.",
      commonName: { id: "Pedada", en: "Apple Mangrove" },
      description: {
        id: "Mangrove dengan bunga putih yang mekar di malam hari. Buahnya berbentuk bulat dan dapat dimakan. Memiliki akar napas yang menonjol keluar dari lumpur.",
        en: "Mangrove with white flowers that bloom at night. Its fruit is round and edible. Has breathing roots that protrude from the mud.",
      },
      characteristics: {
        id: ["Bunga nokturnal", "Buah dapat dimakan", "Akar napas menonjol"],
        en: ["Nocturnal flowers", "Edible fruit", "Prominent breathing roots"],
      },
      images: [
        "/images/sonneratia1.jpeg",
        "/images/sonneratia2.jpeg",
        "/images/sonneratia3.jpeg",
      ],
    },
  ];

  const t = translations?.[language];
  const showNextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  const showPrevImage = () =>
    setCurrentImageIndex(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length
    );
  const openImageModal = (images, index) => {
    setGalleryImages(images);
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };
  const swipeHandlers = useSwipeable({
    onSwipedLeft: showNextImage,
    onSwipedRight: showPrevImage,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });
  const toggleLanguage = () => setLanguage(language === "id" ? "en" : "id");
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const scrollToTop = () => {
    document
      .getElementById("main-scroll-container")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const scrollToSection = (sectionId) => {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const scrollContainer = document.getElementById("main-scroll-container");
    const handleMainScroll = () => {
      if (!scrollContainer) return;
      const totalScroll = scrollContainer.scrollTop;
      const windowHeight =
        scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const scroll = windowHeight > 0 ? totalScroll / windowHeight : 0;
      setScrollProgress(scroll);
      setShowScrollTop(totalScroll > 500);
      if (totalScroll < window.innerHeight) {
        setParallaxOffset(totalScroll * 0.4);
      }
    };
    if (scrollContainer)
      scrollContainer.addEventListener("scroll", handleMainScroll);
    handleMainScroll();
    return () => {
      if (scrollContainer)
        scrollContainer.removeEventListener("scroll", handleMainScroll);
    };
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  return (
    <div
      id="main-scroll-container"
      className={`h-screen overflow-y-scroll snap-y snap-mandatory transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900" : "bg-white"
      }`}
    >
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
        <div
          className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      <header className="bg-red-800 dark:bg-gray-800 text-white sticky top-1 z-40 shadow-lg transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center transform hover:scale-110 transition-transform duration-200">
                <img
                  src="/images/logo-desa.png"
                  alt="Wisata Mangrove Karangjaladri Icon"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">
                  {t?.header?.title}
                </h1>
                <p className="text-red-200 dark:text-gray-300 text-xs sm:text-sm">
                  {t?.header?.subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <nav className="hidden md:flex space-x-6">
                {Object.entries(t?.nav || {}).map(([key, value]) => (
                  <a
                    key={key}
                    href={`#${key}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(key);
                    }}
                    className="relative hover:text-red-200 dark:hover:text-gray-300 transition-colors duration-200 group"
                  >
                    {value}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-200 dark:bg-gray-300 group-hover:w-full transition-all duration-300"></span>
                  </a>
                ))}
              </nav>
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-lg bg-red-700 dark:bg-gray-700 hover:bg-red-600 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-110"
                title={
                  darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-2 bg-red-700 dark:bg-gray-700 hover:bg-red-600 dark:hover:bg-gray-600 px-3 py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105"
                title={
                  language === "id"
                    ? "Switch to English"
                    : "Ganti ke Bahasa Indonesia"
                }
              >
                <Languages size={18} />
                <span className="text-sm font-medium">
                  {language === "id" ? "EN" : "ID"}
                </span>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-lg bg-red-700 dark:bg-gray-700 hover:bg-red-600 dark:hover:bg-gray-600 transition-all duration-200"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-red-700 dark:border-gray-700">
              <nav className="flex flex-col space-y-3 mt-4">
                {Object.entries(t?.nav || {}).map(([key, value]) => (
                  <a
                    key={key}
                    href={`#${key}`}
                    className="hover:text-red-200 dark:hover:text-gray-300 transition-colors duration-200 py-3 px-4 rounded-lg hover:bg-red-700 dark:hover:bg-gray-700 text-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(key);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {value}
                  </a>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      <section id="home" className="relative h-screen snap-start">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/mangrove-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-40 dark:bg-opacity-60"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div
            className="max-w-2xl text-white animate-fade-in"
            style={{ transform: `translateY(${parallaxOffset}px)` }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-slide-up">
              {t?.hero?.title}
              <span className="block text-red-300 dark:text-red-400">
                {t?.hero?.titleAccent}
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-slide-up animation-delay-200">
              {t?.hero?.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up animation-delay-400">
              <button
                onClick={() => scrollToSection("flora")}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
              >
                {t?.hero?.exploreBtn}
              </button>
              <button
                onClick={() => scrollToSection("map")}
                className="border-2 border-white text-white hover:bg-white hover:text-red-600 dark:hover:text-red-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
              >
                {t?.hero?.mapBtn}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-800 snap-start flex items-center justify-center min-h-screen"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-8 animate-fade-in">
              {t?.about?.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 lg:mb-16 leading-relaxed animate-fade-in animation-delay-200">
              {t?.about?.description}
            </p>
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mt-16">
              {[
                {
                  emoji: "🌿",
                  title: t?.about?.floraCount,
                  desc: t?.about?.floraDesc,
                },
                {
                  emoji: "🚶",
                  title: t?.about?.joggingTrack,
                  desc: t?.about?.joggingDesc,
                },
                {
                  emoji: "📸",
                  title: t?.about?.photoSpot,
                  desc: t?.about?.photoDesc,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="text-center group animate-fade-in"
                  style={{ animationDelay: `${(index + 3) * 200}ms` }}
                >
                  <div className="w-20 h-20 bg-red-600 dark:bg-red-700 rounded-full flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 group-hover:shadow-lg">
                    <span className="text-white text-3xl">{item.emoji}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="flora"
        className="py-20 lg:py-28 bg-white dark:bg-gray-900 snap-start flex flex-col justify-center min-h-screen overflow-hidden"
      >
        <div className="w-full">
          <div className="text-center mb-12 px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              {t?.flora?.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t?.flora?.subtitle}
            </p>
          </div>

          <div className="w-full">
            <Swiper
              grabCursor={true}
              centeredSlides={true}
              loop={true}
              navigation={true}
              pagination={{ clickable: true }}
              modules={[Pagination, Navigation]}
              className="py-8"
              breakpoints={{
                320: { slidesPerView: 1.2, spaceBetween: 10 },
                768: { slidesPerView: 2, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
              }}
            >
              {plantData.map((plant) => (
                <SwiperSlide key={plant.id}>
                  {({ isActive }) => (
                    <FloraCard
                      plant={plant}
                      language={language}
                      t={t}
                      onSelect={setSelectedPlant}
                      onOpenGallery={openImageModal}
                      isActive={isActive}
                    />
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      <section
        id="activities"
        className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-800 snap-start flex items-center min-h-screen"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4 animate-fade-in">
              {t?.activities?.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-fade-in animation-delay-200">
              {t?.activities?.subtitle}
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fade-in animation-delay-400">
              <ul className="space-y-4">
                {t?.activities?.list?.map((activity, index) => (
                  <li
                    key={index}
                    className="flex items-center text-gray-700 dark:text-gray-300 p-4 rounded-lg hover:bg-red-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 group text-lg"
                  >
                    <span className="w-3 h-3 bg-red-600 dark:bg-red-400 rounded-full mr-4 flex-shrink-0 group-hover:animate-pulse"></span>
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2 animate-fade-in animation-delay-600">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">💡</span>{" "}
                {t?.activities?.tipsTitle}
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 space-y-4 text-base">
                {t?.activities?.tips?.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start transition-transform duration-200 hover:translate-x-2"
                  >
                    <span className="text-red-500 mr-3 mt-1">•</span>
                    <span>{tip.replace("• ", "")}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        id="map"
        className="py-20 lg:py-28 bg-white dark:bg-gray-900 snap-start flex items-center min-h-screen"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              {t?.map?.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t?.map?.subtitle}
            </p>
          </div>
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 sm:p-8 shadow-lg transition-colors duration-300">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-2 sm:p-4 shadow-inner cursor-grab active:cursor-grabbing">
                <TransformWrapper>
                  <TransformComponent>
                    <img
                      src="/images/mangrove_fix.png"
                      loading="lazy"
                      alt="Peta Persebaran Mangrove Karangjaladri"
                      className="w-full h-auto rounded-lg"
                    />
                  </TransformComponent>
                </TransformWrapper>
                <p className="text-center text-gray-600 dark:text-gray-400 mt-4 text-sm">
                  {t?.map?.instruction}
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-4">
                  {t?.map?.legend}
                </h3>
                <div className="space-y-3">
                  {Object.entries(t?.map?.legendItems || {}).map(
                    ([key, value]) => (
                      <div key={key} className="flex items-center group">
                        <div
                          className={`w-4 h-4 ${
                            {
                              joggingTrack: "bg-orange-600",
                              conservation: "bg-red-500",
                              pendopo: "bg-green-600",
                              tambak: "bg-blue-500",
                            }[key]
                          } rounded mr-3 transform group-hover:scale-125 transition-transform duration-200`}
                        ></div>
                        <span className="text-gray-700 dark:text-gray-300">
                          {value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-4">
                  {t?.map?.mangroveTypes}
                </h3>
                <div className="space-y-3 text-base">
                  <div className="flex items-center gap-3 group">
                    <div className="w-5 h-5 rounded-sm bg-[#DDE0C5] transform group-hover:scale-125 transition-transform duration-200"></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      Avicennia sp.
                    </span>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="w-5 h-5 rounded-sm bg-slate-400 dark:bg-slate-500 transform group-hover:scale-125 transition-transform duration-200"></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      Bruguiera sp.
                    </span>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="w-5 h-5 rounded-sm bg-sky-200 dark:bg-sky-800 transform group-hover:scale-125 transition-transform duration-200"></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      Rhizophora sp.
                    </span>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="w-5 h-5 rounded-sm bg-green-200 dark:bg-green-800 transform group-hover:scale-125 transition-transform duration-200"></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      Sonneratia sp.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="min-h-screen snap-start flex flex-col transition-colors duration-300"
      >
        <div className="bg-red-800 dark:bg-gray-800 text-white flex-grow flex items-center justify-center py-20 lg:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t?.contact?.title}
              </h2>
              <p className="text-red-200 dark:text-gray-300 max-w-2xl mx-auto text-lg">
                {t?.contact?.subtitle}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
              <div className="bg-red-700 dark:bg-gray-700 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                <h3 className="text-2xl font-semibold mb-6 flex items-center">
                  <Phone className="mr-3" /> {t?.contact?.contactInfo}
                </h3>
                <div className="space-y-4">
                  <a
                    href="mailto:desakarangjaladri2020@gmail.com"
                    className="flex items-center group"
                  >
                    <Mail
                      className="mr-4 text-red-200 dark:text-gray-300 group-hover:text-white transition-colors duration-200 flex-shrink-0"
                      size={20}
                    />
                    <span className="group-hover:text-white transition-colors duration-200 break-all">
                      desakarangjaladri2020@gmail.com
                    </span>
                  </a>
                  <div className="flex items-center group">
                    <MapPin
                      className="mr-4 text-red-200 dark:text-gray-300 group-hover:text-white transition-colors duration-200 flex-shrink-0"
                      size={20}
                    />
                    <span className="group-hover:text-white transition-colors duration-200">
                      Desa Karangjaladri, Kec. Parigi, Kab. Pangandaran
                    </span>
                  </div>
                  <a
                    href="https://www.karangjaladri.desa.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center group"
                  >
                    <Globe
                      className="mr-4 text-red-200 dark:text-gray-300 group-hover:text-white transition-colors duration-200 flex-shrink-0"
                      size={20}
                    />
                    <span className="group-hover:text-white transition-colors duration-200">
                      www.karangjaladri.desa.id
                    </span>
                  </a>
                </div>
              </div>
              <div className="bg-red-700 dark:bg-gray-700 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                <h3 className="text-2xl font-semibold mb-6">
                  {t?.contact?.socialMedia}
                </h3>
                <div className="flex space-x-4">
                  <a
                    href="https://www.instagram.com/pemdeskarangjaladri"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram"
                    className="bg-red-600 dark:bg-gray-600 p-4 rounded-lg hover:bg-red-500 dark:hover:bg-gray-500 transition-all duration-300 transform hover:scale-110 active:scale-95"
                  >
                    <Instagram size={24} />
                  </a>
                  <a
                    href="https://www.facebook.com/share/15v8mJFUnv/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Facebook"
                    className="bg-red-600 dark:bg-gray-600 p-4 rounded-lg hover:bg-red-500 dark:hover:bg-gray-500 transition-all duration-300 transform hover:scale-110 active:scale-95"
                  >
                    <Facebook size={24} />
                  </a>
                </div>
              </div>
              <div className="bg-red-700 dark:bg-gray-700 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                <h3 className="text-2xl font-semibold mb-6">
                  {t?.contact?.location}
                </h3>
                <p className="mb-4">{t?.contact?.locationDesc}</p>
                <a
                  href="https://maps.app.goo.gl/kXRHfct22GhH8bs36?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-white text-red-800 px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-800 focus:ring-white"
                >
                  <MapPin className="mr-2" size={18} />
                  {t?.contact?.openMaps}
                </a>
              </div>
            </div>
          </div>
        </div>
        <footer className="bg-gray-900 dark:bg-black text-gray-400 dark:text-gray-500 py-8 transition-colors duration-300">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>{t?.footer?.copyright}</p>
            <p className="mt-2 text-sm">{t?.footer?.developed}</p>
          </div>
        </footer>
      </section>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-red-600 dark:bg-red-700 text-white p-4 rounded-full shadow-lg hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-300 transform hover:scale-110 active:scale-95 animate-fade-in"
          title="Scroll to top"
        >
          <ChevronUp size={24} />
        </button>
      )}

      {selectedPlant && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fade-in-fast">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto transform scale-95 animate-scale-in">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                    {selectedPlant.name}
                  </h2>
                  <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                    {selectedPlant.commonName[language]}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPlant(null)}
                  className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-lg text-gray-800 dark:text-white mb-3">
                    {t?.flora?.detailTitle}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {selectedPlant.description[language]}
                  </p>
                  <ul className="space-y-2">
                    {selectedPlant.characteristics[language].map(
                      (char, index) => (
                        <li
                          key={index}
                          className="flex items-center text-gray-700 dark:text-gray-300"
                        >
                          <span className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full mr-3"></span>
                          {char}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedPlant.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative group overflow-hidden rounded-lg"
                    >
                      <img
                        src={image}
                        alt={`${selectedPlant.name} ${index + 1}`}
                        loading="lazy"
                        className="w-full h-40 object-cover rounded-lg cursor-pointer transform group-hover:scale-110 transition-transform duration-300"
                        onClick={() =>
                          openImageModal(selectedPlant.images, index)
                        }
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300">
                        <Camera
                          className="text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300"
                          size={32}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImageModal && (
        <div
          {...swipeHandlers}
          className="fixed inset-0 bg-black bg-opacity-90 z-60 flex items-center justify-center p-4 animate-fade-in-fast"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-20 p-2 bg-black/30 rounded-full transition-colors"
          >
            <X size={32} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              showPrevImage();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors z-20"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              showNextImage();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors z-20"
          >
            <ChevronRight size={32} />
          </button>
          <div
            className="w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryImages[currentImageIndex]}
              alt={`Gallery image ${currentImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg transform scale-95 animate-scale-in select-none"
            />
          </div>
        </div>
      )}

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-fast {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-fade-in-fast {
          animation: fade-in-fast 0.3s ease-out forwards;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        .animation-delay-600 {
          animation-delay: 600ms;
        }
        input::placeholder,
        textarea::placeholder {
          color: #9ca3af;
        }
        .dark input::placeholder,
        .dark textarea::placeholder {
          color: #6b7280;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .swiper-slide {
          display: flex;
          justify-content: center;
          align-items: center;
          height: auto;
          padding-top: 1rem;
          padding-bottom: 3rem;
        }

        .swiper-button-next,
        .swiper-button-prev {
          color: #ef4444;
          transform: scale(0.8);
        }

        /* === BAGIAN PAGINATION UTAMA YANG DIPERBARUI === */
        .swiper-pagination {
          position: absolute;
          bottom: 0.75rem;
          left: 0;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .swiper-pagination-bullet {
          /* Gaya kapsul/pil */
          width: 0.5rem;
          height: 0.5rem;
          display: block;
          background: #d1d5db;
          border-radius: 9999px;
          opacity: 1;
          transition: width 0.3s ease, background-color 0.3s ease;
          cursor: pointer;
        }

        .swiper-pagination-bullet:hover {
          background: #9ca3af;
        }

        .swiper-pagination-bullet-active {
          width: 2rem; /* Memanjang saat aktif */
          background-color: #ef4444 !important;
        }

        @media (max-width: 640px) {
          .swiper-button-next,
          .swiper-button-prev {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
