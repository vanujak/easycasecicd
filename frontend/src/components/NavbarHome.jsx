import { Link, NavLink } from "react-router-dom";
import { useState } from "react";


export default function NavbarHome() {
  const [open, setOpen] = useState(false);
  
  const base = "px-3 py-2 rounded-lg font-medium text-lg transition-colors hover:bg-blue-50 hover:text-blue-700";
  const active = "px-3 py-2 rounded-lg font-semibold text-lg bg-blue-100 text-blue-800";

  const cls = ({ isActive }) => (isActive ? active : base);


  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-6xl h-20 px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/easy-case-logo.png" alt="EasyCase logo" className="h-15 w-15 object-contain" />
          <span className="!text-[30px] font-semibold">EasyCase</span>
        </Link>


        {/* Animated hamburger button */}
        <button 
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setOpen(v => !v)} 
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <rect 
              className={`origin-center transition-all duration-300 ease-out ${
                open 
                  ? 'translate-y-0 rotate-45' 
                  : '-translate-y-[5px]'
              }`}
              y="7" 
              width="16" 
              height="2" 
              rx="1"
            />
            <rect 
              className={`origin-center transition-all duration-300 ease-out ${
                open 
                  ? 'opacity-0 scale-0' 
                  : 'opacity-100 scale-100'
              }`}
              y="7" 
              width="16" 
              height="2" 
              rx="1"
            />
            <rect 
              className={`origin-center transition-all duration-300 ease-out ${
                open 
                  ? 'translate-y-0 -rotate-45' 
                  : 'translate-y-[5px]'
              }`}
              y="7" 
              width="16" 
              height="2" 
              rx="1"
            />
          </svg>
        </button>


        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/login" className={cls}>Log in</NavLink>
          <NavLink to="/signup" className={cls}>Sign up</NavLink>
          <NavLink to="/contact" className={cls}>Contact Us</NavLink>
          <NavLink to="/contact" className={cls}>Test 1</NavLink>
        </div>
      </div>


      {/* Mobile menu with smooth slide-down animation */}
      <div 
        className={`md:hidden border-t bg-white overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2">
          <NavLink to="/login" onClick={() => setOpen(false)} className={cls}>
            Log in
          </NavLink>
          <NavLink to="/signup" onClick={() => setOpen(false)} className={cls}>
            Sign up
          </NavLink>
          <NavLink to="/contact" onClick={() => setOpen(false)} className={cls}>
            Contact Us
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
