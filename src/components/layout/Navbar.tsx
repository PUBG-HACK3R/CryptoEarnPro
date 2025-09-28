'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  Settings, 
  LogOut,
  Shield,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, signOut, isAdmin } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  if (!user) return null

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">CryptoEarn Pro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center space-x-2">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            
            <Link href="/plans">
              <Button variant="ghost" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Plans</span>
              </Button>
            </Link>
            
            <Link href="/wallet">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span>Wallet</span>
              </Button>
            </Link>

            {isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Button>
              </Link>
            )}
            
            <Link href="/profile">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Profile</span>
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-border">
            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start space-x-2">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            
            <Link href="/plans" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Plans</span>
              </Button>
            </Link>
            
            <Link href="/wallet" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start space-x-2">
                <Wallet className="w-4 h-4" />
                <span>Wallet</span>
              </Button>
            </Link>

            {isAdmin && (
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Button>
              </Link>
            )}
            
            <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start space-x-2">
                <Settings className="w-4 h-4" />
                <span>Profile</span>
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="w-full justify-start space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
