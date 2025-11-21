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


        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setOpen(v => !v)} aria-label="Toggle menu">
          <svg width="24" height="24" fill="none" stroke="currentColor">
            <path strokeWidth="2" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>


        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/login" className={cls}>Log in</NavLink>
          <NavLink to="/signup" className={cls}>Sign up</NavLink>
          <NavLink to="/contact" className={cls}>Contact Us</NavLink>
        </div>
      </div>


      {open && (
        <div className="md:hidden border-t bg-white">
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
      )}
    </nav>
  );
}
