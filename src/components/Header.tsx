import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { Link, useLocation } from 'react-router-dom'
import { Sparkles, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/campaigns', label: 'Explore' },
    { path: '/create', label: 'Start a Challenge' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-secondary-800 bg-secondary-900/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">
              Funded<span className="text-primary-400">Plus</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-secondary-400 hover:text-white hover:bg-secondary-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="hidden sm:block px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl transition-all">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-secondary-400 hover:text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-secondary-800">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-secondary-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <SignedOut>
              <div className="mt-4 px-4">
                <SignInButton mode="modal">
                  <button className="w-full px-5 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            </SignedOut>
          </nav>
        )}
      </div>
    </header>
  )
}
