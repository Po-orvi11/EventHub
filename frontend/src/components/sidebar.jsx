export default function Sidebar({ open }) {
  return (
    <div>
      <div
        className={`
          absolute top-0 left-0
          h-full w-64
          bg-gray-800 text-white
          p-5
          transition-transform duration-300 ease-in-out
          z-50
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        Big Sidebar
      </div>
      
      <div
        className={`
          hidden md:flex
          absolute top-0 left-0
          h-full w-20
          bg-black text-white
          p-5
          items-center flex-col
          transition-all duration-300
          ${open ? "opacity-0" : "opacity-100"}
        `}
      >
        Icons
      </div>

    </div>
  );
}